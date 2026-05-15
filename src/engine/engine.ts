import type { RunSubmission } from "../contracts/operator.js";
import type { RunCommand, RunSnapshot } from "../contracts/session.js";
import type { RuntimeEvent } from "../contracts/events.js";
import type { EngineDescriptor } from "./engine-types.js";

export interface RuntimeEngine {
  readonly descriptor: EngineDescriptor;
  start(command: RunSubmission): Promise<RunSnapshot>;
  send(command: RunCommand): Promise<RunSnapshot>;
  continue(command: RunCommand): Promise<RunSnapshot>;
  pause(command: RunCommand): Promise<RunSnapshot>;
  resume(command: RunCommand): Promise<RunSnapshot>;
  retry(command: RunCommand): Promise<RunSnapshot>;
  stop(command: RunCommand): Promise<RunSnapshot>;
  snapshot(runId: string): Promise<RunSnapshot>;
  subscribe(listener: (event: RuntimeEvent) => void): () => void;
}
