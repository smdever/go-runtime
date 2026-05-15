// src\shared\provider-resolver.ts
    import type { ProviderId } from "./credentials.js";

    export function getProviderFromModel(model: string): ProviderId {
    const m = model.toLowerCase();

    if (
        m.startsWith("gpt-") ||
        m.startsWith("o1") ||
        m.startsWith("o3") ||
        m.startsWith("o4")
    ) {
        return "openai";
    }

    if (m.startsWith("gemini-") || m.startsWith("gemma-")) {
        return "google";
    }

    if (m.startsWith("claude-")) {
        return "anthropic";
    }

    if (m.startsWith("grok-")) {
        return "xai";
    }

    if (m.startsWith("command-")) {
        return "cohere";
    }

    throw new Error(`Unable to resolve provider from model: ${model}`);
    }