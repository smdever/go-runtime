// src\engine\executable\runtime.ts
import type {
  ExecutableActorRef,
  ExecutableCtxState,
  ExecutableRound,
  ExecutableUtterance,
  ExecutableResponse,
} from "./state.js";
import { RuntimeEmitter } from "../../runtime/emitter.js";
import { getConnector } from "../../connectors/index.js";
import type { ProviderId, ChatMessage } from "../../connectors/types.js";

export interface ExecutableRuntimeDeps {
  emitter: RuntimeEmitter;
  getCtx: () => ExecutableCtxState | null;
}

function cloneActor(actor: ExecutableActorRef): ExecutableActorRef {
  return {
    name: actor.name,
    provider: actor.provider,
    model: actor.model,
  };
}

function resolveActorName(
  actor: ExecutableActorRef | string | undefined,
): string {
  if (!actor) return "";
  return typeof actor === "string" ? actor : actor.name ?? String(actor);
}

function hasName(value: unknown): value is { name: string } {
  return !!value && typeof value === "object" && "name" in value && typeof (value as { name?: unknown }).name === "string";
}

function isExecutableActorRef(value: unknown): value is ExecutableActorRef {
  return (
    !!value &&
    typeof value === "object" &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

function toExecutableActorRef(
  value: ExecutableActorRef | { name: string } | string,
  ctx?: ExecutableCtxState,
): ExecutableActorRef {
  if (typeof value !== "string") {
    if ("provider" in value || "model" in value) {
      return {
        name: value.name,
        provider: (value as ExecutableActorRef).provider,
        model: (value as ExecutableActorRef).model,
      };
    }

    if (ctx) {
      const matched = ctx.actors.find((a) => a.name === value.name);
      if (matched) return cloneActor(matched);
    }

    return { name: value.name };
  }

  if (ctx) {
    const matched = ctx.actors.find((a) => a.name === value || a.model === value);
    if (matched) return cloneActor(matched);
  }

  return { name: value };
}

function resolveTargetActor(
  target: ExecutableActorRef | string | Array<ExecutableActorRef | string> | undefined,
  ctx: ExecutableCtxState,
): ExecutableActorRef {
  const first = Array.isArray(target) ? target[0] : target;

  if (!first) {
    throw new Error("send_utterance: target actor is missing");
  }

  if (typeof first !== "string") {
    if (first.provider && first.model) return first;

    const matched = ctx.actors.find((a) => a.name === first.name);
    if (matched?.provider && matched?.model) return matched;

    throw new Error(`send_utterance: unresolved actor '${first.name ?? "unknown"}'`);
  }

  const matched = ctx.actors.find(
    (a) => a.name === first || a.model === first,
  );

  if (!matched?.provider || !matched?.model) {
    throw new Error(`send_utterance: unresolved actor '${first}'`);
  }

  return matched;
}

export interface ExecutableRuntime {
  ensure_ctx(ctx?: Partial<ExecutableCtxState>): ExecutableCtxState;
  ensure_conversation(ctx: ExecutableCtxState): void;
  set_active_node(ctx: ExecutableCtxState, nodeName: string): void;
  get_conversation_prompt(ctx: ExecutableCtxState): string;
  get_passive(ctx: ExecutableCtxState): boolean;
  get_actors(ctx: ExecutableCtxState): ExecutableActorRef[];
  get_narrator(ctx: ExecutableCtxState): ExecutableActorRef | undefined;
  get_last_round(ctx: ExecutableCtxState): ExecutableRound | null;
  get_last_context(
    lastRound: ExecutableRound | null,
    to: ExecutableActorRef | string | undefined,
  ): string;
  get_last_useful_context(
    ctx: ExecutableCtxState,
    to: ExecutableActorRef | string | undefined,
  ): string | null;
  create_round(
    ctx: ExecutableCtxState,
    nodeName: string,
    lastRound: ExecutableRound | null,
  ): ExecutableRound;

  create_round_from_last(
    ctx: ExecutableCtxState,
    nodeName: string,
    lastRound: ExecutableRound | null,
  ): ExecutableRound;

  create_utterance(
    ctx: ExecutableCtxState,
    round: ExecutableRound,
    init: {
      to: ExecutableActorRef | string | Array<ExecutableActorRef | string>;
      from?: ExecutableActorRef | string | { name: string };
      prompt?: string;
      context?: string | null;
    },
  ): ExecutableUtterance;
  sync_round_actors(ctx: ExecutableCtxState, round: ExecutableRound): ExecutableRound;
  remove_actor(ctx: ExecutableCtxState, actor: ExecutableActorRef | string | undefined): void;

  send_utterance(
    ctx: ExecutableCtxState,
    utt: ExecutableUtterance,
  ): Promise<ExecutableResponse>;

  remove_actor(
    ctx: ExecutableCtxState,
    actor: ExecutableActorRef | string | undefined,
  ): void;

  get_to_list_names(
    to: ExecutableActorRef | string | Array<ExecutableActorRef | string> | undefined,
  ): string;

  get_clean_prompt(value: unknown): string;

  get_collect_input_spec(
    ctx: ExecutableCtxState,
    nodeName: string,
  ): { label: string; help: string; key: string };

  clear_embeds(ctx: ExecutableCtxState): void;

  get_to_list_names(
    to: ExecutableActorRef | string | Array<ExecutableActorRef | string> | undefined,
  ): string;

  get_clean_prompt(value: unknown): string;

  get_collect_input_spec(
    ctx: ExecutableCtxState,
    nodeName: string,
  ): { label: string; help: string; key: string };

  clear_embeds(ctx: ExecutableCtxState): void;

  emit_process(nodeName: string, payload?: unknown): Promise<void>;
  emit_update(nodeName: string, payload?: unknown): Promise<void>;
  emit_ready(nodeName: string, payload?: unknown): Promise<void>;
  emit_exec_collect_input(nodeName: string, spec?: unknown): Promise<void>;
  emit_exec_llm_call(nodeName: string, payload?: unknown): Promise<void>;
  emit_exec_llm_result(nodeName: string, payload?: unknown): Promise<void>;
  emit_exec_decision(nodeName: string, payload?: unknown): Promise<void>;
  emit_exec_prompt_accepted(nodeName: string, payload?: unknown): Promise<void>;
}

export function createExecutableRuntime(
  deps: ExecutableRuntimeDeps,
): ExecutableRuntime {
  const runtime: ExecutableRuntime = {
    ensure_ctx(input?: Partial<ExecutableCtxState>): ExecutableCtxState {
      const ctx = (input ?? {}) as ExecutableCtxState;

      ctx.meta ??= {
        runId: "run-dev",
        flowId: "flow-dev",
        startedAt: Date.now(),
        version: "dev",
      };

      ctx.meta.runId ??= "run-dev";
      ctx.meta.flowId ??= "flow-dev";
      ctx.meta.startedAt ??= Date.now();
      ctx.meta.version ??= "dev";

      ctx.conversation ??= {
        prompt: "",
        passive: false,
        activeNode: null,
        unifiedResponse: null,
        rounds: [],
      };

      ctx.conversation.prompt ??= "";
      ctx.conversation.passive ??= false;
      ctx.conversation.activeNode ??= null;
      ctx.conversation.unifiedResponse ??= null;
      ctx.conversation.rounds ??= [];

      ctx.actors ??= [];
      ctx.vars ??= {};
      ctx.memory ??= {};
      ctx.reports ??= { details: [] };
      ctx.historyByActor ??= {};
      ctx.__lokipied_continue ??= null;

      return ctx;
    },    

    ensure_conversation(ctx: ExecutableCtxState): void {
      ctx.conversation ??= {
        prompt: "",
        passive: false,
        activeNode: null,
        rounds: [],
      };
    },

    set_active_node(ctx: ExecutableCtxState, nodeName: string): void {
      ctx.conversation.activeNode = nodeName;
    },

    get_conversation_prompt(ctx: ExecutableCtxState): string {
      return ctx.conversation.prompt;
    },

    get_passive(ctx: ExecutableCtxState): boolean {
      return Boolean(ctx.conversation.passive);
    },

    get_actors(ctx: ExecutableCtxState): ExecutableActorRef[] {
      return ctx.actors;
    },

    get_narrator(ctx: ExecutableCtxState): ExecutableActorRef | undefined {
      return ctx.reasoning;
    },

    get_last_round(ctx: ExecutableCtxState): ExecutableRound | null {
      const rounds = ctx.conversation.rounds;
      return rounds.length ? rounds[rounds.length - 1] : null;
    },

    get_last_context(
      lastRound: ExecutableRound | null,
      to: ExecutableActorRef | string | undefined,
    ): string {
      if (!lastRound) return "";

      const targetName = resolveActorName(to);
      return lastRound.lastContextByActor?.[targetName] ?? "";
    },

    get_last_useful_context(
      ctx: ExecutableCtxState,
      to: ExecutableActorRef | string | undefined,
    ): string | null {
      const lastRound = runtime.get_last_round(ctx);
      const value = runtime.get_last_context(lastRound, to);
      return value?.trim() ? value : null;
    },

    create_round(
      ctx: ExecutableCtxState,
      nodeName: string,
      _lastRound: ExecutableRound | null,
    ): ExecutableRound {
      const round: ExecutableRound = {
        name: nodeName,
        actors: ctx.actors.map(cloneActor),
        utterances: [],
        createdAt: Date.now(),
        lastContextByActor: {},
      };

      ctx.conversation.rounds.push(round);
      return round;
    },

    create_round_from_last(
      ctx: ExecutableCtxState,
      nodeName: string,
      lastRound: ExecutableRound | null,
    ): ExecutableRound {
      const prev =
        lastRound ||
        runtime.get_last_round(ctx) || {
          actors: ctx.actors,
          utterances: [],
          lastContextByActor: {},
        };

      const round: ExecutableRound = {
        name: nodeName,
        actors: (prev.actors ?? ctx.actors).map((a) =>
          typeof a === "string" ? toExecutableActorRef(a, ctx) : cloneActor(a),
        ),
        utterances: (prev.utterances ?? []).map((u) => ({
          ...u,
          responses: Array.isArray(u?.responses)
            ? u.responses.map((r) => ({ ...r }))
            : [],
        })),
        createdAt: Date.now(),
        lastContextByActor: prev.lastContextByActor
          ? { ...prev.lastContextByActor }
          : {},
      };

      ctx.conversation.rounds.push(round);
      return round;
    },

    create_utterance(
      _ctx: ExecutableCtxState,
      round: ExecutableRound,
      init: {
        to: ExecutableActorRef | string | Array<ExecutableActorRef | string>;
        from?: ExecutableActorRef | string | { name: string };
        prompt?: string;
        context?: string | null;
      },
    ): ExecutableUtterance {
      const utterance: ExecutableUtterance = {
        from: init.from,
        to: init.to,
        prompt: init.prompt,
        context: init.context ?? null,
        responses: [],
      };

      round.utterances.push(utterance);
      return utterance;
    },

    sync_round_actors(
      _ctx: ExecutableCtxState,
      round: ExecutableRound,
    ): ExecutableRound {
      const actorMap = new Map<string, ExecutableActorRef>();

      for (const actor of round.actors ?? []) {
        actorMap.set(actor.name, cloneActor(actor));
      }

      for (const utt of round.utterances ?? []) {
        if (utt.from && hasName(utt.from)) {
          actorMap.set(utt.from.name, toExecutableActorRef(utt.from, _ctx));
        }

        const targets = Array.isArray(utt.to)
          ? utt.to
          : utt.to
            ? [utt.to]
            : [];

        for (const target of targets) {
          if (typeof target === "string" || hasName(target)) {
            const ref = toExecutableActorRef(target, _ctx);
            actorMap.set(ref.name, ref);
          }
        }

        for (const resp of utt.responses ?? []) {
          if (resp.from && hasName(resp.from)) {
            const ref = toExecutableActorRef(resp.from, _ctx);
            actorMap.set(ref.name, ref);
          }

          if (resp.to && hasName(resp.to)) {
            const ref = toExecutableActorRef(resp.to, _ctx);
            actorMap.set(ref.name, ref);
          }
        }
      }

      round.actors = Array.from(actorMap.values());
      return round;
    },

    emit_process: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "node.process",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_update: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "node.update",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_ready: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "node.ready",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_exec_collect_input: async (nodeName: string, spec?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "input.requested",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload: spec,
      });
    },

    emit_exec_llm_call: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "llm.call",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_exec_llm_result: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "llm.result",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_exec_decision: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "decision.made",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },

    emit_exec_prompt_accepted: async (nodeName: string, payload?: unknown) => {
      const ctx = deps.getCtx();
      deps.emitter.emit({
        name: "input.accepted",
        runId: ctx?.meta.runId ?? "unknown",
        at: Date.now(),
        node: nodeName,
        payload,
      });
    },
  
    get_to_list_names(
      to: ExecutableActorRef | string | Array<ExecutableActorRef | string> | undefined,
    ): string {
      if (!to) return "";

      if (Array.isArray(to)) {
        return to.map((x) => resolveActorName(x)).join(", ");
      }

      return resolveActorName(to);
    },

    get_clean_prompt(value: unknown): string {
      return String(value ?? "").trim();
    },

    get_collect_input_spec(
      _ctx: ExecutableCtxState,
      _nodeName: string,
    ): { label: string; help: string; key: string } {
      return {
        label: "Enter input",
        help: "",
        key: "prompt",
      };
    },

    clear_embeds(ctx: ExecutableCtxState): void {
      (ctx as ExecutableCtxState & { embeds?: unknown[] }).embeds = [];
    },

    remove_actor(
      ctx: ExecutableCtxState,
      actor: ExecutableActorRef | string | undefined,
    ): void {
      const actorName = resolveActorName(actor);
      if (!actorName) return;

      ctx.actors = ctx.actors.filter((a) => a.name !== actorName);

      const round = runtime.get_last_round(ctx);
      if (!round) return;

      round.actors = round.actors.filter((a) => a.name !== actorName);
      round.utterances = round.utterances.filter((u) => {
        const target = Array.isArray(u.to) ? u.to[0] : u.to;
        return resolveActorName(target) !== actorName;
      });
    },

    async send_utterance(
      ctx: ExecutableCtxState,
      utt: ExecutableUtterance,
    ): Promise<ExecutableResponse> {
      if (!ctx.actors || ctx.actors.length === 0) {
        throw new Error(
          "No active actors configured. Set ctx.actors before executing the flow.",
        );
      }

      console.log("send_utterance target raw:", utt.to);
      const target = resolveTargetActor(utt.to, ctx);

      if (!target.provider) {
        throw new Error(`send_utterance: target provider is missing for '${target.name}'`);
      }

      if (!target.model) {
        throw new Error(`send_utterance: target model is missing for '${target.name}'`);
      }

      ctx.historyByActor ||= {};
      ctx.historyByActor[target.name] ||= [];

      const actorHistory = ctx.historyByActor[target.name];
      const prompt = String(utt.prompt ?? "");

      actorHistory.push({
        role: "user",
        content: prompt,
      });

      const messages: ChatMessage[] = actorHistory
        .filter(
          (m): m is { role: "system" | "user" | "assistant"; content: string } =>
            (m.role === "system" || m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      await runtime.emit_exec_llm_call(ctx.conversation.activeNode ?? "LLM", {
        to: target.model,
        provider: target.provider,
        promptPreview: prompt.slice(0, 200),
        promptChars: prompt.length,
        historyMessages: messages.length,
      });

      const connector = getConnector(target.provider as ProviderId);

      let apiResponse;
      try {
        apiResponse = await connector.chat({
          model: target.model,
          messages,
          temperature: 0.7,
        });
      } catch (error) {
        const last = actorHistory[actorHistory.length - 1];
        if (last?.role === "user" && last?.content === prompt) {
          actorHistory.pop();
        }

        console.error("send_utterance failed", {
          node: ctx.conversation.activeNode,
          to: target.name,
          provider: target.provider,
          model: target.model,
          error,
        });

        throw error;
      }

      const text = String(apiResponse.response ?? apiResponse.content ?? "").trim();

      const response: ExecutableResponse = {
        from: target,
        to:
          typeof utt.from === "string"
            ? { name: utt.from }
            : utt.from,
        text,
        apiResponse: {
          response: text,
          usage: apiResponse.usage,
          raw: apiResponse.raw,
        },
      };

      utt.responses ||= [];
      utt.responses.push(response);

      const round = runtime.get_last_round(ctx);
      if (round) {
        round.lastContextByActor ||= {};
        round.lastContextByActor[target.name] = text;
      }

      actorHistory.push({
        role: "assistant",
        content: text,
      });

      await runtime.emit_exec_llm_result(`${ctx.conversation.activeNode ?? "LLM"}.raw`, {
        from: target.model,
        provider: target.provider,
        preview: text.slice(0, 200),
        respChars: text.length,
        historyMessages: actorHistory.length,
      });

      console.log(`[LLM ${target.model}] ${text}`);

      return response;
    },    
  
  };

  return runtime;
}
