export interface InterpretiveConversationState {
  title?: string;
  prompt: string;
  passive: boolean;
  silent: boolean;
  paused: boolean;
  activeNode?: string | null;
  unifiedResponse?: string | null;
  rounds: unknown[];
  reports: unknown[];
}

export interface InterpretiveSessionState {
  runId: string;
  flowId: string;
  conversation: InterpretiveConversationState;
  processNodes: unknown[];
  nodeProcessor?: unknown;
}
