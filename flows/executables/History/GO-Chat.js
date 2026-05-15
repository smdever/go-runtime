// ============================================================
// LOKIPIED Compiler 1.0.2
// Flow: GO Canvas Export
// Version: 1.0.0
// Build: 1
// Generated: 2026-02-22 02:52:36 UTC
// ============================================================

export function createFlow(runtime) {
  const rt = runtime || (typeof globalThis !== 'undefined' ? globalThis : null) || {};
  const info = {"title": "GO Canvas Export", "accountId": "", "build": 1, "created": "2026-02-19T08:59:59.710Z", "modified": "2026-02-19T08:59:59.710Z", "version": "1.0.0", "company": "", "creator": ""};

  const __information = {"compiler": {"name": "LOKIPIED Compiler", "version": "1.0.2"}, "generated": "2026-02-22 02:52:36 UTC", "protection": {"encrypted": false, "scheme": "none"}, "flow": {"title": "GO Canvas Export", "version": "1.0.0", "build": 1, "accountId": "", "created": "2026-02-19T08:59:59.710Z", "modified": "2026-02-19T08:59:59.710Z"}};
  function getInformation(){ return __information; }

  const __nodeProps = {"Begin": {}, "Init": {}, "Agree": {"agreementPrompt": "Welcome to the consensus forum. You are one of many expert intelligences participating. Be respectful, minimize bias and stay on topic. Reply exactly 'Ready' acknowledging this agreement when you are ready.", "acceptableResponseToken": "Ready"}, "CollectInput": {}, "PassToEach": {}, "Gather": {}, "Deliver": {}, "Reports": {}, "RoundsReport": {}, "Eject": {}};
  const node_props = (name) => (__nodeProps && __nodeProps[name]) ? __nodeProps[name] : {};

  const __nodeBlurbs = {"Begin": {}, "Init": {}, "Agree": {}, "CollectInput": {}, "PassToEach": {}, "Gather": {}, "Deliver": {}, "Reports": {}, "RoundsReport": {}, "Eject": {}};
  const node_blurbs = (name) => (__nodeBlurbs && __nodeBlurbs[name]) ? __nodeBlurbs[name] : {};

    // Runtime hook aliases (so compiled nodes can call functions by old names)
    const ensure_ctx = (typeof rt.ensure_ctx === 'function') ? rt.ensure_ctx.bind(rt) : rt.ensure_ctx;
    const ensure_conversation = (typeof rt.ensure_conversation === 'function') ? rt.ensure_conversation.bind(rt) : rt.ensure_conversation;
    const set_active_node = (typeof rt.set_active_node === 'function') ? rt.set_active_node.bind(rt) : rt.set_active_node;
    const get_passive = (typeof rt.get_passive === 'function') ? rt.get_passive.bind(rt) : rt.get_passive;
    const get_actors = (typeof rt.get_actors === 'function') ? rt.get_actors.bind(rt) : rt.get_actors;
    const get_narrator = (typeof rt.get_narrator === 'function') ? rt.get_narrator.bind(rt) : rt.get_narrator;
    const get_last_round = (typeof rt.get_last_round === 'function') ? rt.get_last_round.bind(rt) : rt.get_last_round;
    const get_last_context = (typeof rt.get_last_context === 'function') ? rt.get_last_context.bind(rt) : rt.get_last_context;
    const get_last_useful_context = (typeof rt.get_last_useful_context === 'function') ? rt.get_last_useful_context.bind(rt) : rt.get_last_useful_context;
    const create_round = (typeof rt.create_round === 'function') ? rt.create_round.bind(rt) : rt.create_round;
    const create_round_from_last = (typeof rt.create_round_from_last === 'function') ? rt.create_round_from_last.bind(rt) : rt.create_round_from_last;
    const create_utterance = (typeof rt.create_utterance === 'function') ? rt.create_utterance.bind(rt) : rt.create_utterance;
    const sync_round_actors = (typeof rt.sync_round_actors === 'function') ? rt.sync_round_actors.bind(rt) : rt.sync_round_actors;
    const remove_actor = (typeof rt.remove_actor === 'function') ? rt.remove_actor.bind(rt) : rt.remove_actor;
    const send_utterance = (typeof rt.send_utterance === 'function') ? rt.send_utterance.bind(rt) : rt.send_utterance;
    const get_to_list_names = (typeof rt.get_to_list_names === 'function') ? rt.get_to_list_names.bind(rt) : rt.get_to_list_names;
    const get_conversation_prompt = (typeof rt.get_conversation_prompt === 'function') ? rt.get_conversation_prompt.bind(rt) : rt.get_conversation_prompt;
    const get_clean_prompt = (typeof rt.get_clean_prompt === 'function') ? rt.get_clean_prompt.bind(rt) : rt.get_clean_prompt;
    const get_collect_input_spec = (typeof rt.get_collect_input_spec === 'function') ? rt.get_collect_input_spec.bind(rt) : rt.get_collect_input_spec;
    const clear_embeds = (typeof rt.clear_embeds === 'function') ? rt.clear_embeds.bind(rt) : rt.clear_embeds;
    const emit_process = (typeof rt.emit_process === 'function') ? rt.emit_process.bind(rt) : rt.emit_process;
    const emit_update = (typeof rt.emit_update === 'function') ? rt.emit_update.bind(rt) : rt.emit_update;
    const emit_ready = (typeof rt.emit_ready === 'function') ? rt.emit_ready.bind(rt) : rt.emit_ready;
    const emit_exec_llm_call = (typeof rt.emit_exec_llm_call === 'function') ? rt.emit_exec_llm_call.bind(rt) : rt.emit_exec_llm_call;
    const emit_exec_llm_result = (typeof rt.emit_exec_llm_result === 'function') ? rt.emit_exec_llm_result.bind(rt) : rt.emit_exec_llm_result;
    const emit_exec_decision = (typeof rt.emit_exec_decision === 'function') ? rt.emit_exec_decision.bind(rt) : rt.emit_exec_decision;
    const emit_exec_collect_input = (typeof rt.emit_exec_collect_input === 'function') ? rt.emit_exec_collect_input.bind(rt) : rt.emit_exec_collect_input;
    const emit_exec_prompt_accepted = (typeof rt.emit_exec_prompt_accepted === 'function') ? rt.emit_exec_prompt_accepted.bind(rt) : rt.emit_exec_prompt_accepted;
    const report_state = (typeof rt.report_state === 'function') ? rt.report_state.bind(rt) : rt.report_state;
    const report_name_stamp = (typeof rt.report_name_stamp === 'function') ? rt.report_name_stamp.bind(rt) : rt.report_name_stamp;
    const report_detail_create_json = (typeof rt.report_detail_create_json === 'function') ? rt.report_detail_create_json.bind(rt) : rt.report_detail_create_json;
    const emit_report = (typeof rt.emit_report === 'function') ? rt.emit_report.bind(rt) : rt.emit_report;


  async function execute(ctx){
    ctx = (typeof ensure_ctx === 'function') ? ensure_ctx(ctx) : (ctx || {});
    ctx.meta = ctx.meta || {};
    ctx.meta.flow = ctx.meta.flow || info;

    await fn1_Begin(ctx);
    return ctx;
  }

  async function cont(ctx) {
    if (!ctx) return ctx;
    const k = ctx.__lokipied_continue;
    if (typeof k === 'function') {
      ctx.__lokipied_continue = null;
      await k();
    }
    return ctx;
  }

  async function fn1_Begin(ctx) {
    /* Begin - Terminal for starting a flow. */
    var _name = "Begin";
    console.log("Begin: Begin");
    await emit_process(_name);
    await emit_update(_name);
    await emit_ready(_name);
    await fn2_Init(ctx);
    return ctx;
  }

  async function fn2_Init(ctx) {
    /* Init - validates actors exist, creates a new round (cloned from last if present), then continues. */
    var _name = "Init";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("Init: Init");
      await emit_update(_name);

      // Optional pacing (mirrors C# Task.Delay(100))
      // await new Promise(r => setTimeout(r, 100));

      // Validate actors exist (C# throws if none)
      const actors = get_actors(ctx) || [];
      if (!actors.length) {
        const msg = (node_props(_name)?.errorActors) || "Init error: no actors configured.";
        console.error(msg);
        throw new Error(msg);
      }

      // Create round and assignments (C# CreateRoundAsync clones last round if present)
      const lastRound = get_last_round(ctx);
      if (lastRound) {
        create_round_from_last(ctx, _name, lastRound);
      } else {
        create_round(ctx, _name, null);
      }

      await emit_update(_name);
      await emit_ready(_name);

      await fn3_Agree(ctx);
    } finally {
    }
    return;
  }

  async function fn3_Agree(ctx) {
    /* Agree - asks all LLM actors to acknowledge the agreement token; removes dissenters; branches yes/no. */
    var _name = "Agree";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name); // if runtime signature differs, use set_active_node(ctx, _name)
      console.log("Agree: Agree");
      await emit_update(_name);

      const prompt = (node_props(_name)?.agreementPrompt ?? "");
      const token  = (node_props(_name)?.acceptableResponseToken ?? "");
      const check = String(token || "").trim().toLowerCase();

      const lastRound = get_last_round(ctx);
      const round = create_round(ctx, _name, lastRound);

      const actors = [...get_actors(ctx)];
      const parallel = true; //get_parallel_mode(ctx);
      const tasks = [];

      for (const to of actors) {
        const utt = create_utterance(ctx, round, {
          to,
          from: get_narrator(ctx),
          prompt,
          context: get_last_context(lastRound, to)
        });

        // C# logs "Agreeing" per actor; you can emit call telemetry here
        await emit_exec_llm_call(_name, { to: to?.name });

        const p = send_utterance(ctx, utt);
        tasks.push(p);
        if (!parallel) await p;
      }

      if (parallel) await Promise.all(tasks);
      await emit_update(_name);

      // Check agreement; remove dissenters
      let agreeable = 0;
      const singleActor = (round?.actors?.length ?? actors.length) <= 1;

      for (const u of (round?.utterances ?? [])) {
        for (const r of (u?.responses ?? [])) {
          const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
          const text = rawText.toLowerCase();

          if (check && text.includes(check)) {
            if (singleActor) { agreeable = 1; break; }
            agreeable++;
            await emit_exec_llm_result(_name, { from: r?.from?.name, ok: true, preview: rawText.slice(0, 200) });
          } else {
            remove_actor(ctx, r?.from);
            await emit_exec_llm_result(_name, { from: r?.from?.name, ok: false, preview: rawText.slice(0, 200) });
          }
        }
        if (singleActor && agreeable > 0) break;
      }

      const ok = (agreeable > 0);
      await emit_exec_decision(_name, { ok, agreeable });
      await emit_update(_name);

      // IMPORTANT for recursive runner telemetry:
      // ready BEFORE branch so the UI doesn't wait for the full stack unwind.
      await emit_ready(_name);

      if (ok) {
        await fn4_CollectInput(ctx);
      } else {
        await fn10_Eject(ctx);
      }
    } finally {
    }
    return;
  }

  async function fn4_CollectInput(ctx) {
    /* CollectInput - Waits for input. UI will set Conversation.Prompt and call Continue(ctx). */
    var _name = "CollectInput";
    await emit_process(_name);
    try {
      console.log("CollectInput: CollectInput");
      await emit_update(_name);
      set_active_node(ctx, _name);
      ensure_conversation(ctx);

      // Tell UI we need input (UI decides how to display).
      // spec can include label/help/default; keep it minimal for now.
      const spec = get_collect_input_spec(ctx, _name);
      emit_exec_collect_input(_name, spec);

      // If passive, auto-continue immediately (mirrors Conversation.Passive path).
      if (get_passive(ctx)) {
        ctx.__lokipied_continue = async () => {};
      } else {
        // Install continuation. Execute() will return after this node; UI must call Continue(ctx).
        ctx.__lokipied_continue = async () => {
          try {
            await emit_process(_name);
            await emit_update(_name);

            // Pull the prompt from the shared conversation slot
            const prompt = String(get_conversation_prompt(ctx) ?? "");
            await emit_exec_prompt_accepted(_name, { promptPreview: prompt.slice(0, 120) });

            // Create a new round and assign utterances (no sends here; next nodes use them)
            const lastRound = get_last_round(ctx);
            const round = create_round(ctx, _name, lastRound);
            sync_round_actors(ctx, round);
            round.utterances = [];

            const actors = get_actors(ctx);
            for (const to of actors) {
              create_utterance(ctx, round, {
                to,
                from: get_narrator(ctx),
                prompt: get_clean_prompt(prompt),
                context: get_last_useful_context(ctx, to)
              });
            }

            clear_embeds(ctx);

            await emit_ready(_name);
            // Continue to Next[0]
            await fn5_PassToEach(ctx);
          } finally {
          }
        };
      }

    } finally {
      // In non-passive mode, we WANT the node to be 'ready' for UI input now.
      if (!get_passive(ctx)) await emit_ready(_name);
    }
    return;
  }

  async function fn5_PassToEach(ctx) {
    /* PassToEach - sends recent input to all LLM actors. */
    var _name = "PassToEach";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("PassToEach: PassToEach");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);
      const round = create_round_from_last(ctx, _name, lastRound);

      const parallel = true; //get_parallel_mode(ctx);
      const tasks = [];

      for (const utt of (round.utterances ?? [])) {
        utt.prompt = "Passing information for your review.\n\n" + String(utt.prompt ?? "");

        const toList = get_to_list_names(utt.to);
        const fullPrompt = String(utt.prompt ?? "");

        await emit_exec_llm_call(_name, {
          from: utt.from?.name,
          to: toList,
          promptPreview: fullPrompt.slice(0, 200),
          promptChars: fullPrompt.length
        });

        const p = (async () => {
          const r = await send_utterance(ctx, utt);
          const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
          await emit_exec_llm_result(_name, {
            from: r?.from?.name,
            preview: rawText.slice(0, 200),
            respChars: rawText.length
          });
          return r;
        })();

        tasks.push(p);
        if (!parallel) {
          // mimic C#'s "wait inside loop" behavior
          await p;
        }
      }

      // WaitFor All (parallel case); sequential already awaited each
      if (parallel) await Promise.all(tasks);

      await emit_update(_name);
      await emit_ready(_name);

      await fn6_Gather(ctx);
    } finally {
    }
    return;
  }

  async function fn6_Gather(ctx) {
    /* Gather - clones last round actors + utterances (INCLUDING responses) into a new round, then continues. */
    var _name = "Gather";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("Gather: Gather");
      await emit_update(_name);

      console.log("Gathering...");

      const lastRound = get_last_round(ctx);

      // Create a new round boundary for Gather
      const round = create_round(ctx, _name, lastRound);

      if (lastRound) {
        // C# CreateRoundAsync carries forward actors + utterances (responses included)
        round.actors = (lastRound.actors || []).slice();

        // Shallow-clone utterances so we don't mutate lastRound in-place,
        // but keep responses intact.
        round.utterances = (lastRound.utterances || []).map(u => ({
          ...u,
          responses: Array.isArray(u?.responses) ? u.responses.slice() : (u?.responses ?? [])
        }));

        // Preserve per-actor context map if present (handy for downstream helpers)
        if (lastRound.lastContextByActor) {
          round.lastContextByActor = { ...lastRound.lastContextByActor };
        }
      } else {
        round.actors = (get_actors(ctx) || []).slice();
        round.utterances = [];
      }

      await emit_update(_name);
      await emit_ready(_name);

      await fn7_Deliver(ctx);
    } finally {
    }
    return;
  }

  async function fn7_Deliver(ctx) {
    /* Deliver - emits the final unifiedResponse from the most recent useful utterance response. */
    var _name = "Deliver";
    await emit_process(_name);
    try {
      // capture the previous node identity before we overwrite activeNode
      const _prevNode = ctx.activeNode ?? (ctx.conversation?.activeNode ?? null);

      set_active_node(ctx, _name);
      console.log("Deliver: Deliver");

      const lastRound = get_last_round(ctx);

      // Optional: mirror C# behavior by creating a boundary round for Deliver
      // (Whether you want this is up to you; it's mostly audit/logging.)
      create_round(ctx, _name, lastRound);

      const singlePara = !!(node_props(_name)?.useSingleParagraphResponse);

      const lastWasUnified =
          (lastRound?.name === "UnifiedResponse")
       || (_prevNode === "UnifiedResponse");

      function single_paragraph(s) {
        return String(s ?? "")
          .replace(/\s*\n+\s*/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
      }

      function last_useful_text(preferActorName = null) {
        const rounds = (ctx.conversation?.rounds ?? []);
        for (let ri = rounds.length - 1; ri >= 0; ri--) {
          const rr = rounds[ri];
          const utterances = rr?.utterances ?? [];
          for (let ui = utterances.length - 1; ui >= 0; ui--) {
            const u = utterances[ui];

            if (preferActorName) {
              const toName = u?.to?.name ?? String(u?.to ?? "");
              if (toName && toName !== preferActorName) continue;
            }

            const responses = u?.responses ?? [];
            for (let pi = responses.length - 1; pi >= 0; pi--) {
              const r = responses[pi];
              const raw = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
              const t = raw.trim();
              if (t) return t;
            }
          }
        }
        return "";
      }

      const firstActorName = (get_actors(ctx)?.[0]?.name ?? null);

      // C# difference: lastWasUnified uses a different lane; in LOKIT-Lite we can just broaden scan
      const reasoningName = ctx.reasoning?.name ?? null;

      let response = "";
      if (lastWasUnified) {
        // C# behavior: UnifiedResponse pulls from Reasoning actor
        response = (reasoningName ? last_useful_text(reasoningName) : "")
               || last_useful_text(null);
      } else {
        // C# behavior: non-unified pulls from first actor
        response = (firstActorName ? last_useful_text(firstActorName) : "")
               || last_useful_text(null);
      }

      const unified = singlePara ? single_paragraph(response) : String(response ?? "");

      ctx.vars ||= {};
      ctx.vars.unifiedResponse = unified;

      ctx.conversation ||= {};
      ctx.conversation.unifiedResponse = unified;

      console.log(unified);

      // Emit delivered output into the outer log (FULL text)
      const full = String(unified ?? "");
      await emit_exec_llm_result(_name, {
        from: "Deliver",
        preview: full,
        respChars: full.length
      });

      await emit_update(_name, { unifiedChars: unified.length, singlePara, lastWasUnified });
      await emit_ready(_name);

      await fn8_Reports(ctx);
    } finally {
    }
    return;
  }

  async function fn8_Reports(ctx) {
    /*
    "Reports": {
      "Type": "Reports",
      "Properties": {
        "sequentialModeOnly": false,
        "clearAll": false
      },
      "Next": ["WhateverNext"]
    }
    */

    /* Reports - emits a State Report (ReportDetail) then continues to Next[0]. */
    var _name = "Reports";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("Reports: Reports");
      await emit_update(_name);

      console.log("Report.");

      const clearAll = !!(node_props(_name)?.clearAll);

      // Conversation.Reports analogue
      ctx.reports ||= {};
      ctx.reports.details ||= [];
      if (clearAll) ctx.reports.details = [];

      // Build payload (includeRounds = false)
      const payloadJson = report_state(ctx, false);

      // Name stamp
      const title = String(ctx?.conversation?.title ?? ctx?.meta?.flow?.title ?? "Flow");
      const stamped = report_name_stamp(title + "_State");

      // Create ReportDetail
      const detail = report_detail_create_json({
        runId: String(ctx?.meta?.runId ?? ctx?.conversation?.instanceId ?? ""),
        name: stamped,
        type: "Reports",
        schemaVersion: 1,
        sourceNodeId: String(ctx?.activeNodeId ?? ""),
        sourceNodeType: "Reports",
        sourceNodeName: _name,
        sequenceId: Number(ctx?.conversation?.rounds?.length ?? 0),
        blurb: "State Report",
        payloadJson
      });

      ctx.reports.details.push(detail);
      await emit_report(_name, detail);

      // Boundary round (mirrors C# CreateRoundAsync)
      const lastRound = get_last_round(ctx);
      create_round(ctx, _name, lastRound);

      console.log("Reports complete.");
      await emit_update(_name);
      await emit_ready(_name);

      await fn9_RoundsReport(ctx);
    } finally {
    }
    return;
  }

  async function fn9_RoundsReport(ctx) {
    /*
    "RoundsReport": {
      "Type": "RoundsReport",
      "Properties": {
        "clearAll": false
      },
      "Next": ["WhateverNext"]
    }
    */

    /* RoundsReport - emits a verbose round/state snapshot as a ReportDetail JSON payload. */
    var _name = "RoundsReport";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("RoundsReport: RoundsReport");
      await emit_update(_name);

      console.log("RoundsReport.");

      const clearAll = !!(node_props(_name)?.clearAll);

      // Conversation.Reports analogue
      ctx.reports ||= {};
      ctx.reports.details ||= [];
      if (clearAll) ctx.reports.details = [];

      // Build payload (includeRounds = true)
      const payloadJson = report_state(ctx, true);

      // Name stamp
      const title = String(ctx?.conversation?.title ?? ctx?.meta?.flow?.title ?? "Flow");
      const stamped = report_name_stamp(title + "_Rounds");

      // Create ReportDetail
      const detail = report_detail_create_json({
        runId: String(ctx?.meta?.runId ?? ctx?.conversation?.instanceId ?? ""),
        name: stamped,
        type: "RoundsReport",
        schemaVersion: 1,
        sourceNodeId: String(ctx?.activeNodeId ?? ""), // optional; usually blank today
        sourceNodeType: "RoundsReport",
        sourceNodeName: _name,
        sequenceId: Number(ctx?.conversation?.rounds?.length ?? 0),
        blurb: "Rounds Report",
        payloadJson
      });

      ctx.reports.details.push(detail);
      await emit_report(_name, detail);

      // Boundary round (mirrors C# CreateRoundAsync)
      const lastRound = get_last_round(ctx);
      create_round(ctx, _name, lastRound);

      console.log("RoundsReport complete.");
      //await emit_report(_name, { ...detail, blurb: "RoundsReport complete." });

      await emit_update(_name);
      await emit_ready(_name);

      await fn4_CollectInput(ctx);
    } finally {
    }
    return;
  }

  async function fn10_Eject(ctx) {
    /* Eject - Terminal for LLM taken out of regular flow. */
    var _name = "Eject";
    console.log("Eject: Eject");
    await emit_process(_name);
    await emit_update(_name);
    await emit_ready(_name);
    return ctx;
  }

  return { info, getInformation, execute, continue: cont };
}
