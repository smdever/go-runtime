// src\shared\credentials.ts
    export type ProviderId =
    | "openai"
    | "google"
    | "anthropic"
    | "xai"
    | "cohere";

    function requireEnv(name: string): string {
        const value = process.env[name];
        if (!value || !value.trim()) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
        return value;
    }

    export function getApiKeyForProvider(provider: ProviderId): string {
        switch (provider) {
            case "openai":
            return requireEnv("OPENAI_API_KEY");
            case "google":
            return requireEnv("GOOGLE_API_KEY");
            case "anthropic":
            return requireEnv("ANTHROPIC_API_KEY");
            case "xai":
            return requireEnv("XAI_API_KEY");
            case "cohere":
            return requireEnv("COHERE_API_KEY");
            default: {
            const exhaustive: never = provider;
            throw new Error(`Unsupported provider: ${exhaustive}`);
            }
        }
    }
