// src\cluster\runtime-manager.ts

import type { ChildProcess } from "node:child_process";
import { WorkerRegistry } from "./registry.js";
import { spawnRuntimeWorker } from "./spawn-runtime.js";

export class RuntimeManager {
  private readonly registry = new WorkerRegistry();
  private readonly workers = new Map<string, ChildProcess>();

  create(runId: string): ChildProcess {
    const worker = spawnRuntimeWorker();
    this.registry.set({ runId, pid: worker.pid });
    this.workers.set(runId, worker);
    return worker;
  }

  get(runId: string): ChildProcess | undefined {
    return this.workers.get(runId);
  }

  listRunIds(): string[] {
    return this.registry.list().map((item) => item.runId);
  }

  has(runId: string): boolean {
    return this.workers.has(runId);
  }

  dispose(runId: string): void {
    this.workers.get(runId)?.kill();
    this.workers.delete(runId);
    this.registry.delete(runId);
  }

  count(): number {
    return this.registry.list().length;
  }
}

// import type { ChildProcess } from "node:child_process";
// import { WorkerRegistry } from "./registry.js";
// import { spawnRuntimeWorker } from "./spawn-runtime.js";

// export class RuntimeManager {
//   private readonly registry = new WorkerRegistry();
//   private readonly workers = new Map<string, ChildProcess>();

//   create(runId: string): ChildProcess {
//     const worker = spawnRuntimeWorker();
//     this.registry.set({ runId, pid: worker.pid });
//     this.workers.set(runId, worker);
//     return worker;
//   }

//   get(runId: string): ChildProcess | undefined {
//     return this.workers.get(runId);
//   }

//   dispose(runId: string): void {
//     this.workers.get(runId)?.kill();
//     this.workers.delete(runId);
//     this.registry.delete(runId);
//   }

//   count(): number {
//     return this.registry.list().length;
//   }
// }
