// src/contracts/ipc.ts
import type { BufferedRuntimeEvent } from "./events.js";
import type { RunSubmission } from "./operator.js";
import type { RunCommand, RunSnapshot } from "./session.js";

export type WorkerInboundMessage =
  | { type: "worker.start"; command: RunSubmission }
  | { type: "worker.command"; command: RunCommand }
  | { type: "worker.stop"; runId: string }
  | { type: "worker.events.get"; runId: string; since?: number };

export type WorkerOutboundMessage =
  | { type: "worker.ready"; runId: string }
  | { type: "worker.snapshot"; snapshot: RunSnapshot }
  | { type: "worker.event"; event: BufferedRuntimeEvent }
  | { type: "worker.events"; runId: string; events: BufferedRuntimeEvent[] }
  | { type: "worker.error"; runId: string; error: string };

  