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

    export function normalizeProviderType(value: unknown): ProviderId {
    const s = String(value ?? "").trim().toLowerCase();

    if (s === "openai" || s === "openaichat") return "openai";
    if (s === "google" || s === "gemini" || s === "geminichat") return "google";
    if (s === "anthropic" || s === "claude" || s === "claudechat") return "anthropic";
    if (s === "xai" || s === "xaichat" || s === "grok") return "xai";
    if (s === "cohere" || s === "coherechat") return "cohere";

    throw new Error(`Unable to normalize provider type: ${String(value)}`);
    }

    export function resolveProviderForActor(
    actor: {
        provider?: string;
        Provider?: string;
        model?: string;
        Model?: string;
    },
    runtime?: {
        Providers?: Array<{
        Name?: string;
        name?: string;
        Type?: string;
        type?: string;
        }>;
    },
    ): ProviderId {
    const providerRef = String(actor.provider ?? actor.Provider ?? "").trim();
    const model = String(actor.model ?? actor.Model ?? "").trim();

    const providers = Array.isArray(runtime?.Providers)
        ? runtime.Providers
        : [];

    if (providerRef) {
        const namedProvider = providers.find((p) => {
        const name = String(p.Name ?? p.name ?? "").trim();
        return name.toLowerCase() === providerRef.toLowerCase();
        });

        if (namedProvider) {
        return normalizeProviderType(namedProvider.Type ?? namedProvider.type);
        }

        try {
        return normalizeProviderType(providerRef);
        } catch {
        // Fall through to model inference.
        }
    }

    if (model) {
        return getProviderFromModel(model);
    }

    throw new Error(
        `Unable to resolve provider for actor: ${JSON.stringify(actor)}`,
    );
    }