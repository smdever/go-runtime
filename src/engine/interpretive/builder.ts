import type { InterpretiveSessionState } from "./state.js";

export async function buildInterpretiveSession(sourceText: string, runId: string, flowId: string): Promise<InterpretiveSessionState> {
  return {
    runId,
    flowId,
    conversation: {
      prompt: "",
      passive: false,
      silent: false,
      paused: false,
      activeNode: null,
      unifiedResponse: null,
      rounds: [],
      reports: [],
    },
    processNodes: [{ kind: "placeholder", sourceText }],
  };
}
