// src\engine\executable-engine.ts
import path from "node:path";
import { RuntimeEmitter } from "../runtime/emitter.js";
import type { RuntimeEngine } from "./engine.js";
import type { EngineDescriptor } from "./engine-types.js";
import type { RunSnapshot, RunCommand } from "../contracts/session.js";
import type { RunSubmission } from "../contracts/operator.js";
import { createEmptySnapshot } from "../runtime/snapshots.js";
import { loadExecutableModule, loadExecutableModuleFromSource } from "./executable/loader.js";
import { createExecutableRuntime } from "./executable/runtime.js";
import { continueFlow, executeFlow } from "./executable/commands.js";
import type { ExecutableCtxState } from "./executable/state.js";

export class ExecutableEngine implements RuntimeEngine {
  readonly descriptor: EngineDescriptor = {
    id: "executable",
    name: "Compiled JS executable engine",
  };

  private readonly emitter = new RuntimeEmitter();
  private snapshotByRun = new Map<string, RunSnapshot>();
  private ctxByRun = new Map<string, ExecutableCtxState>();
  private flowByRun = new Map<string, { execute(ctx: unknown): Promise<unknown>; continue?(ctx: unknown): Promise<unknown> }>();

  subscribe(listener: (event: import("../contracts/events.js").RuntimeEvent) => void): () => void {
    return this.emitter.subscribe(listener);
  }

  async start(command: RunSubmission): Promise<RunSnapshot> {
      if (!command.asset.path && !command.asset.inlineContent) {
        throw new Error("Executable asset path or inlineContent is required.");
      }

      console.log("ExecutableEngine.start begin", {
        runId: command.runId,
        asset: {
          ...command.asset,
          inlineContent: command.asset.inlineContent
            ? `[inline executable ${command.asset.inlineContent.length} chars]`
            : undefined,
        },
      });

      const passphrase = String(command.asset.metadata?.passphrase ?? "LOKIPIED");

      let module;

      try {
        if (command.asset.inlineContent) {
          console.log("ExecutableEngine loading module from inlineContent", {
            runId: command.runId,
            assetId: command.asset.id,
            chars: command.asset.inlineContent.length,
          });

          module = await loadExecutableModuleFromSource(
            command.asset.inlineContent,
            command.asset.id,
            passphrase,
          );
        } else {
          const assetPath = command.asset.path as string;
          const modulePath = path.isAbsolute(assetPath)
            ? assetPath
            : path.resolve(process.cwd(), assetPath);

          console.log("ExecutableEngine asset path:", assetPath);
          console.log("ExecutableEngine loading module from:", modulePath);

          module = await loadExecutableModule(modulePath);
        }

        console.log("ExecutableEngine module loaded");
      } catch (error) {
        console.error("ExecutableEngine module load failed", error);
        throw error;
      }

    const ctxHolder: { current: ExecutableCtxState | null } = { current: null };
    const runtime = createExecutableRuntime({
      emitter: this.emitter,
      getCtx: () => ctxHolder.current,
    });

    const flow = module.createFlow(runtime as unknown as Record<string, unknown>);
    console.log("ExecutableEngine flow created:", flow?.info?.name ?? "unknown");

    function actorBindingsFromRuntime(runtimeSpec: unknown) {
      const spec = runtimeSpec as {
        Providers?: Array<{
          Name?: string;
          Type?: string;
        }>;
        Interactors?: Array<{
          Name?: string;
          Provider?: string;
          Model?: string;
          Role?: string;
        }>;
      };

      const providers = Array.isArray(spec?.Providers)
        ? spec.Providers
        : [];

      const providerTypeByName = new Map(
        providers
          .filter((p) => p?.Name && p?.Type)
          .map((p) => [p.Name as string, String(p.Type).toLowerCase()]),
      );

      const interactors = Array.isArray(spec?.Interactors)
        ? spec.Interactors
        : [];

      return interactors
        .filter((i) => i?.Role === "Primary")
        .map((i) => {
          const providerName = i.Provider ?? "";
          const providerType = providerTypeByName.get(providerName) ?? providerName;

          return {
            name: i.Name ?? "",
            provider: providerType,
            model: i.Model ?? "",
          };
        })
        .filter((i) => i.name && i.provider && i.model);
    }

    function reasoningFromRuntime(runtimeSpec: unknown) {
      const spec = runtimeSpec as {
        Reasoning?: string;
        Providers?: Array<{
          Name?: string;
          Type?: string;
        }>;
        Interactors?: Array<{
          Name?: string;
          Provider?: string;
          Model?: string;
          Role?: string;
        }>;
      };

      const providers = Array.isArray(spec?.Providers)
        ? spec.Providers
        : [];

      const providerTypeByName = new Map(
        providers
          .filter((p) => p?.Name && p?.Type)
          .map((p) => [p.Name as string, String(p.Type).toLowerCase()]),
      );

      const interactors = Array.isArray(spec?.Interactors)
        ? spec.Interactors
        : [];

      const reasoningName = spec?.Reasoning;

      if (!reasoningName) return undefined;

      const found = interactors.find((i) => i?.Name === reasoningName);

      if (!found?.Name || !found?.Provider || !found?.Model) {
        return undefined;
      }

      const providerName = found.Provider;
      const providerType = providerTypeByName.get(providerName) ?? providerName;

      return {
        name: found.Name,
        provider: providerType,
        model: found.Model,
      };
    }

    const runtimeSpec = flow.getRuntime?.() ?? {};
    const runtimeActors = actorBindingsFromRuntime(runtimeSpec);
    const runtimeReasoning = reasoningFromRuntime(runtimeSpec);

    const effectiveActors =
      command.actors && command.actors.length > 0
        ? command.actors
        : runtimeActors;

    const effectiveReasoning =
      command.reasoning ?? runtimeReasoning;

    console.log("ExecutableEngine runtime resolved", {
      runId: command.runId,
      runtimeActorCount: runtimeActors.length,
      commandActorCount: command.actors?.length ?? 0,
      effectiveActorCount: effectiveActors.length,
      hasRuntimeReasoning: !!runtimeReasoning,
      hasEffectiveReasoning: !!effectiveReasoning,
    });

    const ensureCtx = runtime.ensure_ctx as (
      input?: Partial<ExecutableCtxState> | null
    ) => ExecutableCtxState;

    const ctx = ensureCtx({
      meta: {
        runId: command.runId,
        flowId: command.asset.id,
        startedAt: Date.now(),
        version: "dev",
      },
      actors: effectiveActors,
      reasoning: effectiveReasoning
        ? {
            name: effectiveReasoning.name,
            provider: effectiveReasoning.provider,
            model: effectiveReasoning.model,
          }
        : undefined,
      conversation: {
        prompt: command.initialPrompt ?? "",
        passive: false,
        activeNode: null,
        rounds: [],
      },
    });

    console.log("ExecutableEngine ctx created", {
      runId: ctx.meta?.runId,
      activeNode: ctx.conversation?.activeNode,
    });    

    ctxHolder.current = ctx;
    this.ctxByRun.set(command.runId, ctx);
    this.flowByRun.set(command.runId, flow);
    const snapshot = await executeFlow(flow, ctx);

    console.log("Post-execute ctx state", {
      runId: ctx.meta?.runId,
      hasContinuation: typeof ctx.__lokipied_continue === "function",
      //activeNode: ctx.activeNode ?? null,
      conversationActiveNode: ctx.conversation?.activeNode ?? null,
    });

    this.snapshotByRun.set(command.runId, snapshot);
    return snapshot;
  }

  async send(command: RunCommand): Promise<RunSnapshot> {
    console.log("ExecutableEngine.send begin", {
      runId: command.runId,
      prompt: command.prompt,
    });    
    const ctx = this.requireCtx(command.runId);
    const flow = this.requireFlow(command.runId);
    console.log("ExecutableEngine.send state lookup", {
      runId: command.runId,
      hasFlow: !!flow,
      hasCtx: !!ctx,
      //activeNode: ctx?.activeNode ?? null,
      conversationActiveNode: ctx?.conversation?.activeNode ?? null,
    });    

    const snapshot = await continueFlow(flow, ctx, command);
    this.snapshotByRun.set(command.runId, snapshot);
    return snapshot;
  }

  async continue(command: RunCommand): Promise<RunSnapshot> {
    return this.send(command);
  }

  async pause(command: RunCommand): Promise<RunSnapshot> {
    return this.unsupported(command.runId, "Pause is not implemented for executable engine yet.");
  }

  async resume(command: RunCommand): Promise<RunSnapshot> {
    return this.unsupported(command.runId, "Resume is not implemented for executable engine yet.");
  }

  async retry(command: RunCommand): Promise<RunSnapshot> {
    return this.unsupported(command.runId, "Retry is not implemented for executable engine yet.");
  }

  async stop(command: RunCommand): Promise<RunSnapshot> {
    const snapshot = this.snapshotByRun.get(command.runId) ?? createEmptySnapshot(command.runId, "executable");
    const stopped: RunSnapshot = { ...snapshot, status: "stopped", updatedAt: Date.now() };
    this.snapshotByRun.set(command.runId, stopped);
    return stopped;
  }

  async snapshot(runId: string): Promise<RunSnapshot> {
    return this.snapshotByRun.get(runId) ?? createEmptySnapshot(runId, "executable");
  }

  private requireCtx(runId: string): ExecutableCtxState {
    const ctx = this.ctxByRun.get(runId);
    if (!ctx) throw new Error(`No executable ctx for run: ${runId}`);
    return ctx;
  }

  private requireFlow(runId: string) {
    const flow = this.flowByRun.get(runId);
    if (!flow) throw new Error(`No executable flow for run: ${runId}`);
    return flow;
  }

  private async unsupported(runId: string, message: string): Promise<RunSnapshot> {
    const snapshot = await this.snapshot(runId);
    return {
      ...snapshot,
      meta: { ...(snapshot.meta ?? {}), warning: message },
      updatedAt: Date.now(),
    };
  }
}
