// src\engine\executable\state.ts
export interface ExecutableActorRef {
  name: string;
  provider?: string;
  model?: string;
}

export interface ExecutableResponse {
  from?: ExecutableActorRef;
  to?: ExecutableActorRef;
  text?: string;
  apiResponse?: {
    response?: string;
    usage?: unknown;
    raw?: unknown;
  };
}

export interface ExecutableUtterance {
  from?: ExecutableActorRef | string | { name: string };
  to?: ExecutableActorRef | string | Array<ExecutableActorRef | string>;
  prompt?: string;
  context?: string | null;
  responses: ExecutableResponse[];
}

export interface ExecutableRound {
  name: string;
  actors: ExecutableActorRef[];
  utterances: ExecutableUtterance[];
  createdAt: number;
  lastContextByActor?: Record<string, string>;
}

export interface ExecutableConversationState {
  prompt: string;
  passive: boolean;
  activeNode: string | null;
  unifiedResponse?: string | null;
  rounds: ExecutableRound[];
}

export interface ExecutableCtxState {
  meta: {
    runId: string;
    flowId: string;
    startedAt: number;
    version: string;
    flow?: Record<string, unknown>;
  };
  conversation: ExecutableConversationState;
  actors: ExecutableActorRef[];
  reasoning?: ExecutableActorRef;
  vars: Record<string, unknown>;
  memory: Record<string, unknown>;
  reports: { details: unknown[] };
  historyByActor: Record<string, Array<{ role: string; content: string }>>;
  __lokipied_continue: (() => Promise<void>) | null;
}
