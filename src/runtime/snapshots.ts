// src\runtime\snapshots.ts
import type { RunCapabilities, RunSnapshot } from "../contracts/session.js";
import type { EngineId } from "../contracts/engine.js";

const DEFAULT_CAPABILITIES: RunCapabilities = {
  send: true,
  continue: true,
  pause: true,
  resume: true,
  retry: false,
  reports: true,
  interactiveInput: true,
};

export function createEmptySnapshot(runId: string, engine: EngineId): RunSnapshot {
  return {
    runId,
    engine,
    status: "created",
    activeNode: null,
    unifiedResponse: null,
    updatedAt: Date.now(),
    capabilities: DEFAULT_CAPABILITIES,
  };
}
