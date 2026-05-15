import type { RunCommand, RunSnapshot, RunCapabilities } from "../../contracts/session.js";
import type { InterpretiveSessionState } from "./state.js";

const DEFAULT_CAPABILITIES: RunCapabilities = {
  send: true,
  continue: true,
  pause: true,
  resume: true,
  retry: false,
  reports: true,
  interactiveInput: true,
};

export async function executeInterpretive(_state: InterpretiveSessionState, command: RunCommand): Promise<RunSnapshot> {
  return {
    runId: command.runId,
    engine: "interpretive",
    status: "created",
    activeNode: null,
    unifiedResponse: null,
    updatedAt: Date.now(),
    capabilities: DEFAULT_CAPABILITIES,
  };
}
