// src\contracts\operator.ts
  import type { AssetRef } from "./assets.js";
  import type { EngineId } from "./engine.js";
  import type { RunSnapshot } from "./session.js";

  export interface ActorBinding {
    name: string;
    provider: string;
    model: string;
    id?: string;
    metadata?: Record<string, unknown>;
  }

  export interface CreateRunRequest {
    runId?: string;
    engine?: EngineId;

    /**
     * Name/id of a trusted executable flow in the executable registry.
     * Example: "FAICP-Lite", "CHAT-Lite", "FAICP-Lite.lfx"
     */
    flow?: string;

    executable?: {
      path?: string;
      inlineContent?: string;
      entryExport?: string;
      metadata?: Record<string, unknown>;
    };

    actors?: ActorBinding[];
    reasoning?: ActorBinding;
    initialPrompt?: string;
    metadata?: Record<string, unknown>;
  }

  // export interface CreateRunRequest {
  //   runId?: string;
  //   engine?: EngineId;
  //   executable?: {
  //     path?: string;
  //     inlineContent?: string;
  //     entryExport?: string;
  //     metadata?: Record<string, unknown>;
  //   };
  //   actors?: ActorBinding[];
  //   reasoning?: ActorBinding;
  //   initialPrompt?: string;
  //   metadata?: Record<string, unknown>;
  // }
  
  export interface OperatorRunRequest {
    key?: string;
    runId?: string;
    name?: string;
    executable: string;
    prompt?: string;
    passphrase?: string;
    metadata?: Record<string, unknown>;
  }

  export interface OperatorRunResult {
    ok: boolean;
    runId?: string;
    snapshot?: RunSnapshot | null;
    reason?: "missing_executable" | "forbidden" | "failed";
    error?: string;
  }

  export interface RunSubmission {
    runId: string;
    engine: EngineId;
    asset: AssetRef;
    actors: ActorBinding[];
    reasoning?: ActorBinding;
    initialPrompt?: string;
    metadata?: Record<string, unknown>;
  }

  export interface OperatorStatus {
    activeRuns: number;
    supportedEngines: EngineId[];
  }

  export interface OperatorListRequest {
    key: string;
    runId?: string;
  }

  export interface OperatorListItem {
    runId: string;
    snapshot: RunSnapshot | null;
  }

  export interface OperatorCloseRequest {
    key: string;
    runId: string;
  }

  export interface OperatorCloseResult {
    runId: string;
    closed: boolean;
    reason?: string;
  }
