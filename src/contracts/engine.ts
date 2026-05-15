// src\contracts\engine.ts
import type { RunSubmission } from "./operator.js";
import type { RunCommand, RunSnapshot } from "./session.js";

  export type EngineId = "executable" | "interpretive";

  export interface IRuntimeEngine {
    readonly id: EngineId;

    start(submission: RunSubmission): Promise<RunSnapshot>;
    send(command: RunCommand): Promise<RunSnapshot>;
    continue(command: RunCommand): Promise<RunSnapshot>;
    pause(command: RunCommand): Promise<RunSnapshot>;
    resume(command: RunCommand): Promise<RunSnapshot>;
    retry(command: RunCommand): Promise<RunSnapshot>;
    stop(command: RunCommand): Promise<RunSnapshot>;
    snapshot(runId: string): Promise<RunSnapshot>;
  }

  