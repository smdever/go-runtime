// src/worker.ts
import type { WorkerInboundMessage, WorkerOutboundMessage } from "./contracts/ipc.js";
import type { RuntimeEngine } from "./engine/engine.js";
import { ExecutableEngine } from "./engine/executable-engine.js";
import { InterpretiveEngine } from "./engine/interpretive-engine.js";
import type { RunSubmission } from "./contracts/operator.js";
import type { RunCommand } from "./contracts/session.js";
import type { RuntimeEvent, RuntimeEventName } from "./contracts/events.js";
import { EventBuffer } from "./runtime/event-buffer.js";

let activeEngine: RuntimeEngine | null = null;
let activeRunId: string | null = null;
let unsubscribeEngineEvents: (() => void) | null = null;

const eventBuffer = new EventBuffer({ maxEvents: 100 });

const engines: Record<string, RuntimeEngine> = {
  executable: new ExecutableEngine(),
  interpretive: new InterpretiveEngine(),
};

function post(message: WorkerOutboundMessage): void {
  if (typeof process.send === "function") {
    process.send(message);
  }
}

function publishBufferedEvent<T = unknown>(event: RuntimeEvent<T>): void {
  const buffered = eventBuffer.append(event);
  post({ type: "worker.event", event: buffered });
}

function publishEvent<T = unknown>(
  name: RuntimeEventName,
  options: {
    runId?: string;
    node?: string;
    payload?: T;
  } = {},
): void {
  const runId = options.runId ?? activeRunId;
  if (!runId) return;

  publishBufferedEvent({
    runId,
    name,
    at: Date.now(),
    node: options.node,
    payload: options.payload,
  });
}

function attachEngineEvents(engine: RuntimeEngine): void {
  unsubscribeEngineEvents?.();
  unsubscribeEngineEvents = null;

  if (typeof engine.subscribe !== "function") {
    return;
  }

  unsubscribeEngineEvents = engine.subscribe((event) => {
    publishBufferedEvent(event);
  });
}

process.on("message", async (raw) => {
  const message = raw as WorkerInboundMessage;
  console.log("Worker received message:", {
    type: message.type,
    runId: (message as any)?.command?.runId ?? (message as any)?.runId,
    engine: (message as any)?.command?.engine,
    action: (message as any)?.command?.action,
    asset: (message as any)?.command?.asset
      ? {
          id: (message as any).command.asset.id,
          kind: (message as any).command.asset.kind,
          path: (message as any).command.asset.path,
          inlineContent: (message as any).command.asset.inlineContent
            ? `[inline executable ${(message as any).command.asset.inlineContent.length} chars]`
            : undefined,
        }
      : undefined,
  });

  try {
    if (message.type === "worker.start") {
      const submission = message.command as RunSubmission;

      const engine = engines[submission.engine];
      if (!engine) {
        throw new Error(`Unknown engine: ${submission.engine}`);
      }

      activeEngine = engine;
      activeRunId = submission.runId;
      eventBuffer.clear();
      attachEngineEvents(activeEngine);

      publishEvent("run.started", {
        runId: submission.runId,
        payload: {
          engine: submission.engine,
          asset: submission.asset,
        },
      });

      const snapshot = await activeEngine.start(submission);

      publishEvent("run.state_changed", {
        runId: submission.runId,
        payload: {
          status: snapshot.status,
          activeNode: snapshot.activeNode ?? null,
        },
      });

      post({ type: "worker.snapshot", snapshot });
      return;
    }

    if (message.type === "worker.command") {
      if (!activeEngine) {
        throw new Error("No active engine. Start a run first.");
      }

      const command = message.command as RunCommand;

      console.log("Worker dispatching command:", {
        type: message.type,
        action: command.action,
        runId: command.runId,
      });

      const snapshot =
        command.action === "send" ? await activeEngine.send(command) :
        command.action === "continue" ? await activeEngine.continue(command) :
        command.action === "pause" ? await activeEngine.pause(command) :
        command.action === "resume" ? await activeEngine.resume(command) :
        command.action === "retry" ? await activeEngine.retry(command) :
        command.action === "stop" ? await activeEngine.stop(command) :
        await activeEngine.snapshot(command.runId);

      publishEvent("run.state_changed", {
        runId: command.runId,
        payload: {
          action: command.action,
          status: snapshot.status,
          activeNode: snapshot.activeNode ?? null,
        },
      });

      if (snapshot.status === "completed") {
        publishEvent("run.completed", {
          runId: command.runId,
          payload: {
            activeNode: snapshot.activeNode ?? null,
          },
        });
      }

      if (command.action === "stop") {
        publishEvent("run.stopped", {
          runId: command.runId,
        });
      }

      post({ type: "worker.snapshot", snapshot });
      return;
    }

    if (message.type === "worker.events.get") {
      const events = eventBuffer.getSince(message.since);
      post({
        type: "worker.events",
        runId: message.runId,
        events,
      });
      return;
    }

    if (message.type === "worker.stop") {
      publishEvent("run.stopped", {
        runId: message.runId,
      });

      unsubscribeEngineEvents?.();
      unsubscribeEngineEvents = null;

      post({ type: "worker.ready", runId: message.runId });
      process.exit(0);
    }
  } catch (error) {
    const runId =
      (message as any)?.command?.runId ??
      (message as any)?.runId ??
      activeRunId ??
      "unknown";

    publishEvent("run.failed", {
      runId,
      payload: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    post({
      type: "worker.error",
      runId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});


// // src/worker.ts
// import type { WorkerInboundMessage, WorkerOutboundMessage } from "./contracts/ipc.js";
// import type { RuntimeEngine } from "./engine/engine.js";
// import { ExecutableEngine } from "./engine/executable-engine.js";
// import { InterpretiveEngine } from "./engine/interpretive-engine.js";
// import type { RunSubmission } from "./contracts/operator.js";
// import type { RunCommand } from "./contracts/session.js";
// import type { RuntimeEvent, RuntimeEventName } from "./contracts/events.js";
// import { EventBuffer } from "./runtime/event-buffer.js";

// let activeEngine: RuntimeEngine | null = null;
// let activeRunId: string | null = null;

// const eventBuffer = new EventBuffer({ maxEvents: 100 });

// const engines: Record<string, RuntimeEngine> = {
//   executable: new ExecutableEngine(),
//   interpretive: new InterpretiveEngine(),
// };

// function post(message: WorkerOutboundMessage): void {
//   if (typeof process.send === "function") {
//     process.send(message);
//   }
// }

// function publishEvent<T = unknown>(
//   name: RuntimeEventName,
//   options: {
//     runId?: string;
//     node?: string;
//     payload?: T;
//   } = {},
// ): void {
//   const runId = options.runId ?? activeRunId;
//   if (!runId) return;

//   const event: RuntimeEvent<T> = {
//     runId,
//     name,
//     at: Date.now(),
//     node: options.node,
//     payload: options.payload,
//   };

//   const buffered = eventBuffer.append(event);
//   post({ type: "worker.event", event: buffered });
// }

// process.on("message", async (raw) => {
//   const message = raw as WorkerInboundMessage;
//   console.log("Worker received message:", message);

//   try {
//     if (message.type === "worker.start") {
//       const submission = message.command as RunSubmission;

//       const engine = engines[submission.engine];
//       if (!engine) {
//         throw new Error(`Unknown engine: ${submission.engine}`);
//       }

//       activeEngine = engine;
//       activeRunId = submission.runId;
//       eventBuffer.clear();

//       publishEvent("run.started", {
//         runId: submission.runId,
//         payload: {
//           engine: submission.engine,
//           asset: submission.asset,
//         },
//       });

//       const snapshot = await activeEngine.start(submission);

//       publishEvent("run.state_changed", {
//         runId: submission.runId,
//         payload: {
//           status: snapshot.status,
//           activeNode: snapshot.activeNode ?? null,
//         },
//       });

//       post({ type: "worker.snapshot", snapshot });
//       return;
//     }

//     if (message.type === "worker.command") {
//       if (!activeEngine) {
//         throw new Error("No active engine. Start a run first.");
//       }

//       const command = message.command as RunCommand;

//       console.log("Worker dispatching command:", {
//         type: message.type,
//         action: command.action,
//         runId: command.runId,
//       });

//       const snapshot =
//         command.action === "send" ? await activeEngine.send(command) :
//         command.action === "continue" ? await activeEngine.continue(command) :
//         command.action === "pause" ? await activeEngine.pause(command) :
//         command.action === "resume" ? await activeEngine.resume(command) :
//         command.action === "retry" ? await activeEngine.retry(command) :
//         command.action === "stop" ? await activeEngine.stop(command) :
//         await activeEngine.snapshot(command.runId);

//       publishEvent("run.state_changed", {
//         runId: command.runId,
//         payload: {
//           action: command.action,
//           status: snapshot.status,
//           activeNode: snapshot.activeNode ?? null,
//         },
//       });

//       if (snapshot.status === "completed") {
//         publishEvent("run.completed", {
//           runId: command.runId,
//           payload: {
//             activeNode: snapshot.activeNode ?? null,
//           },
//         });
//       }

//       if (command.action === "stop") {
//         publishEvent("run.stopped", {
//           runId: command.runId,
//         });
//       }

//       post({ type: "worker.snapshot", snapshot });
//       return;
//     }

//     if (message.type === "worker.events.get") {
//       const events = eventBuffer.getSince(message.since);
//       post({
//         type: "worker.events",
//         runId: message.runId,
//         events,
//       });
//       return;
//     }

//     if (message.type === "worker.stop") {
//       publishEvent("run.stopped", {
//         runId: message.runId,
//       });

//       post({ type: "worker.ready", runId: message.runId });
//       process.exit(0);
//     }
//   } catch (error) {
//     const runId =
//       (message as any)?.command?.runId ??
//       (message as any)?.runId ??
//       activeRunId ??
//       "unknown";

//     publishEvent("run.failed", {
//       runId,
//       payload: {
//         error: error instanceof Error ? error.message : String(error),
//       },
//     });

//     post({
//       type: "worker.error",
//       runId,
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// });

// // // src\worker.ts
// // import type { WorkerInboundMessage, WorkerOutboundMessage } from "./contracts/ipc.js";
// // import type { RuntimeEngine } from "./engine/engine.js";
// // import { ExecutableEngine } from "./engine/executable-engine.js";
// // import { InterpretiveEngine } from "./engine/interpretive-engine.js";
// // import type { RunSubmission } from "./contracts/operator.js";
// // import type { RunCommand } from "./contracts/session.js";

// // let activeEngine: RuntimeEngine | null = null;

// // const engines: Record<string, RuntimeEngine> = {
// //   executable: new ExecutableEngine(),
// //   interpretive: new InterpretiveEngine(),
// // };

// // function post(message: WorkerOutboundMessage): void {
// //   if (typeof process.send === "function") {
// //     process.send(message);
// //   }
// // }

// // process.on("message", async (raw) => {
// //   const message = raw as WorkerInboundMessage;
// //   console.log("Worker received message:", message);

// //   try {
// //     if (message.type === "worker.start") {
// //       const submission = message.command as RunSubmission;

// //       const engine = engines[submission.engine];
// //       if (!engine) {
// //         throw new Error(`Unknown engine: ${submission.engine}`);
// //       }

// //       activeEngine = engine;

// //       const snapshot = await activeEngine.start(submission);
// //       post({ type: "worker.snapshot", snapshot });
// //       return;
// //     }

// //     if (message.type === "worker.command") {
// //       if (!activeEngine) {
// //         throw new Error("No active engine. Start a run first.");
// //       }

// //       const command = message.command as RunCommand;

// //       console.log("Worker dispatching command:", {
// //         type: message.type,
// //         action: command.action,
// //         runId: command.runId,
// //       });

// //       const snapshot =
// //         command.action === "send" ? await activeEngine.send(command) :
// //         command.action === "continue" ? await activeEngine.continue(command) :
// //         command.action === "pause" ? await activeEngine.pause(command) :
// //         command.action === "resume" ? await activeEngine.resume(command) :
// //         command.action === "retry" ? await activeEngine.retry(command) :
// //         command.action === "stop" ? await activeEngine.stop(command) :
// //         await activeEngine.snapshot(command.runId);

// //       post({ type: "worker.snapshot", snapshot });
// //       return;
// //     }

// //     if (message.type === "worker.stop") {
// //       post({ type: "worker.ready", runId: message.runId });
// //       process.exit(0);
// //     }
// //   } catch (error) {
// //     const runId =
// //       (message as any)?.command?.runId ??
// //       (message as any)?.runId ??
// //       "unknown";

// //     post({
// //       type: "worker.error",
// //       runId,
// //       error: error instanceof Error ? error.message : String(error),
// //     });
// //   }
// // });
