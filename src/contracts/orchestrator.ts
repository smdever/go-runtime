// src\contracts\orchestrator.ts
export interface OrchestratorStatus {
  runId: string;
  isRunning: boolean;
  isPaused: boolean;
  activeNode?: string | null;
}
