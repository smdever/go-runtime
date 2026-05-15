import type { RunSubmission } from "../contracts/operator.js";
import type { RuntimeEngine } from "../engine/engine.js";
import type { RunCommand, RunSnapshot } from "../contracts/session.js";

export class RuntimeSession {
  constructor(private readonly engine: RuntimeEngine) {}

  async start(command: RunSubmission): Promise<RunSnapshot> {
    return this.engine.start(command);
  }

  async send(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.send(command);
  }

  async continue(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.continue(command);
  }

  async pause(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.pause(command);
  }

  async resume(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.resume(command);
  }

  async retry(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.retry(command);
  }

  async stop(command: RunCommand): Promise<RunSnapshot> {
    return this.engine.stop(command);
  }

  async snapshot(runId: string): Promise<RunSnapshot> {
    return this.engine.snapshot(runId);
  }
}
