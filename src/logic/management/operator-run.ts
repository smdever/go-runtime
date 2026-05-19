// src/logic/management/operator-run.ts
    import type {
    CreateRunRequest,
    OperatorRunArtifact,
    OperatorRunRequest,
    OperatorRunResult,
    } from "../../contracts/operator.js";
    import type { EngineId } from "../../contracts/engine.js";
    import type { IOrchestratorLike } from "./orchestrator.js";

    export interface OperatorRunDeps {
    createOrchestrator(request: CreateRunRequest): Promise<IOrchestratorLike>;
    }

    interface NormalizedOperatorRunRequest {
    runId?: string;
    engine: EngineId;
    artifactName?: string;
    artifactKind?: string;
    artifactEncoding?: string;
    executable?: string;
    runtimeOverride?: unknown;
    prompt?: string;
    passphrase?: string;
    metadata: Record<string, unknown>;
    saveDebugPackage: boolean;
    }

    function decodeBase64Utf8(value?: string): string | undefined {
    if (!value || !value.trim()) return undefined;
    return Buffer.from(value, "base64").toString("utf8");
    }

    function firstNonBlank(...values: Array<string | undefined | null>): string | undefined {
    for (const value of values) {
        if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
        }
    }

    return undefined;
    }

    function resolveArtifactText(artifact?: OperatorRunArtifact): string | undefined {
    if (!artifact) return undefined;

    const encoding = String(artifact.encoding ?? "").trim().toLowerCase();

    if (encoding === "base64") {
        return firstNonBlank(
        decodeBase64Utf8(artifact.content),
        decodeBase64Utf8(artifact.text),
        decodeBase64Utf8(artifact.executable),
        decodeBase64Utf8(artifact.contentBase64),
        decodeBase64Utf8(artifact.base64),
        );
    }

    return firstNonBlank(
        artifact.executable,
        artifact.content,
        artifact.text,
        decodeBase64Utf8(artifact.contentBase64),
        decodeBase64Utf8(artifact.base64),
    );
    }

    function normalizeOperatorRunRequest(request: OperatorRunRequest): NormalizedOperatorRunRequest {
    const artifact = request.artifact;

    const executable = firstNonBlank(
        request.executable,
        resolveArtifactText(artifact),
    );

    const artifactName = firstNonBlank(
        request.name,
        artifact?.name,
        artifact?.artifactName,
    );

    return {
        runId: request.runId,
        engine: request.engine ?? "executable",
        artifactName,
        artifactKind: artifact?.kind,
        artifactEncoding: artifact?.encoding,
        executable,
        runtimeOverride: request.runtimeOverride ?? request.runtime,
        prompt: request.prompt,
        passphrase: request.passphrase,
        metadata: request.metadata ?? {},
        saveDebugPackage: request.saveDebugPackage === true,
    };
    }

    export async function operatorRun(
    request: OperatorRunRequest,
    deps: OperatorRunDeps,
    ): Promise<OperatorRunResult> {
    const normalized = normalizeOperatorRunRequest(request);

    if (!normalized.executable) {
        return {
        ok: false,
        reason: "missing_executable",
        error: "Run requires executable .lfx/.bfx JavaScript text.",
        diagnostic: {
            hasExecutable: Boolean(request.executable),
            hasArtifact: Boolean(request.artifact),
            artifactKeys: request.artifact ? Object.keys(request.artifact) : [],
            artifactEncoding: request.artifact?.encoding ?? null,
            hasArtifactContent: Boolean(request.artifact?.content),
            hasArtifactContentBase64: Boolean(request.artifact?.contentBase64),
            hasArtifactBase64: Boolean(request.artifact?.base64),
        },
        };
    }

    const createRequest: CreateRunRequest = {
        runId: normalized.runId,
        engine: normalized.engine,
        executable: {
            inlineContent: normalized.executable,
            metadata: {
            ...(normalized.metadata ?? {}),

            name: normalized.artifactName,
            artifactKind: normalized.artifactKind,
            artifactEncoding: normalized.artifactEncoding,
            passphrase: normalized.passphrase,
            saveDebugPackage: normalized.saveDebugPackage,
            source: "operator.run",
            submittedAt: new Date().toISOString(),

            // Important: this must come AFTER normalized.metadata.
            // Desktop metadata has runtimeOverride: true, but this needs to be the real runtime object.
            runtimeOverride: normalized.runtimeOverride,
            },
        },
        initialPrompt: normalized.prompt,
        metadata: {
            ...(normalized.metadata ?? {}),

            name: normalized.artifactName,
            artifactKind: normalized.artifactKind,
            artifactEncoding: normalized.artifactEncoding,

            // Avoid colliding with the actual runtimeOverride object above.
            hasRuntimeOverride: Boolean(normalized.runtimeOverride),

            saveDebugPackage: normalized.saveDebugPackage,
            source: "operator.run",
        },
        };

    // const createRequest: CreateRunRequest = {
    //     runId: normalized.runId,
    //     engine: normalized.engine,
    //     executable: {
    //     inlineContent: normalized.executable,
    //     metadata: {
    //         name: normalized.artifactName,
    //         artifactKind: normalized.artifactKind,
    //         artifactEncoding: normalized.artifactEncoding,
    //         passphrase: normalized.passphrase,
    //         runtimeOverride: normalized.runtimeOverride,
    //         saveDebugPackage: normalized.saveDebugPackage,
    //         source: "operator.run",
    //         submittedAt: new Date().toISOString(),
    //         ...(normalized.metadata ?? {}),
    //     },
    //     },
    //     initialPrompt: normalized.prompt,
    //     metadata: {
    //     name: normalized.artifactName,
    //     artifactKind: normalized.artifactKind,
    //     artifactEncoding: normalized.artifactEncoding,
    //     runtimeOverride: Boolean(normalized.runtimeOverride),
    //     saveDebugPackage: normalized.saveDebugPackage,
    //     source: "operator.run",
    //     ...(normalized.metadata ?? {}),
    //     },
    // };

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
