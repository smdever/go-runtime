// src/contracts/events.ts

export type RuntimeEventName =
  | "run.started"
  | "run.state_changed"
  | "node.process"
  | "node.update"
  | "node.ready"
  | "node.report"
  | "input.requested"
  | "input.accepted"
  | "llm.call"
  | "llm.result"
  | "decision.made"
  | "run.completed"
  | "run.failed"
  | "run.stopped";

export interface RuntimeEvent<T = unknown> {
  runId: string;
  name: RuntimeEventName;
  at: number;
  node?: string;
  payload?: T;
}

export interface BufferedRuntimeEvent<T = unknown> extends RuntimeEvent<T> {
  sequence: number;
}

export interface GetRuntimeEventsQuery {
  since?: number;
}