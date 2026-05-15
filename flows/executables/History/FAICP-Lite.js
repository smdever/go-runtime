// ============================================================
// LOKIPIED Compiler 1.0.2
// Flow: LOKIPAI FAICP-Lite
// Version: 1.0.0
// Build: 1
// Generated: 2026-02-08 21:27:12 UTC
// ============================================================

export function createFlow(runtime) {
  const rt = runtime || (typeof globalThis !== 'undefined' ? globalThis : null) || {};
  const info = {"title": "LOKIPAI FAICP-Lite", "accountId": "", "build": 1, "created": "2026-02-07 10:44:00 UTC", "modified": "", "version": "1.0.0", "company": "", "creator": ""};

  const __information = {"compiler": {"name": "LOKIPIED Compiler", "version": "1.0.2"}, "generated": "2026-02-08 21:27:12 UTC", "flow": {"title": "LOKIPAI FAICP-Lite", "version": "1.0.0", "build": 1, "accountId": "", "created": "2026-02-07 10:44:00 UTC", "modified": ""}};
  function getInformation(){ return __information; }

  const __nodeRuntime = {}; 
  const node_runtime = (name) => (__nodeRuntime && __nodeRuntime[name]) ? __nodeRuntime[name] : {};

  const __nodeProps = {"Begin": {}, "Init": {}, "Agree": {"acceptableResponseToken": "Ready", "agreementPrompt": "Welcome to the consensus forum. You are one of many expert intelligences participating. Be respectful, minimize bias and stay on topic. Reply exactly 'Ready' acknowledging this agreement when you are ready."}, "CollectInput": {}, "PassToEach": {}, "Gather": {}, "First": {}, "PassEachResponse": {}, "PassBackCommentary": {}, "PassToFinal": {}, "Gather1": {}, "Bias": {}, "PassToReasoning": {}, "UnifiedResponse": {}, "Deliver": {}, "Eject-Bias": {}, "Eject-Agree": {}};
  const node_props = (name) => (__nodeProps && __nodeProps[name]) ? __nodeProps[name] : {};

  const __nodeBlurbs = {"Begin": {"Intro": "Beginning..."}, "Init": {}, "Agree": {}, "CollectInput": {"Intro": "Operation pauses. Waiting for prompt..."}, "PassToEach": {}, "Gather": {}, "First": {}, "PassEachResponse": {"Intro": "Passing Each Response To Each..."}, "PassBackCommentary": {}, "PassToFinal": {"Intro": "Passing To Each for Final Response..."}, "Gather1": {"Intro": "Gathering..."}, "Bias": {}, "PassToReasoning": {}, "UnifiedResponse": {}, "Deliver": {}, "Eject-Bias": {}, "Eject-Agree": {}};
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
        await fn17_Eject_Agree(ctx);
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

      await fn7_First(ctx);
    } finally {
    }
    return;
  }

  async function fn7_First(ctx) {
    /* First - Queues Next[0] / Yes on the first pass and Next[1] / No on all subsequent passes. */
    var _name = "First";
    await emit_process(_name);
    try {
      console.log("First: First");
      await emit_update(_name);

      ctx.nodeState ||= {};
      ctx.nodeState["First"] ||= {};
      if (typeof ctx.nodeState["First"].isFirst !== "boolean") ctx.nodeState["First"].isFirst = true;
      const isFirst = !!ctx.nodeState["First"].isFirst;
      console.log("First: Intro " + isFirst);
      await new Promise(r => setTimeout(r, 100));
      const lastRound = get_last_round(ctx);
      create_round(ctx, _name, lastRound);
      console.log("First: FirstPassing " + isFirst);
      await emit_ready(_name);
      if (isFirst) {
        ctx.nodeState["First"].isFirst = false;
        await fn8_PassEachResponse(ctx);
      } else {
        await fn10_PassToFinal(ctx);
      }
    } finally {
    }
    return;
  }

  async function fn8_PassEachResponse(ctx) {
    /* PassEachResponse - asks each actor to comment on other actors' most recent responses; special handling when previous node was RAG. */
    var _name = "PassEachResponse";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("PassEachResponse: PassEachResponse");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);

      // Create boundary round (mirrors CreateRoundAsync) and clear utterances
      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      round.utterances = []; // mirrors round.Utterances.Clear()

      const parallel = !!(ctx?.exec?.parallelMode);

      function clean_prompt(s) {
        // Similar to Stringer.GetCleanPrompt
        return String(s ?? "").trim();
      }
      function clean_response(s) {
        // Similar to Stringer.GetCleanResponse
        return String(s ?? "").trim();
      }

      // ---- Blurb: "PreparingFor" ----
      // C# uses: Blurbs.Conversation[this.Type.ToString()]["PreparingFor"].Replace("{from.Name}", actor.Name)
      // We will pull from node blurbs if present; otherwise fallback.
      function preparing_for(name) {
        const raw =
          (node_blurbs && node_blurbs(_name) && (node_blurbs(_name).PreparingFor || node_blurbs(_name).preparingFor)) ||
          "Preparing commentary request for {from.Name}";
        return String(raw).replace("{from.Name}", String(name ?? ""));
      }

      function create_request_commentary_prompt(fromActor, responseText) {
        // Mirrors CreateRequestCommentaryPrompt
        let p = preparing_for(fromActor?.name ?? "") + "\n\n";
        p = clean_prompt(p);
        p += "\n\n" + clean_response(responseText);
        return p;
      }

      function create_generic_commentary_prompt(fromActor, prefix, responseText) {
        // Mirrors CreateGenericCommentaryPrompt
        let p = `Passing information for your review.\n\n${String(prefix ?? "")}`;
        p = clean_prompt(p);
        p += "\n\n" + clean_response(responseText);
        return p;
      }

      function actor_name(a) {
        return a?.name ?? String(a ?? "");
      }

      // Find the last useful utterance response addressed TO a given actor (like Lookup.GetLastUsefulUtteranceResponse)
      function get_last_useful_utterance_response_for_actor(targetActorName) {
        const rounds = (ctx.conversation?.rounds ?? []);
        for (let ri = rounds.length - 1; ri >= 0; ri--) {
          const rr = rounds[ri];
          const utterances = rr?.utterances ?? [];
          for (let ui = utterances.length - 1; ui >= 0; ui--) {
            const u = utterances[ui];
            const toName = actor_name(u?.to);
            if (!toName || toName !== targetActorName) continue;

            const responses = u?.responses ?? [];
            for (let pi = responses.length - 1; pi >= 0; pi--) {
              const r = responses[pi];
              const raw = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "").trim();
              if (raw) return raw;
            }
          }
        }
        return "";
      }

      // Helper for "to list" display (handles single or array)
      function to_list_names(to) {
        if (!to) return "";
        if (Array.isArray(to)) return to.map(x => actor_name(x)).join(", ");
        return actor_name(to);
      }

      // Detect prior node was RAG (JS has round.name, not NodeType)
      const lastWasRag = (lastRound?.name === "RAG");

      if (lastWasRag) {
        console.log("Distributing RAG results to Actors..");

        // Clone utterances from lastRound into this round
        for (const u of (lastRound?.utterances ?? [])) {
          // Shallow clone; we keep responses for access
          const clone = {
            ...u,
            responses: (u?.responses ?? []).map(r => ({ ...r })),
            // keep existing to/from/prompt/context
          };
          round.utterances.push(clone);
        }

        const tasks = [];

        for (const u of (round.utterances ?? [])) {
          const responses = (u?.responses ?? []);
          if (!responses.length) {
            console.log(`..${actor_name(u?.from)} no response detected.`);
            continue;
          }

          // In C#, utterance.From is the source; utterance.Prompt is prefix; response is Responses[0]
          const fromActor = u?.from;
          const prefix = String(u?.prompt ?? "");
          const firstResp = String(responses?.[0]?.apiResponse?.response ?? responses?.[0]?.apiResponse?.Response ?? responses?.[0]?.text ?? "");
          u.prompt = create_generic_commentary_prompt(fromActor, prefix, firstResp);

          // Context: C# uses Lookup.GetLastUsefulContext(conversation, utterance.To[0])
          // Our runtime has get_last_useful_context stubbed; use get_last_context from lastRound as best available.
          u.context = get_last_context(lastRound, u?.to);

          await emit_exec_llm_call(_name, {
            from: actor_name(fromActor),
            to: to_list_names(u?.to),
            stage: "rag_distribute",
            promptPreview: String(u.prompt ?? "").slice(0, 200),
            promptChars: String(u.prompt ?? "").length
          });

          const p = (async () => {
            const r = await send_utterance(ctx, u);
            const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
            await emit_exec_llm_result(_name, {
              from: r?.from?.name,
              stage: "rag_distribute",
              preview: rawText.slice(0, 200),
              respChars: rawText.length
            }); 
            return r;
          })();

          tasks.push(p);
          console.log(".." + actor_name(fromActor) + " to " + to_list_names(u?.to));

          if (!parallel) {
            // mirrors C# "if not parallel, await inside loop"
            await Promise.all(tasks);
          }
        }

        await Promise.all(tasks);
      } else {
        // Non-RAG path:
        // For each actor, find their last useful response, then ask every other actor to comment on it.
        const actors = (round?.actors ?? get_actors(ctx) ?? []);

        for (const actor of actors) {
          const aName = actor_name(actor);
          const response = get_last_useful_utterance_response_for_actor(aName);

          if (response && String(response).trim()) {
            console.log(preparing_for(aName));

            const tasks = [];

            for (const commentor of actors) {
              const cName = actor_name(commentor);
              if (!cName || cName === aName) continue;

              // Create utterance: To=commentor, From=actor (the one being commented on)
              const utt = create_utterance(ctx, round, {
                to: commentor,
                from: actor, // NOTE: we pass the actor as "from" to preserve semantics (though send_utterance resolves provider from utt.to)
                prompt: create_request_commentary_prompt(actor, response),
                context: get_last_context(lastRound, commentor)
              });

              await emit_exec_llm_call(_name, {
                from: aName,
                to: cName,
                stage: "request_commentary",
                promptPreview: String(utt.prompt ?? "").slice(0, 200),
                promptChars: String(utt.prompt ?? "").length
              });

              const p = (async () => {
                const r = await send_utterance(ctx, utt);
                const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
                await emit_exec_llm_result(_name, {
                  from: r?.from?.name,
                  stage: "request_commentary",
                  preview: rawText.slice(0, 200),
                  respChars: rawText.length
                });
                return r;
              })();

              tasks.push(p);

              console.log(".." + aName + "->" + cName);
              console.log(".." + String(utt.prompt ?? ""));

              if (!parallel) {
                await Promise.all(tasks);
              }
            }

            await Promise.all(tasks);
          }
        }
      }

      await emit_update(_name);
      await emit_ready(_name);

      await fn9_PassBackCommentary(ctx);
    } catch (ex) {
      console.error(`Error in ${_name}:`, ex);
      throw ex;
    } finally {
      // C# Ready(this, true)
      // Your templates typically call emit_ready before branching; we already did.
    }
    return;
  }

  async function fn9_PassBackCommentary(ctx) {
    /* PassBackCommentary - collects commentary from all other actors and passes it back to each actor as a narrator summary bundle. */
    var _name = "PassBackCommentary";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("PassBackCommentary: PassBackCommentary");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);

      // Create boundary round and clear utterances
      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      round.utterances = []; // mirrors round.Utterances.Clear()

      const parallel = !!(ctx?.exec?.parallelMode);
      const tasks = [];

      function clean_prompt(s) { return String(s ?? "").trim(); }
      function clean_response(s) { return String(s ?? "").trim(); }
      function actor_name(a) { return a?.name ?? String(a ?? ""); }

      // ---- Blurbs ----
      function blurb(key, fallback) {
        const b = (node_blurbs && node_blurbs(_name)) ? node_blurbs(_name) : {};
        return String(b?.[key] ?? b?.[key?.toLowerCase?.()] ?? fallback ?? "");
      }

      function preparing_to(name) {
        // Blurbs: ["PreparingTo"].Replace("{from.Name}", actor.Name)
        const raw = blurb("PreparingTo", "Preparing to pass back commentary to {from.Name}");
        return raw.replace("{from.Name}", String(name ?? ""));
      }

      function has_collected() {
        // Blurbs: ["HasCollected"]
        return blurb("HasCollected", "has collected commentary for you");
      }

      function wanted_you_to_know(fromName) {
        // Blurbs: ["WantedYouToKnow"].Replace("{from.Name}", from.Name)
        const raw = blurb("WantedYouToKnow", "{from.Name} wanted you to know:");
        return raw.replace("{from.Name}", String(fromName ?? ""));
      }

      // ---- Lookup equivalent ----
      // Approximate: last useful response from `commentor` that is "about" `targetActor`.
      // In many of your flows, commentary utterances are sent TO the commentor, FROM the actor being commented on.
      // Here we scan newest -> oldest and:
      //  1) prefer utterances addressed to commentor
      //  2) prefer ones whose `from` matches targetActor (best signal)
      //  3) otherwise fall back to any last response to commentor that mentions targetActor's name
      function get_last_commentary_about(targetActor, commentor) {
        const targetName = actor_name(targetActor);
        const commentorName = actor_name(commentor);
        const rounds = (ctx.conversation?.rounds ?? []);

        let fallbackMention = "";

        for (let ri = rounds.length - 1; ri >= 0; ri--) {
          const rr = rounds[ri];
          const utterances = rr?.utterances ?? [];
          for (let ui = utterances.length - 1; ui >= 0; ui--) {
            const u = utterances[ui];

            const toName = actor_name(u?.to);
            if (toName !== commentorName) continue;

            const responses = u?.responses ?? [];
            for (let pi = responses.length - 1; pi >= 0; pi--) {
              const r = responses[pi];
              const txt = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "").trim();
              if (!txt) continue;

              // BEST: utterance.from is the actor being commented on
              const fromName = actor_name(u?.from);
              if (fromName && fromName === targetName) return txt;

              // NEXT: response mentions target actor's name
              if (!fallbackMention && targetName && txt.toLowerCase().includes(targetName.toLowerCase())) {
                fallbackMention = txt;
              }
            }
          }
        }

        return fallbackMention || "";
      }

      // ---- Prompt builders (mirror C#) ----
      function create_pass_back_commentary_prompt(from, response) {
        // $"{WantedYouToKnow}{clean(response)}\n"
        let p = `${wanted_you_to_know(actor_name(from))}`;
        console.log(".." + p);
        p = clean_prompt(p);
        p += clean_response(response) + "\n";
        return p;
      }

      function create_pass_back_narrator_prompt(narrator, bundledResponse) {
        // $"{from.Name} {HasCollected}.\n{bundledResponse}\n"
        let p = `${actor_name(narrator)} ${has_collected()}.`;
        console.log(".." + p);
        p = clean_prompt(p);
        p += clean_response(bundledResponse) + "\n";
        return p;
      }

      const narrator = get_narrator(ctx);

      // ---- Main loop ----
      const actors = (round?.actors ?? get_actors(ctx) ?? []);

      for (const actor of actors) {
        const aName = actor_name(actor);
        console.log(preparing_to(aName));

        let allResponses = "";
        let commentators = [];
        for (const commentor of actors) {
          if (actor_name(commentor) === aName) continue;

          const response = get_last_commentary_about(actor, commentor);
          allResponses += create_pass_back_commentary_prompt(commentor, response) + "\n\n";

          commentators.push(actor_name(commentor));
        }

        const utt = create_utterance(ctx, round, {
          to: actor,
          from: narrator,
          prompt: create_pass_back_narrator_prompt(narrator, allResponses),
          context: get_last_context(lastRound, actor)
        });

        // NumberContext / expanded context:
        // Your JS runtime does not implement NumberContext; if you later add it, stamp here.

        await emit_exec_llm_call(_name, {
          from: actor_name(narrator),
          to: aName,
          stage: "pass_back",
          commentators: commentators.join(", "),
          promptPreview: String(utt.prompt ?? "").slice(0, 200),
          promptChars: String(utt.prompt ?? "").length
        });

        const p = (async () => {
          const r = await send_utterance(ctx, utt);
          const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
          await emit_exec_llm_result(_name, {
            from: r?.from?.name,
            stage: "pass_back",
            preview: rawText.slice(0, 200),
            respChars: rawText.length
          });
          return r;
        })();

        tasks.push(p);

        console.log(".." + commentators.join(", ") + "->" + aName);

        if (!parallel) {
          await Promise.all(tasks);
        }
      }

      await Promise.all(tasks);

      await emit_update(_name);
      await emit_ready(_name);

      await fn6_Gather(ctx);
    } finally {
      // Ready(this, true) behavior is satisfied by emit_ready above.
    }
    return;
  }

  async function fn10_PassToFinal(ctx) {
    /* PassToFinal - sends the original prompt (with a "final" wrapper) to all actors for a unified/final response. */
    /* Optional param: 
    "PassToFinal": {
      "Type": "PassToFinal",
      "Next": ["Decision"],
      "Properties": {},
      "Blurbs": {
        "FinalPrompt": " Considering what you know now, answer the original prompt for a unified response: "
      }
    }
    */

    var _name = "PassToFinal";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("PassToFinal: PassToFinal");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);

      // Create boundary round and clear utterances
      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      round.utterances = []; // mirrors round.Utterances.Clear()

      const parallel = !!(ctx?.exec?.parallelMode);
      const actors = (round?.actors ?? get_actors(ctx) ?? []);
      const narrator = get_narrator(ctx);

      // Blurb: FinalPrompt
      // You said you can add it inline as:
      // "FinalPrompt": "Considering what you know now, answer the original prompt for a unified response: ",
      const finalPrompt =
        (node_blurbs && node_blurbs(_name) && (node_blurbs(_name).FinalPrompt || node_blurbs(_name).finalPrompt)) ||
        "Considering what you know now, answer the original prompt for a unified response: ";

      const originalPrompt = String(get_conversation_prompt(ctx) ?? ctx?.conversation?.prompt ?? "");

      const tasks = [];

      for (const actor of actors) {
        const toName = actor?.name ?? String(actor ?? "");

        const utt = create_utterance(ctx, round, {
          to: actor,
          from: narrator,
          prompt: String(finalPrompt ?? "") + "\n\n" + originalPrompt,
          context: get_last_context(lastRound, actor)
        });

        await emit_exec_llm_call(_name, {
          from: narrator?.name,
          to: toName,
          stage: "final_pass",
          promptPreview: String(utt.prompt ?? "").slice(0, 200),
          promptChars: String(utt.prompt ?? "").length
        });

        const p = (async () => {
          const r = await send_utterance(ctx, utt);
          const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");
          await emit_exec_llm_result(_name, {
            from: r?.from?.name,
            stage: "final_pass",
            preview: rawText.slice(0, 200),
            respChars: rawText.length
          });
          return r;
        })();

        tasks.push(p);

        // Sequential mode: await inside loop like C#
        if (!parallel) {
          await Promise.all(tasks);
        }
      }

      // WaitForAll
      await Promise.all(tasks);

      await emit_update(_name);
      await emit_ready(_name);

      await fn11_Gather1(ctx);
    } finally {
      // Ready(this, true) behavior satisfied by emit_ready above.
    }
    return;
  }

  async function fn11_Gather1(ctx) {
    /* Gather - clones last round actors + utterances (INCLUDING responses) into a new round, then continues. */
    var _name = "Gather1";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("Gather: Gather1");
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

      await fn12_Bias(ctx);
    } finally {
    }
    return;
  }

  async function fn12_Bias(ctx) {
    /* Bias - checks each actor response for bias using the Reasoning actor; removes biased actors when bias is not allowed; branches yes/no based on remaining actors. */
    var _name = "Bias";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("Bias: Bias");
      await emit_update(_name);

      await new Promise(r => setTimeout(r, 100));

      const lastRound = get_last_round(ctx);
      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      // --- hardcoded blurbs (no lookup) ---
      const BLURB_TRUE    = "Acceptable response from Actor";
      const BLURB_FALSE   = "Bias detected, ejecting Actor";
      const BLURB_WARNING = "Bias detected, allowing for Actor";
      const DIALOG_CHECK  = "Please check the following for potential biased language. If biased language is detected, return 'Yes.' Otherwise, return 'No'.";
      const DIALOG_TEST   = ""; // if non-empty, used instead of response text

      // Settings.Library.Models.Conversation.Bias.AllowBias
      // C# reads from settings; in JS we support either ctx.settings.getBool, or node_props override.
      // Default false (do not allow bias) matches C#.
      const allowBias =
        !!(ctx?.Conversation?.LOKIPAI?.Settings?.GetBool?.(
          "Settings.Library.Models.Conversation.Bias.AllowBias",
          false
        )) ||
        String((node_props(_name)?.AllowBias ?? node_props(_name)?.allowBias ?? "False")).toLowerCase() === "true";

      // If bias is allowed, skip checks and pass.
      if (allowBias) {
        await emit_exec_decision(_name, { ok: true, allowBias: true, note: "bias allowed; skipped checks" });
        await emit_update(_name);
        await emit_ready(_name);
        await fn13_PassToReasoning(ctx);
        return;
      }

      // Bias not allowed: we must check each response and eject actors that trigger bias.
      const reasoningActor = ctx.reasoning;
      if (!reasoningActor) {
        // If no reasoning actor, safest behavior mirrors "can't verify" => fail closed? (C# would just return false from CheckForBias, so it would NOT eject.)
        // We'll mimic C#: treat as "no bias detected" (cannot confirm).
        await emit_exec_decision(_name, { ok: true, allowBias: false, warning: "missing reasoning actor; skipping checks" });
        await emit_update(_name);
        await emit_ready(_name);
        await fn13_PassToReasoning(ctx);
        return;
      }

      function clean(s) { return String(s ?? "").trim(); }

      function createBiasPrompt(responseText) {
        // Mirrors CreateBiasPrompt():
        // prompt = BiasDialogueCheck + (BiasDialogueTest ? BiasDialogueTest : responseText)
        const test = clean(DIALOG_TEST);
        const payload = test ? test : clean(responseText);
        return `${DIALOG_CHECK}\n\n${payload} `;
      }

      // Work over a snapshot like C# currentUtterances.AddRange(round.Utterances)
      const currentUtterances = (round?.utterances ?? []).slice();

      // Track actor count like C#
      let actorCount = (round?.actors?.length ?? 0);

      // We'll run checks sequentially to keep logs deterministic and avoid racing remove_actor.
      // (C# uses Task.Run per response but ultimately uses shared ActorCount; deterministic is better here.)
      for (const u of currentUtterances) {
        const responses = (u?.responses ?? []);
        for (const r0 of responses) {
          const fromActor = r0?.from ?? r0?.From;
          const responseText = String(r0?.apiResponse?.response ?? r0?.apiResponse?.Response ?? r0?.text ?? "");

          // Ask reasoning to check for bias with no context
          const prompt = createBiasPrompt(responseText);

          const chkUtt = create_utterance(ctx, round, {
            to: reasoningActor,
            from: get_narrator(ctx),
            prompt,
            context: "" // "no context" intent
          });

          await emit_exec_llm_call(_name, { to: reasoningActor?.name, stage: "bias_check", actor: fromActor?.name });

          const chkResp = await send_utterance(ctx, chkUtt);
          const chkText = clean(chkResp?.apiResponse?.response ?? chkResp?.apiResponse?.Response ?? chkResp?.text ?? "");

          await emit_exec_llm_result(_name, {
            from: chkResp?.from?.name,
            stage: "bias_check",
            actor: fromActor?.name,
            preview: chkText,
            respChars: chkText.length
          });

          const biasDetected = chkText.toLowerCase().includes("yes");

          if (!biasDetected) {
            // acceptable
            await emit_exec_decision(_name, { actor: fromActor?.name, ok: true, msg: BLURB_TRUE });
          } else {
            // bias detected and bias is not allowed => eject actor
            actorCount = Math.max(0, actorCount - 1);
            remove_actor(ctx, fromActor);
            await emit_exec_decision(_name, { actor: fromActor?.name, ok: false, msg: BLURB_FALSE });
          }
        }
      }

      const ok = actorCount > 0;
      await emit_exec_decision(_name, { ok, remainingActors: (ctx?.actors ?? []).map(a => a?.name ?? String(a)) });
      await emit_update(_name);
      await emit_ready(_name);

      if (ok) {
        await fn13_PassToReasoning(ctx);
      } else {
        await fn16_Eject_Bias(ctx);
      }
    } finally {
    }
    return;
  }

  async function fn13_PassToReasoning(ctx) {
    /* PassToReasoning - gathers last responses from all actors and passes them to the Reasoning actor. */
    var _name = "PassToReasoning";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("PassToReasoning: PassToReasoning");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);

      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      // mirrors round.Utterances.Clear()
      round.utterances = [];

      // ---- node-local state (isFirstPass) ----
      ctx.nodeState ||= {};
      ctx.nodeState[_name] ||= {};
      if (typeof ctx.nodeState[_name].isFirstPass !== "boolean") ctx.nodeState[_name].isFirstPass = true;
      const isFirstPass = !!ctx.nodeState[_name].isFirstPass;

      // ---- HARD-CODED "Blurbs" (no UI props) ----
      const INTRO = "Passing To Reasoning...";
      const REASONING_RESPONSE = " reasoning.. ";
      const SAID = " said:";
      const REASONING_DIALOGUE_COMMENTARY = " ";
      const REASONING_DIALOGUE_RESPONSE_SIZE = " ";
      const REASONING_DIALOGUE_RESPONSE_SIZE_FIRST = " ";
      const REASONING_DIALOGUE_SYNTHESIZE = "Familiarize yourself with each page of the content for summary. ";
      const REASONING_DIALOGUE_INCLUDE = "Remember any necessary details and appropriate levels of dissent offered in the discussion. ";
      const REASONING_DIALOGUE_DISPLAY = "Wait for a question about the content to summarize. ";
      const REASONING_DIALOGUE_BELOW = "Content follows below: ";

      const DEFAULT_PROMPT_PREFIX = "Prompt"; // C# uses Blurbs.Conversation["Default"]["Prompt"]

      // ---- helpers ----
      function clean(s) { return String(s ?? "").trim(); }

      function prompt_line_or_blank(s) {
        const t = clean(s);
        if (!t) return "";
        return t + "\n";
      }

      function get_reasoning_prompt() {
        // responseSize logic
        let responseSize = clean(REASONING_DIALOGUE_RESPONSE_SIZE) || "appropriate length";
        if (isFirstPass) responseSize = clean(REASONING_DIALOGUE_RESPONSE_SIZE_FIRST) || "one paragraph";

        // Synthesize may reference {responseSize} in other versions; keep replacement safe.
        const synth = String(REASONING_DIALOGUE_SYNTHESIZE ?? "").replace("{responseSize}", responseSize);

        const lines =
          prompt_line_or_blank(REASONING_DIALOGUE_COMMENTARY) +
          prompt_line_or_blank(synth) +
          prompt_line_or_blank(REASONING_DIALOGUE_INCLUDE) +
          prompt_line_or_blank(REASONING_DIALOGUE_DISPLAY) +
          prompt_line_or_blank(REASONING_DIALOGUE_BELOW);

        return clean(lines);
      }

      // Find last useful utterance response for a given actor name (simple and effective for your data model)
      function last_useful_response_for_actor(actorName) {
        const rounds = (ctx.conversation?.rounds ?? []);
        for (let ri = rounds.length - 1; ri >= 0; ri--) {
          const rr = rounds[ri];
          const utterances = rr?.utterances ?? [];
          for (let ui = utterances.length - 1; ui >= 0; ui--) {
            const u = utterances[ui];
            const toName = u?.to?.name ?? String(u?.to ?? "");
            if (toName !== actorName) continue;

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

      // ---- build header + bundle ----
      const actors = (round?.actors ?? get_actors(ctx) ?? []);
      const reasoningActor = ctx.reasoning;

      if (!reasoningActor) {
        // Mirror "can't send to reasoning" -> treat as failure branch? In C# it would throw later; here we fail closed.
        await emit_exec_decision(_name, { ok: false, reason: "missing_reasoning_actor" });
        await emit_update(_name);
        await emit_ready(_name);
        return ctx;
        return;
      }

      // Header like C#
      let strHeader = `${actors.length} actors are going to submit repsonses for you to consider. Look for entries by `;
      let delim = "";
      for (const a of actors) {
        strHeader += delim + (a?.name ?? String(a ?? ""));
        delim = ", ";
      }
      strHeader += ".\n";

      // Body like C#
      const reasoningPrompt = get_reasoning_prompt();
      const convoPrompt = String(get_conversation_prompt(ctx) ?? ctx?.conversation?.prompt ?? "");

      let strResponses =
        `> ${reasoningPrompt}\n\n` +
        `${DEFAULT_PROMPT_PREFIX} ${convoPrompt}\n\n`;

      // Log-ish equivalent (optional)
      console.log(".." + (reasoningActor?.name ?? "Reasoning") + " " + clean(strResponses).slice(0, 100) + "..");

      for (const a of actors) {
        const actorName = (a?.name ?? String(a ?? ""));
        const actorNameDetail = a?.nameDetail ?? actorName; // support NameDetail when present
        const resp = last_useful_response_for_actor(actorName);

        strResponses += `# ${actorNameDetail}${SAID}\n${resp}\n\n`;

        console.log(".." + actorNameDetail + "->" + clean(resp).slice(0, 100) + "..");
      }

      console.log(".." + (reasoningActor?.name ?? "Reasoning") + REASONING_RESPONSE);

      // Create single utterance to reasoning
      const utt = create_utterance(ctx, round, {
        to: reasoningActor,
        from: get_narrator(ctx),
        prompt: `${strHeader} ${strResponses}`,
        context: "" // C# does not set Context here; ok to leave blank
      });

      await emit_exec_llm_call(_name, {
        to: reasoningActor?.name,
        stage: "pass_to_reasoning",
        intro: INTRO,
        promptPreview: String(utt.prompt ?? "").slice(0, 200),
        promptChars: String(utt.prompt ?? "").length
      });

      const r = await send_utterance(ctx, utt);
      const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");

      await emit_exec_llm_result(_name, {
        from: r?.from?.name,
        stage: "pass_to_reasoning",
        preview: rawText.slice(0, 200),
        respChars: rawText.length
      });

      await emit_update(_name);
      await emit_ready(_name);

      await fn14_UnifiedResponse(ctx);
    } finally {
      // C# finally: isFirstPass=false
      ctx.nodeState ||= {};
      ctx.nodeState["PassToReasoning"] ||= {};
      ctx.nodeState["PassToReasoning"].isFirstPass = false;
    }
    return;
  }

  async function fn14_UnifiedResponse(ctx) {
    /* UnifiedResponse - asks Reasoning to synthesize a unified response to the original prompt. */
    var _name = "UnifiedResponse";
    await emit_process(_name);
    try {
      set_active_node(ctx, _name);
      console.log("UnifiedResponse: UnifiedResponse");
      await emit_update(_name);

      const lastRound = get_last_round(ctx);

      // Create round and clear utterances
      const round = lastRound
        ? create_round_from_last(ctx, _name, lastRound)
        : create_round(ctx, _name, null);

      round.utterances = []; // mirrors round.Utterances.Clear()

      // ---- node-local state (isFirstPass) ----
      ctx.nodeState ||= {};
      ctx.nodeState[_name] ||= {};
      if (typeof ctx.nodeState[_name].isFirstPass !== "boolean") ctx.nodeState[_name].isFirstPass = true;
      const isFirstPass = !!ctx.nodeState[_name].isFirstPass;

      // ---- HARD-CODED BLURBS (no UI properties) ----
      const INTRO = "Creating Unified Response...";
      const UNIFIED_CREATED = "Unified Response created.";

      const UNIFIED_COMMENTARY = " ";
      const UNIFIED_RESPONSE_SIZE = "appropriate length";
      const UNIFIED_RESPONSE_SIZE_FIRST = "one paragraph";

      const UNIFIED_SYNTHESIZE =
        "Using only the discussion provided by the Actors, synthesize a concise unified response of {responseSize} in the strongest style demonstrated (clear, direct, and actionable). Prefer the style that is (1) immediately helpful, (2) minimizes risk, and (3) uses plain language. Adopt a decisive, humane tone; prefer safety and immediacy over analysis paralysis. ";

      const UNIFIED_INCLUDE =
        "Include only essential details and any dissent that materially changes the recommendation. Do not invent facts. If dissent materially changes risk or outcome, add one final sentence starting with 'Caveat:' summarizing it. ";

      const UNIFIED_DISPLAY =
        "Do not elaborate about the construction of the unified response. ";

      const UNIFIED_BELOW =
        "Here is the original prompt to answer: ";

      const DEFAULT_PROMPT_PREFIX = "Prompt"; // C# uses Blurbs.Conversation["Default"]["Prompt"]

      // ---- helpers ----
      function clean(s) { return String(s ?? "").trim(); }

      function prompt_line_or_blank(s) {
        const t = clean(s);
        if (!t) return "";
        return t + "\n";
      }

      function get_unified_prompt() {
        let responseSize = clean(UNIFIED_RESPONSE_SIZE) || "appropriate length";
        if (isFirstPass) responseSize = clean(UNIFIED_RESPONSE_SIZE_FIRST) || "one paragraph";

        const synth = String(UNIFIED_SYNTHESIZE ?? "").replace("{responseSize}", responseSize);

        const lines =
          prompt_line_or_blank(UNIFIED_COMMENTARY) +
          prompt_line_or_blank(synth) +
          prompt_line_or_blank(UNIFIED_INCLUDE) +
          prompt_line_or_blank(UNIFIED_DISPLAY) +
          prompt_line_or_blank(UNIFIED_BELOW);

        return clean(lines);
      }

      // ---- actor wiring ----
      const reasoningActor = ctx.reasoning;
      if (!reasoningActor) {
        await emit_exec_decision(_name, { ok: false, reason: "missing_reasoning_actor" });
        await emit_update(_name);
        await emit_ready(_name);
        return ctx;
        return;
      }

      const convoPrompt = String(get_conversation_prompt(ctx) ?? ctx?.conversation?.prompt ?? "");
      const unifiedPrompt = get_unified_prompt();

      const fullPrompt =
        `> ${unifiedPrompt}\n\n` +
        `${DEFAULT_PROMPT_PREFIX} ${convoPrompt}\n\n`;

      // Create utterance to Reasoning
      const utt = create_utterance(ctx, round, {
        to: reasoningActor,
        from: get_narrator(ctx),
        prompt: fullPrompt,
        context: get_last_context(lastRound, reasoningActor)
      });

      await emit_exec_llm_call(_name, {
        to: reasoningActor?.name,
        stage: "unified_response",
        intro: INTRO,
        promptPreview: String(fullPrompt).slice(0, 200),
        promptChars: String(fullPrompt).length
      });

      const r = await send_utterance(ctx, utt);
      const rawText = String(r?.apiResponse?.response ?? r?.apiResponse?.Response ?? r?.text ?? "");

      await emit_exec_llm_result(_name, {
        from: r?.from?.name,
        stage: "unified_response",
        preview: rawText.slice(0, 200),
        respChars: rawText.length
      });

      // C# logs "Unified Response created."
      console.log(UNIFIED_CREATED);

      await emit_update(_name, { created: true, msg: UNIFIED_CREATED });
      await emit_ready(_name);

      await fn15_Deliver(ctx);
    } finally {
      // Mirror C# finally:
      // isFirstPass = false;
      // Conversation.Silent = false;
      ctx.nodeState ||= {};
      ctx.nodeState["UnifiedResponse"] ||= {};
      ctx.nodeState["UnifiedResponse"].isFirstPass = false;

      ctx.conversation ||= {};
      ctx.conversation.silent = false;
    }
    return;
  }

  async function fn15_Deliver(ctx) {
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

      await fn4_CollectInput(ctx);
    } finally {
    }
    return;
  }

  async function fn16_Eject_Bias(ctx) {
    /* Eject - Terminal for LLM taken out of regular flow. */
    var _name = "Eject-Bias";
    console.log("Eject: Eject-Bias");
    await emit_process(_name);
    await emit_update(_name);
    await emit_ready(_name);
    return ctx;
  }

  async function fn17_Eject_Agree(ctx) {
    /* Eject - Terminal for LLM taken out of regular flow. */
    var _name = "Eject-Agree";
    console.log("Eject: Eject-Agree");
    await emit_process(_name);
    await emit_update(_name);
    await emit_ready(_name);
    return ctx;
  }

  return { info, getInformation, execute, continue: cont };
}
