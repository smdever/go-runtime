// src\engine\executable\runtime.ts
import path from "node:path";
import { promises as fs } from "node:fs";
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
  import {
    McpStreamableClient,
    type JsonObject,
    type McpToolDescriptor,
    type McpToolResult,
  } from "../../tools/mcp/mcp-streamable-client.js";
import { getProviderFromModel } from "../../shared/provider-resolver.js";
import {
  addTimestampToFileName,
  convertToFileNameCompatible,
  createLoadPrompt,
  getFilenames,
  getLoadPassingToBlurb,
  loadFilesForActors,
  waitForFiles,
  writeActorResponsesToFile,
  writeAllResponsesToFile,
} from "../../tools/files/file-helper.js";

  export interface ExecutableRuntimeDeps {
    emitter: RuntimeEmitter;
    getCtx: () => ExecutableCtxState | null;
  }

  function normalizeConnectorId(value: unknown): ProviderId {
    const s = String(value ?? "").trim().toLowerCase();

    switch (s) {
      case "openai":
      case "openaichat":
        return "openai";

      case "anthropic":
      case "claude":
      case "claudechat":
        return "anthropic";

      case "google":
      case "gemini":
      case "geminichat":
        return "google";

      case "xai":
      case "xaichat":
      case "grok":
        return "xai";

      case "ollama":
      case "ollamachat":
      case "ollamacontext":
        return "ollama";

      case "cohere":
      case "coherechat":
        return "cohere";

      default:
        return s as ProviderId;
    }
  }  

  function resolveConnectorId(
    providerRef: unknown,
    providers: Array<{ Name?: string; name?: string; Type?: string; type?: string }> | undefined,
  ): ProviderId {
    const ref = String(providerRef ?? "").trim();

    const provider = (providers ?? []).find((p) => {
      const name = String(p.Name ?? p.name ?? "").trim();
      return name.toLowerCase() === ref.toLowerCase();
    });

    if (provider) {
      return normalizeConnectorId(provider.Type ?? provider.type);
    }

    return normalizeConnectorId(ref);
  }  

  function resolveConnectorIdForActor(actor: any, runtimeSpec: any): string {
    const providerRef = String(actor?.provider ?? actor?.Provider ?? "").trim();

    const providers = Array.isArray(runtimeSpec?.Providers)
      ? runtimeSpec.Providers
      : [];

    const provider = providers.find((p: any) =>
      String(p?.Name ?? p?.name ?? "").trim().toLowerCase() === providerRef.toLowerCase()
    );

    if (provider) {
      return normalizeConnectorId(provider.Type ?? provider.type);
    }

    // If already "openai", "gemini", "OpenAIChat", etc.
    return normalizeConnectorId(providerRef);
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

  async function get_advertised_tools(
    endpoint: string,
    toolName?: string,
  ): Promise<McpToolDescriptor[]> {
    const tools = await McpStreamableClient.listToolsOnce(endpoint);

    if (!toolName?.trim()) return tools;

    return tools.filter(
      (tool) => tool.name.toLowerCase() === toolName.trim().toLowerCase(),
    );
  }

  function readString(value: unknown, fallback = ""): string {
    const s = String(value ?? "").trim();
    return s || fallback;
  }

  function readBool(value: unknown, fallback = false): boolean {
    if (typeof value === "boolean") return value;

    const s = String(value ?? "").trim().toLowerCase();
    if (!s) return fallback;

    return s === "true" || s === "1" || s === "yes" || s === "y";
  }

  async function directory_exists(directoryPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(directoryPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async function get_load_filenames(
    importPath: string,
    filter = "*.*",
  ): Promise<Array<[string, string]>> {
    return getFilenames(importPath, filter, false);
  }

  async function wait_for_load_files(
    importPath: string,
    filter = "*.*",
    options: { pollMs?: number; ctx?: any; nodeName?: string } = {},
  ): Promise<Array<[string, string]>> {
    const signal = options.ctx?.abortController?.signal ?? options.ctx?.signal;
    return waitForFiles(importPath, filter, {
      pollMs: options.pollMs ?? 5000,
      signal,
    });
  }

  async function load_files_for_actors(
    _ctx: ExecutableCtxState,
    args: {
      nodeName?: string;
      round: ExecutableRound;
      actors: ExecutableActorRef[];
      filesList: Array<[string, string]>;
      importPath: string;
      rawMode?: boolean;
      from?: unknown;
      moveToHistory?: boolean;
    },
  ): Promise<Map<ExecutableActorRef, string[]>> {
    const promptsByActor = await loadFilesForActors(args.filesList, args.actors, {
      importPath: args.importPath,
      rawMode: args.rawMode ?? false,
      moveToHistory: args.moveToHistory ?? true,
      from: args.from,
    });

    return promptsByActor as Map<ExecutableActorRef, string[]>;
  }

  function create_load_prompt(nodeBlurbs?: any): string {
    const direct = nodeBlurbs?.LoadPrompt ?? nodeBlurbs?.loadPrompt;
    if (typeof direct === "string" && direct.trim()) return direct;
    return createLoadPrompt({ Conversation: { Load: nodeBlurbs ?? {} } });
  }

  function get_load_passing_to_blurb(nodeBlurbs?: any): string {
    const direct =
      nodeBlurbs?.PassingTo ??
      nodeBlurbs?.passingTo ??
      nodeBlurbs?.LoadTo ??
      nodeBlurbs?.loadTo;

    if (typeof direct === "string" && direct.trim()) return direct;
    return getLoadPassingToBlurb({ Conversation: { Load: nodeBlurbs ?? {} } });
  }

  async function ensure_export_directory(exportPath: string): Promise<void> {
    await fs.mkdir(exportPath, { recursive: true });
  }

  function get_prompt_hint(ctx: any): string {
    return String(
      ctx?.conversation?.promptHint ??
        ctx?.conversation?.PromptHint ??
        ctx?.PromptHint ??
        "",
    );
  }

  async function create_export_prefix_from_prompt_hint(
    promptHint: string,
  ): Promise<string> {
    const cleaned = convertToFileNameCompatible(promptHint);
    return cleaned ? `${cleaned}_` : "";
  }

  function get_export_suppress_file_narration(ctx: any): boolean {
    const direct =
      ctx?.settings?.Export?.SuppressFileNarration ??
      ctx?.settings?.export?.suppressFileNarration ??
      ctx?.conversation?.settings?.Export?.SuppressFileNarration ??
      ctx?.conversation?.settings?.export?.suppressFileNarration ??
      ctx?.conversation?.LOKIPAI?.Settings?.[
        "Settings.Library.Models.Conversation.Export.SuppressFileNarration"
      ] ??
      false;

    return readBool(direct, false);
  }

  function get_actor_name(actor: any): string {
    return String(actor?.name ?? actor?.Name ?? actor?.id ?? actor?.Id ?? "").trim();
  }

  function get_reasoning_actor(ctx: any): any | null {
    return (
      ctx?.conversation?.reasoning ??
      ctx?.conversation?.Reasoning ??
      ctx?.reasoning ??
      null
    );
  }

  function collect_rounds(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const rounds = value?.rounds ?? value?.Rounds;
    return Array.isArray(rounds) ? rounds : [value];
  }

  function response_text(response: any): string {
    return String(
      response?.apiResponse?.response ??
        response?.apiResponse?.Response ??
        response?.ApiResponse?.Response ??
        response?.response ??
        response?.Response ??
        response?.text ??
        response?.Text ??
        "",
    );
  }

  function get_response_actor_name(response: any): string {
    return get_actor_name(response?.from ?? response?.From);
  }

  function find_last_useful_response(
    roundish: any,
    actor: any,
  ): { text: string; sequenceId: number } | null {
    const actorName = get_actor_name(actor).toLowerCase();
    if (!actorName) return null;

    const rounds = collect_rounds(roundish);
    let sequenceId = 0;
    const matches: Array<{ text: string; sequenceId: number }> = [];

    for (const round of rounds) {
      const utterances = round?.utterances ?? round?.Utterances ?? [];
      if (!Array.isArray(utterances)) continue;

      for (const utterance of utterances) {
        const utteranceSeq = Number(
          utterance?.sequenceId ??
            utterance?.SequenceId ??
            utterance?.sequence ??
            utterance?.Sequence ??
            sequenceId,
        );

        const responses = utterance?.responses ?? utterance?.Responses ?? [];
        if (Array.isArray(responses)) {
          for (const response of responses) {
            const text = response_text(response).trim();
            if (!text) continue;

            const fromName = get_response_actor_name(response).toLowerCase();
            if (fromName === actorName) {
              matches.push({ text, sequenceId: utteranceSeq });
            }
          }
        }

        const text = response_text(utterance).trim();
        if (text) {
          const fromName = get_actor_name(utterance?.from ?? utterance?.From).toLowerCase();
          const toName = get_actor_name(utterance?.to ?? utterance?.To).toLowerCase();
          const utteranceActorName = get_actor_name(
            utterance?.actor ?? utterance?.Actor,
          ).toLowerCase();

          if (
            fromName === actorName ||
            toName === actorName ||
            utteranceActorName === actorName
          ) {
            matches.push({ text, sequenceId: utteranceSeq });
          }
        }

        sequenceId++;
      }
    }

    return matches.length ? matches[matches.length - 1] : null;
  }

  function get_last_useful_utterance_response(
    _ctx: any,
    roundish: any,
    actor: any,
  ): string {
    return find_last_useful_response(roundish, actor)?.text ?? "";
  }

  function get_last_useful_utterance_response_sequence_id(
    roundish: any,
    actor: any,
  ): number {
    return find_last_useful_response(roundish, actor)?.sequenceId ?? -1;
  }

  function get_consolidated_export_response(ctx: any): string {
    return String(
      ctx?.conversation?.unifiedResponse ??
        ctx?.conversation?.UnifiedResponse ??
        ctx?.vars?.unifiedResponse ??
        ctx?.vars?.UnifiedResponse ??
        ctx?.unifiedResponse ??
        ctx?.UnifiedResponse ??
        "",
    ).trim();
  }

  async function export_actor_responses(
    ctx: ExecutableCtxState,
    args: {
      round: ExecutableRound;
      actor: ExecutableActorRef;
      exportPath: string;
      prefix?: string;
      fileType?: string;
    },
  ): Promise<{ fileName: string; filePath: string }> {
    const actorName = get_actor_name(args.actor) || "Actor";
    const fileName = addTimestampToFileName(
      `${args.prefix ?? ""}${actorName}_response`,
      args.fileType ?? "txt",
    );
    const filePath = path.join(args.exportPath, fileName);

    await writeActorResponsesToFile({
      round: args.round,
      actor: args.actor,
      filePath,
      getActorName: get_actor_name,
      getLastUsefulUtteranceResponse: (_round, actor) =>
        get_last_useful_utterance_response(ctx, ctx.conversation?.rounds, actor),
    });

    return { fileName, filePath };
  }

  async function export_all_responses(
    ctx: ExecutableCtxState,
    args: {
      round: ExecutableRound;
      actors: ExecutableActorRef[];
      exportPath: string;
      prefix?: string;
      fileType?: string;
    },
  ): Promise<{ fileName: string; filePath: string }> {
    const fileName = addTimestampToFileName(
      `${args.prefix ?? ""}AllResponses`,
      args.fileType ?? "txt",
    );
    const filePath = path.join(args.exportPath, fileName);
    const reasoning = get_reasoning_actor(ctx);
    const consolidatedResponse = get_consolidated_export_response(ctx);

    if (consolidatedResponse) {
      await fs.writeFile(filePath, `${consolidatedResponse}\n`, "utf8");
      return { fileName, filePath };
    }

    await writeAllResponsesToFile({
      conversation: ctx?.conversation ?? ctx,
      round: args.round,
      actors: args.actors ?? [],
      filePath,
      reasoning,
      suppressFileNarration: get_export_suppress_file_narration(ctx),
      getActorName: get_actor_name,
      getLastUsefulUtteranceResponse: (_conversation, actor) =>
        get_last_useful_utterance_response(ctx, ctx.conversation?.rounds, actor),
      getLastUsefulUtteranceResponseSequenceId: (_round, actor) =>
        get_last_useful_utterance_response_sequence_id(
          ctx.conversation?.rounds,
          actor,
        ),
    });

    return { fileName, filePath };
  }

  async function delay(ms: number): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  async function get_available_tools_for_mcp_node(
    _ctx: ExecutableCtxState,
    nodeName: string,
    nodeProps?: Record<string, unknown> | null,
  ): Promise<McpToolDescriptor[]> {
    if (!nodeName?.trim()) {
      return [];
    }

console.log("get_available_tools_for_mcp_node:", {
  nodeName,
  nodeProps,
});

    const props = nodeProps ?? {};

    // Only dynamic MCP nodes advertise optional tool use.
    // Static Weather before Consider injects evidence directly and does not need advertisement.
    const dynamicMode = readBool(
      props.DynamicMode ?? props.dynamicMode,
      false,
    );

console.log("get_available_tools_for_mcp_node dynamic check:", {
  nodeName,
  dynamicMode,
});

    if (!dynamicMode) {
      return [];
    }

    const endpoint = readString(
      props.McpEndpoint ??
        props.mcpEndpoint ??
        props.Endpoint ??
        props.endpoint,
      "http://localhost:3001/mcp",
    );

    const toolName = readString(
      props.ToolName ?? props.toolName,
      "",
    );

    if (!endpoint) {
      return [];
    }

    const tools = await get_advertised_tools(endpoint, toolName || undefined);

console.log("get_available_tools_for_mcp_node tools:", {
  nodeName,
  endpoint,
  toolName,
  count: tools.length,
  names: tools.map((tool) => tool.name),
});

    return tools;
  }

  async function call_mcp_tool(
    endpoint: string,
    toolName: string,
    args: JsonObject,
  ): Promise<McpToolResult> {
    return await McpStreamableClient.callToolOnce(endpoint, toolName, args);
  }

  function inject_available_tools_into_prompt(
    prompt: string,
    availableTools?: readonly McpToolDescriptor[] | null,
  ): string {
    if (!availableTools || availableTools.length === 0) {
      return prompt;
    }

    const lines: string[] = [];

    lines.push("");
    lines.push("");
    lines.push("Available MCP tools:");
    lines.push(
      "You may request one of the following tools only when it is needed to answer the user's request.",
    );

    for (const tool of availableTools) {
      lines.push("");
      lines.push(`Tool: ${tool.name}`);

      if (tool.description?.trim()) {
        lines.push(`Description: ${tool.description}`);
      }

      if (tool.inputSchemaJson?.trim()) {
        lines.push(`Input Schema: ${tool.inputSchemaJson}`);
      }
    }

    lines.push("");
    lines.push("If no tool is needed, answer the request normally.");
    lines.push(
      "If a tool is required, respond only with a tool request in this format:",
    );
    lines.push("{");
    lines.push('  "toolRequested": true,');
    lines.push('  "toolName": "<tool name>",');
    lines.push('  "arguments": { }');
    lines.push("}");

    return prompt + lines.join("\n");
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

    get_to_list_names(
      to: ExecutableActorRef | string | Array<ExecutableActorRef | string> | undefined,
    ): string;

    get_clean_prompt(value: unknown): string;

    get_collect_input_spec(
      ctx: ExecutableCtxState,
      nodeName: string,
    ): { label: string; help: string; key: string };

    clear_embeds(ctx: ExecutableCtxState): void;

    directory_exists(directoryPath: string): Promise<boolean>;
    get_load_filenames(importPath: string, filter?: string): Promise<Array<[string, string]>>;
    wait_for_load_files(
      importPath: string,
      filter?: string,
      options?: { pollMs?: number; ctx?: any; nodeName?: string },
    ): Promise<Array<[string, string]>>;
    load_files_for_actors(
      ctx: ExecutableCtxState,
      args: {
        nodeName?: string;
        round: ExecutableRound;
        actors: ExecutableActorRef[];
        filesList: Array<[string, string]>;
        importPath: string;
        rawMode?: boolean;
        from?: unknown;
        moveToHistory?: boolean;
      },
    ): Promise<Map<ExecutableActorRef, string[]>>;
    create_load_prompt(nodeBlurbs?: any): string;
    get_load_passing_to_blurb(nodeBlurbs?: any): string;
    get_prompt_hint(ctx: ExecutableCtxState): string;
    create_export_prefix_from_prompt_hint(promptHint: string): Promise<string>;
    ensure_export_directory(exportPath: string): Promise<void>;
    export_actor_responses(
      ctx: ExecutableCtxState,
      args: {
        round: ExecutableRound;
        actor: ExecutableActorRef;
        exportPath: string;
        prefix?: string;
        fileType?: string;
      },
    ): Promise<{ fileName: string; filePath: string }>;
    export_all_responses(
      ctx: ExecutableCtxState,
      args: {
        round: ExecutableRound;
        actors: ExecutableActorRef[];
        exportPath: string;
        prefix?: string;
        fileType?: string;
      },
    ): Promise<{ fileName: string; filePath: string }>;
    delay(ms: number): Promise<void>;

    get_available_tools_for_mcp_node(
      ctx: ExecutableCtxState,
      nodeName: string,
      nodeProps?: Record<string, unknown> | null,
    ): Promise<McpToolDescriptor[]>;

    get_advertised_tools(
      endpoint: string,
      toolName?: string,
    ): Promise<McpToolDescriptor[]>;

    call_mcp_tool(
      endpoint: string,
      toolName: string,
      args: JsonObject,
    ): Promise<McpToolResult>;

    inject_available_tools_into_prompt(
      prompt: string,
      availableTools?: readonly McpToolDescriptor[] | null,
    ): string;

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

      get_advertised_tools,

      get_available_tools_for_mcp_node,

      call_mcp_tool,

      inject_available_tools_into_prompt,      

      directory_exists,

      get_load_filenames,

      wait_for_load_files,

      load_files_for_actors,

      create_load_prompt,

      get_load_passing_to_blurb,

      get_prompt_hint,

      create_export_prefix_from_prompt_hint,

      ensure_export_directory,

      export_actor_responses,

      export_all_responses,

      delay,

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

        const providerRef = String(target.provider ?? "").trim();

        const connectorId: ProviderId =
          providerRef.includes("-")
            ? getProviderFromModel(target.model)
            : normalizeConnectorId(providerRef);

        const connector = getConnector(connectorId);

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
