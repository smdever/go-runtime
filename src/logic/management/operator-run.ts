// src/logic/management/operator-run.ts

    import type {
    CreateRunRequest,
    OperatorRunRequest,
    OperatorRunResult,
    } from "../../contracts/operator.js";
    import type { IOrchestratorLike } from "./orchestrator.js";

    export interface OperatorRunDeps {
    createOrchestrator(request: CreateRunRequest): Promise<IOrchestratorLike>;
    }

    export async function operatorRun(
    request: OperatorRunRequest,
    deps: OperatorRunDeps,
    ): Promise<OperatorRunResult> {
    const executable = request.executable?.trim();

    if (!executable) {
        return {
        ok: false,
        reason: "missing_executable",
        error: "Run requires executable .lfx/.bfx JavaScript text.",
        };
    }

    const createRequest: CreateRunRequest = {
        runId: request.runId,
        engine: "executable",
        executable: {
        inlineContent: executable,
        metadata: {
            name: request.name,
            passphrase: request.passphrase,
            source: "operator.run",
            submittedAt: new Date().toISOString(),
            ...(request.metadata ?? {}),
        },
        },
        initialPrompt: request.prompt,
        metadata: {
        name: request.name,
        source: "operator.run",
        ...(request.metadata ?? {}),
        },
    };

    const orchestrator = await deps.createOrchestrator(createRequest);
    const runId = orchestrator.getRunId();

    setImmediate(() => {
    void orchestrator.start().catch((error) => {
        console.error("operatorRun start failed", {
        runId,
        error,
        });
    });
    });

    return {
    ok: true,
    runId,
    snapshot: null,
    };
    }