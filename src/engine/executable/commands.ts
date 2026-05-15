// src\engine\executable\commands.ts
  import type { RunCommand, RunSnapshot } from "../../contracts/session.js";
  import type { ExecutableCtxState } from "./state.js";

  const EXECUTABLE_CAPABILITIES = {
    send: true,
    continue: true,
    pause: false,
    resume: true,
    retry: false,
    reports: true,
    interactiveInput: true,
  } as const;

  export async function executeFlow(flow: { execute(ctx: unknown): Promise<unknown> }, ctx: ExecutableCtxState): Promise<RunSnapshot> {
    try {
      await flow.execute(ctx);
    } catch (error) {
      console.error("Executable flow failed:", error);
      // deps.emitter.emit({
      //   name: "run.failed",
      //   runId: ctx.meta.runId,
      //   at: Date.now(),
      //   payload: {
      //     message: error instanceof Error ? error.message : String(error),
      //     stack: error instanceof Error ? error.stack : undefined,
      //   },
      // });
      throw error;
    }

    return {
      runId: ctx.meta.runId,
      engine: "executable",
      status: ctx.__lokipied_continue ? "waiting_for_input" : "running",
      activeNode: ctx.conversation.activeNode,
      unifiedResponse: ctx.conversation.unifiedResponse ?? null,
      updatedAt: Date.now(),
      capabilities: EXECUTABLE_CAPABILITIES,    
    };
  }

  export async function continueFlow(
    flow: { continue?(ctx: unknown): Promise<unknown> },
    ctx: ExecutableCtxState,
    command: RunCommand
  ): Promise<RunSnapshot> {
    console.log("continueFlow begin", {
      runId: ctx.meta.runId,
      hasContinuation: typeof ctx.__lokipied_continue === "function",
      prompt: command.prompt,
    });

    if (command.prompt != null) {
      ctx.conversation.prompt = command.prompt;
    }

    console.log("continueFlow before flow.continue", {
      runId: ctx.meta.runId,
      prompt: ctx.conversation.prompt,
      hasFlowContinue: typeof flow.continue === "function",
    });

    if (typeof flow.continue === "function") {
      await flow.continue(ctx);
    }

    console.log("continueFlow after flow.continue", {
      runId: ctx.meta.runId,
      hasContinuation: typeof ctx.__lokipied_continue === "function",
      activeNode: ctx.conversation.activeNode,
      unifiedResponse: ctx.conversation.unifiedResponse ?? null,
    });

    return {
      runId: ctx.meta.runId,
      engine: "executable",
      status: ctx.__lokipied_continue ? "waiting_for_input" : "running",
      activeNode: ctx.conversation.activeNode,
      unifiedResponse: ctx.conversation.unifiedResponse ?? null,
      updatedAt: Date.now(),
      capabilities: EXECUTABLE_CAPABILITIES,
    };
  }
