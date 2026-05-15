    // src/connectors/cohere.ts
    import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";
    import { getApiKeyForProvider } from "../shared/credentials.js";

    export class CohereConnector implements LLMConnector {
    readonly provider = "cohere" as const;

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const apiKey = getApiKeyForProvider(this.provider);

        const response = await fetch("https://api.cohere.com/v2/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: request.model,
            temperature: request.temperature ?? 0.7,
            messages: request.messages.map((m) => ({
            role: m.role,
            content: m.content,
            })),
        }),
        });

        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cohere chat failed (${response.status}): ${errorText}`);
        }

        const json = await response.json();

        const content =
        json?.message?.content?.[0]?.text ??
        json?.text ??
        "";

        return {
        content,
        response: content,
        usage: {
            prompt_tokens: json?.usage?.tokens?.input_tokens ?? 0,
            completion_tokens: json?.usage?.tokens?.output_tokens ?? 0,
        },
        raw: json,
        statusCode: response.status,
        };
    }
    }