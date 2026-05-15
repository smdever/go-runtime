// src\contracts\session.ts
import type { AssetRef } from "./assets.js";
import type { EngineId } from "./engine.js";

  export type RunAction =
    | "start"
    | "send"
    | "continue"
    | "pause"
    | "resume"
    | "retry"
    | "stop"
    | "snapshot";

  export interface RunCommand {
    runId: string;
    action: RunAction;
    prompt?: string;
    nodePattern?: string;
    metadata?: Record<string, unknown>;
  }

  export type RunStatus =
    | "created"
    | "starting"
    | "running"
    | "waiting_for_input"
    | "paused"
    | "completed"
    | "failed"
    | "stopped";

  export interface RunCapabilities {
    send: boolean;
    continue: boolean;
    pause: boolean;
    resume: boolean;
    retry: boolean;
    reports: boolean;
    interactiveInput: boolean;
  }

  export interface RunSnapshot {
    runId: string;
    engine: "executable" | "interpretive";
    status: RunStatus;
    activeNode?: string | null;
    unifiedResponse?: string | null;
    prompt?: string | null;
    error?: string | null;
    startedAt?: number;
    updatedAt: number;
    capabilities: RunCapabilities;
    meta?: Record<string, unknown>;
  }
