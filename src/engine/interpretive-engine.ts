// src\engine\interpretive-engine.ts
import type { RunSubmission } from "../contracts/operator.js";
import type { RunCommand, RunSnapshot } from "../contracts/session.js";
import { RuntimeEmitter } from "../runtime/emitter.js";
import type { RuntimeEngine } from "./engine.js";
import type { EngineDescriptor } from "./engine-types.js";
import { createEmptySnapshot } from "../runtime/snapshots.js";

export class InterpretiveEngine implements RuntimeEngine {
  readonly descriptor: EngineDescriptor = {
    id: "interpretive",
    name: "LKF / BFI interpretive engine",
  };

  private readonly emitter = new RuntimeEmitter();

  subscribe(listener: (event: import("../contracts/events.js").RuntimeEvent) => void): () => void {
    return this.emitter.subscribe(listener);
  }

async start(command: RunSubmission): Promise<RunSnapshot> {
    return {
      ...createEmptySnapshot(command.runId, "interpretive"),
      meta: { note: "Interpretive engine scaffold only." },
    };
  }
  // async send(command: RunCommand): Promise<RunSnapshot> { return this.start(command); }
  // async continue(command: RunCommand): Promise<RunSnapshot> { return this.start(command); }
  // async pause(command: RunCommand): Promise<RunSnapshot> { return this.start(command); }
  // async resume(command: RunCommand): Promise<RunSnapshot> { return this.start(command); }
  // async retry(command: RunCommand): Promise<RunSnapshot> { return this.start(command); }
  async stop(command: RunCommand): Promise<RunSnapshot> {
    return { ...(createEmptySnapshot(command.runId, "interpretive")), status: "stopped" };
  }
  async snapshot(runId: string): Promise<RunSnapshot> { return createEmptySnapshot(runId, "interpretive"); }


async send(command: RunCommand): Promise<RunSnapshot> {
  return {
    ...createEmptySnapshot(command.runId, "interpretive"),
    status: "running",
    meta: { note: "Interpretive engine scaffold only." },
  };
}

async continue(command: RunCommand): Promise<RunSnapshot> {
  return {
    ...createEmptySnapshot(command.runId, "interpretive"),
    status: "running",
    meta: { note: "Interpretive engine scaffold only." },
  };
}

async pause(command: RunCommand): Promise<RunSnapshot> {
  return {
    ...createEmptySnapshot(command.runId, "interpretive"),
    status: "paused",
    meta: { note: "Interpretive engine scaffold only." },
  };
}

async resume(command: RunCommand): Promise<RunSnapshot> {
  return {
    ...createEmptySnapshot(command.runId, "interpretive"),
    status: "running",
    meta: { note: "Interpretive engine scaffold only." },
  };
}

async retry(command: RunCommand): Promise<RunSnapshot> {
  return {
    ...createEmptySnapshot(command.runId, "interpretive"),
    status: "running",
    meta: { note: "Interpretive engine scaffold only." },
  };
}

}
