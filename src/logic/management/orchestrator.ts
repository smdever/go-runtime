// src/logic/management/orchestrator.ts
import type { ChildProcess } from "node:child_process";

import type { RunSubmission } from "../../contracts/operator.js";
import type { BufferedRuntimeEvent } from "../../contracts/events.js";
import type { RunSnapshot } from "../../contracts/session.js";
import type { WorkerOutboundMessage } from "../../contracts/ipc.js";
import { RuntimeManager } from "../../cluster/runtime-manager.js";

export interface IOrchestratorLike {
  getRunId(): string;
  start(): Promise<void>;
  send(prompt: string): Promise<void>;
  snapshot(): Promise<RunSnapshot | null>;
  getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]>;
  onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void;
  stop(): Promise<void>;
}

export class Orchestrator implements IOrchestratorLike {
  private worker: ChildProcess;
  private lastSnapshot: RunSnapshot | null = null;

  private readonly eventListeners = new Set<(event: BufferedRuntimeEvent) => void>();

  private pendingEventRequests = new Map<
    string,
    {
      resolve: (events: BufferedRuntimeEvent[]) => void;
      reject: (error: Error) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();

  private pendingSnapshotRequest:
    | {
        resolve: (snapshot: RunSnapshot | null) => void;
        reject: (error: Error) => void;
        timeout: ReturnType<typeof setTimeout>;
      }
    | null = null;

  constructor(
    private readonly submission: RunSubmission,
    private readonly runtimeManager: RuntimeManager
  ) {
    this.worker = this.runtimeManager.create(this.submission.runId);

    this.worker.on("message", (message) => {
      const data = message as WorkerOutboundMessage & {
        runId?: string;
        error?: string;
      };

      console.log("Orchestrator worker message:", {
        runId: data.runId ?? this.submission.runId,
        type: data.type,
      });
            
      if (data.type === "worker.snapshot" && data.snapshot) {
        this.lastSnapshot = data.snapshot;

        if (this.pendingSnapshotRequest) {
          clearTimeout(this.pendingSnapshotRequest.timeout);
          this.pendingSnapshotRequest.resolve(data.snapshot);
          this.pendingSnapshotRequest = null;
        }

        return;
      }

      if (data.type === "worker.event" && data.event) {
        for (const listener of this.eventListeners) {
          try {
            listener(data.event);
          } catch (error) {
            console.error("Orchestrator event listener error:", error);
          }
        }
        return;
      }

      if (data.type === "worker.events") {
        const requestKey = this.getEventRequestKey(data.runId);
        const pending = this.pendingEventRequests.get(requestKey);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingEventRequests.delete(requestKey);
          pending.resolve(data.events ?? []);
        }
        return;
      }

      if (data.type === "worker.error") {
        console.error("Worker error:", {
          runId: data.runId,
          error: data.error,
        });

        const requestKey = this.getEventRequestKey(data.runId ?? this.submission.runId);
        const pending = this.pendingEventRequests.get(requestKey);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingEventRequests.delete(requestKey);
          pending.reject(new Error(data.error ?? "Unknown worker error"));
        }

        if (this.pendingSnapshotRequest) {
          clearTimeout(this.pendingSnapshotRequest.timeout);
          this.pendingSnapshotRequest.reject(new Error(data.error ?? "Unknown worker error"));
          this.pendingSnapshotRequest = null;
        }

        return;
      }
    });
  }

  private getEventRequestKey(runId: string): string {
    return `events:${runId}`;
  }

  private sendWorkerCommand(action: string, prompt?: string): void {
    this.worker.send({
      type: action === "start" ? "worker.start" : "worker.command",
      command: {
        runId: this.submission.runId,
        engine: this.submission.engine,
        asset: this.submission.asset,
        action,
        prompt,
        actors: this.submission.actors,
        reasoning: this.submission.reasoning,
      },
    });
  }

  getRunId(): string {
    return this.submission.runId;
  }

  async start(): Promise<void> {
    console.log("Orchestrator.start:", {
      runId: this.submission.runId,
      engine: this.submission.engine,
      asset: this.submission.asset,
    });

    this.sendWorkerCommand("start", this.submission.initialPrompt);
  }

  async send(prompt: string): Promise<void> {
    this.sendWorkerCommand("send", prompt);
  }

  async snapshot(): Promise<RunSnapshot | null> {
    if (this.lastSnapshot) {
      return this.lastSnapshot;
    }

    if (this.pendingSnapshotRequest) {
      return await new Promise<RunSnapshot | null>((resolve, reject) => {
        const current = this.pendingSnapshotRequest;
        if (!current) {
          resolve(this.lastSnapshot);
          return;
        }

        const originalResolve = current.resolve;
        const originalReject = current.reject;

        current.resolve = (snapshot) => {
          originalResolve(snapshot);
          resolve(snapshot);
        };

        current.reject = (error) => {
          originalReject(error);
          reject(error);
        };
      });
    }

    return await new Promise<RunSnapshot | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingSnapshotRequest = null;
        resolve(this.lastSnapshot);
      }, 5000);

      this.pendingSnapshotRequest = {
        resolve,
        reject,
        timeout,
      };

      this.sendWorkerCommand("snapshot");
    });
  }

  async getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]> {
    const runId = this.submission.runId;
    const requestKey = this.getEventRequestKey(runId);

    const existing = this.pendingEventRequests.get(requestKey);
    if (existing) {
      clearTimeout(existing.timeout);
      existing.reject(new Error(`Superseded by a newer events request for runId=${runId}`));
      this.pendingEventRequests.delete(requestKey);
    }

    return await new Promise<BufferedRuntimeEvent[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingEventRequests.delete(requestKey);
        reject(new Error(`Timed out waiting for worker events for runId=${runId}`));
      }, 5000);

      this.pendingEventRequests.set(requestKey, {
        resolve,
        reject,
        timeout,
      });

      this.worker.send({
        type: "worker.events.get",
        runId,
        since,
      });
    });
  }

  onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void {
    this.eventListeners.add(listener);

    return () => {
      this.eventListeners.delete(listener);
    };
  }

  async stop(): Promise<void> {
    for (const pending of this.pendingEventRequests.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(`Run ${this.submission.runId} stopped before events request completed.`));
    }
    this.pendingEventRequests.clear();

    if (this.pendingSnapshotRequest) {
      clearTimeout(this.pendingSnapshotRequest.timeout);
      this.pendingSnapshotRequest.reject(
        new Error(`Run ${this.submission.runId} stopped before snapshot request completed.`)
      );
      this.pendingSnapshotRequest = null;
    }

    this.eventListeners.clear();
    this.runtimeManager.dispose(this.submission.runId);
  }
}



// import type { ChildProcess } from "node:child_process";

// import type { RunSubmission } from "../../contracts/operator.js";
// import type { BufferedRuntimeEvent } from "../../contracts/events.js";
// import type { RunSnapshot } from "../../contracts/session.js";
// import type { WorkerOutboundMessage } from "../../contracts/ipc.js";
// import { RuntimeManager } from "../../cluster/runtime-manager.js";

// export interface IOrchestratorLike {
//   getRunId(): string;
//   start(): Promise<void>;
//   send(prompt: string): Promise<void>;
//   snapshot(): Promise<RunSnapshot | null>;
//   getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]>;
//   onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void;
//   stop(): Promise<void>;
// }

// export class Orchestrator implements IOrchestratorLike {
//   private worker: ChildProcess;
//   private lastSnapshot: RunSnapshot | null = null;

//   private readonly eventListeners = new Set<(event: BufferedRuntimeEvent) => void>();

//   private pendingEventRequests = new Map<
//     string,
//     {
//       resolve: (events: BufferedRuntimeEvent[]) => void;
//       reject: (error: Error) => void;
//       timeout: ReturnType<typeof setTimeout>;
//     }
//   >();

//   private pendingSnapshotRequest:
//     | {
//         resolve: (snapshot: RunSnapshot | null) => void;
//         reject: (error: Error) => void;
//         timeout: ReturnType<typeof setTimeout>;
//       }
//     | null = null;

//   constructor(
//     private readonly submission: RunSubmission,
//     private readonly runtimeManager: RuntimeManager
//   ) {
//     this.worker = this.runtimeManager.create(this.submission.runId);

//     this.worker.on("message", (message) => {
//       const data = message as WorkerOutboundMessage & {
//         runId?: string;
//         error?: string;
//       };

//       console.log("Orchestrator worker message:", data);

//       if (data.type === "worker.snapshot" && data.snapshot) {
//         this.lastSnapshot = data.snapshot;

//         if (this.pendingSnapshotRequest) {
//           clearTimeout(this.pendingSnapshotRequest.timeout);
//           this.pendingSnapshotRequest.resolve(data.snapshot);
//           this.pendingSnapshotRequest = null;
//         }

//         return;
//       }

//       if (data.type === "worker.event" && data.event) {
//         for (const listener of this.eventListeners) {
//           try {
//             listener(data.event);
//           } catch (error) {
//             console.error("Orchestrator event listener error:", error);
//           }
//         }
//         return;
//       }

//       if (data.type === "worker.events") {
//         const requestKey = this.getEventRequestKey(data.runId);
//         const pending = this.pendingEventRequests.get(requestKey);
//         if (pending) {
//           clearTimeout(pending.timeout);
//           this.pendingEventRequests.delete(requestKey);
//           pending.resolve(data.events ?? []);
//         }
//         return;
//       }

//       if (data.type === "worker.error") {
//         console.error("Worker error:", {
//           runId: data.runId,
//           error: data.error,
//         });

//         const requestKey = this.getEventRequestKey(data.runId ?? this.submission.runId);
//         const pending = this.pendingEventRequests.get(requestKey);
//         if (pending) {
//           clearTimeout(pending.timeout);
//           this.pendingEventRequests.delete(requestKey);
//           pending.reject(new Error(data.error ?? "Unknown worker error"));
//         }

//         if (this.pendingSnapshotRequest) {
//           clearTimeout(this.pendingSnapshotRequest.timeout);
//           this.pendingSnapshotRequest.reject(new Error(data.error ?? "Unknown worker error"));
//           this.pendingSnapshotRequest = null;
//         }

//         return;
//       }
//     });
//   }

//   private getEventRequestKey(runId: string): string {
//     return `events:${runId}`;
//   }

//   private sendWorkerCommand(action: string, prompt?: string): void {
//     this.worker.send({
//       type: action === "start" ? "worker.start" : "worker.command",
//       command: {
//         runId: this.submission.runId,
//         engine: this.submission.engine,
//         asset: this.submission.asset,
//         action,
//         prompt,
//         actors: this.submission.actors,
//         reasoning: this.submission.reasoning,
//       },
//     });
//   }

//   getRunId(): string {
//     return this.submission.runId;
//   }

//   async start(): Promise<void> {
//     console.log("Orchestrator.start:", {
//       runId: this.submission.runId,
//       engine: this.submission.engine,
//       asset: this.submission.asset,
//     });

//     this.sendWorkerCommand("start", this.submission.initialPrompt);
//   }

//   async send(prompt: string): Promise<void> {
//     this.sendWorkerCommand("send", prompt);
//   }

//   async snapshot(): Promise<RunSnapshot | null> {
//     if (this.lastSnapshot) {
//       return this.lastSnapshot;
//     }

//     if (this.pendingSnapshotRequest) {
//       return await new Promise<RunSnapshot | null>((resolve, reject) => {
//         const current = this.pendingSnapshotRequest;
//         if (!current) {
//           resolve(this.lastSnapshot);
//           return;
//         }

//         const originalResolve = current.resolve;
//         const originalReject = current.reject;

//         current.resolve = (snapshot) => {
//           originalResolve(snapshot);
//           resolve(snapshot);
//         };

//         current.reject = (error) => {
//           originalReject(error);
//           reject(error);
//         };
//       });
//     }

//     return await new Promise<RunSnapshot | null>((resolve, reject) => {
//       const timeout = setTimeout(() => {
//         this.pendingSnapshotRequest = null;
//         resolve(this.lastSnapshot);
//       }, 5000);

//       this.pendingSnapshotRequest = {
//         resolve,
//         reject,
//         timeout,
//       };

//       this.sendWorkerCommand("snapshot");
//     });
//   }

//   async getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]> {
//     const runId = this.submission.runId;
//     const requestKey = this.getEventRequestKey(runId);

//     const existing = this.pendingEventRequests.get(requestKey);
//     if (existing) {
//       clearTimeout(existing.timeout);
//       existing.reject(new Error(`Superseded by a newer events request for runId=${runId}`));
//       this.pendingEventRequests.delete(requestKey);
//     }

//     return await new Promise<BufferedRuntimeEvent[]>((resolve, reject) => {
//       const timeout = setTimeout(() => {
//         this.pendingEventRequests.delete(requestKey);
//         reject(new Error(`Timed out waiting for worker events for runId=${runId}`));
//       }, 5000);

//       this.pendingEventRequests.set(requestKey, {
//         resolve,
//         reject,
//         timeout,
//       });

//       this.worker.send({
//         type: "worker.events.get",
//         runId,
//         since,
//       });
//     });
//   }

//   onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void {
//     this.eventListeners.add(listener);

//     return () => {
//       this.eventListeners.delete(listener);
//     };
//   }

//   async stop(): Promise<void> {
//     for (const pending of this.pendingEventRequests.values()) {
//       clearTimeout(pending.timeout);
//       pending.reject(new Error(`Run ${this.submission.runId} stopped before events request completed.`));
//     }
//     this.pendingEventRequests.clear();

//     if (this.pendingSnapshotRequest) {
//       clearTimeout(this.pendingSnapshotRequest.timeout);
//       this.pendingSnapshotRequest.reject(
//         new Error(`Run ${this.submission.runId} stopped before snapshot request completed.`)
//       );
//       this.pendingSnapshotRequest = null;
//     }

//     this.eventListeners.clear();
//     this.runtimeManager.dispose(this.submission.runId);
//   }
// }

// // import type { ChildProcess } from "node:child_process";

// // import type { RunSubmission } from "../../contracts/operator.js";
// // import type { BufferedRuntimeEvent } from "../../contracts/events.js";
// // import type { RunSnapshot } from "../../contracts/session.js";
// // import type { WorkerOutboundMessage } from "../../contracts/ipc.js";
// // import { RuntimeManager } from "../../cluster/runtime-manager.js";

// // export interface IOrchestratorLike {
// //   getRunId(): string;
// //   start(): Promise<void>;
// //   send(prompt: string): Promise<void>;
// //   snapshot(): Promise<RunSnapshot | null>;
// //   getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]>;
// //   onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void;
// //   stop(): Promise<void>;
// // }

// // export class Orchestrator implements IOrchestratorLike {
// //   private worker: ChildProcess;
// //   private lastSnapshot: RunSnapshot | null = null;

// //   private readonly eventListeners = new Set<(event: BufferedRuntimeEvent) => void>();
// //   private pendingEventRequests = new Map<
// //     string,
// //     {
// //       resolve: (events: BufferedRuntimeEvent[]) => void;
// //       reject: (error: Error) => void;
// //       timeout: ReturnType<typeof setTimeout>;
// //     }
// //   >();

// //   constructor(
// //     private readonly submission: RunSubmission,
// //     private readonly runtimeManager: RuntimeManager
// //   ) {
// //     this.worker = this.runtimeManager.create(this.submission.runId);

// //     this.worker.on("message", (message) => {
// //       const data = message as WorkerOutboundMessage & {
// //         runId?: string;
// //         error?: string;
// //       };

// //       console.log("Orchestrator worker message:", data);

// //       if (data.type === "worker.snapshot" && data.snapshot) {
// //         this.lastSnapshot = data.snapshot;
// //         return;
// //       }

// //       if (data.type === "worker.event" && data.event) {
// //         for (const listener of this.eventListeners) {
// //           try {
// //             listener(data.event);
// //           } catch (error) {
// //             console.error("Orchestrator event listener error:", error);
// //           }
// //         }
// //         return;
// //       }

// //       if (data.type === "worker.events") {
// //         const requestKey = this.getEventRequestKey(data.runId);
// //         const pending = this.pendingEventRequests.get(requestKey);
// //         if (pending) {
// //           clearTimeout(pending.timeout);
// //           this.pendingEventRequests.delete(requestKey);
// //           pending.resolve(data.events ?? []);
// //         }
// //         return;
// //       }

// //       if (data.type === "worker.error") {
// //         console.error("Worker error:", {
// //           runId: data.runId,
// //           error: data.error,
// //         });

// //         const requestKey = this.getEventRequestKey(data.runId ?? this.submission.runId);
// //         const pending = this.pendingEventRequests.get(requestKey);
// //         if (pending) {
// //           clearTimeout(pending.timeout);
// //           this.pendingEventRequests.delete(requestKey);
// //           pending.reject(new Error(data.error ?? "Unknown worker error"));
// //         }

// //         return;
// //       }
// //     });
// //   }

// //   private getEventRequestKey(runId: string): string {
// //     return `events:${runId}`;
// //   }

// //   private sendWorkerCommand(action: string, prompt?: string): void {
// //     this.worker.send({
// //       type: action === "start" ? "worker.start" : "worker.command",
// //       command: {
// //         runId: this.submission.runId,
// //         engine: this.submission.engine,
// //         asset: this.submission.asset,
// //         action,
// //         prompt,
// //         actors: this.submission.actors,
// //         reasoning: this.submission.reasoning,
// //       },
// //     });
// //   }

// //   getRunId(): string {
// //     return this.submission.runId;
// //   }

// //   async start(): Promise<void> {
// //     console.log("Orchestrator.start:", {
// //       runId: this.submission.runId,
// //       engine: this.submission.engine,
// //       asset: this.submission.asset,
// //     });

// //     this.sendWorkerCommand("start", this.submission.initialPrompt);
// //   }

// //   async send(prompt: string): Promise<void> {
// //     this.sendWorkerCommand("send", prompt);
// //   }

// //   async snapshot(): Promise<RunSnapshot | null> {
// //     return this.lastSnapshot;
// //   }

// //   async getEventsSince(since?: number): Promise<BufferedRuntimeEvent[]> {
// //     const runId = this.submission.runId;
// //     const requestKey = this.getEventRequestKey(runId);

// //     const existing = this.pendingEventRequests.get(requestKey);
// //     if (existing) {
// //       clearTimeout(existing.timeout);
// //       existing.reject(new Error(`Superseded by a newer events request for runId=${runId}`));
// //       this.pendingEventRequests.delete(requestKey);
// //     }

// //     return await new Promise<BufferedRuntimeEvent[]>((resolve, reject) => {
// //       const timeout = setTimeout(() => {
// //         this.pendingEventRequests.delete(requestKey);
// //         reject(new Error(`Timed out waiting for worker events for runId=${runId}`));
// //       }, 5000);

// //       this.pendingEventRequests.set(requestKey, {
// //         resolve,
// //         reject,
// //         timeout,
// //       });

// //       this.worker.send({
// //         type: "worker.events.get",
// //         runId,
// //         since,
// //       });
// //     });
// //   }

// //   onEvent(listener: (event: BufferedRuntimeEvent) => void): () => void {
// //     this.eventListeners.add(listener);

// //     return () => {
// //       this.eventListeners.delete(listener);
// //     };
// //   }

// //   async stop(): Promise<void> {
// //     for (const pending of this.pendingEventRequests.values()) {
// //       clearTimeout(pending.timeout);
// //       pending.reject(new Error(`Run ${this.submission.runId} stopped before events request completed.`));
// //     }
// //     this.pendingEventRequests.clear();

// //     this.eventListeners.clear();
// //     this.runtimeManager.dispose(this.submission.runId);
// //   }
// // }
