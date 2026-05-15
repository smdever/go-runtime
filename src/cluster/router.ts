import { WorkerRegistry } from "./registry.js";

export class WorkerRouter {
  constructor(private readonly registry: WorkerRegistry) {}

  getWorker(runId: string) {
    return this.registry.get(runId);
  }
}
