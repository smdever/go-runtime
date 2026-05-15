    // src/connectors/ollama.ts
    import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";

    export class OllamaConnector implements LLMConnector {
    readonly provider = "ollama" as const;

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

        const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            stream: false,
            options: {
            temperature: request.temperature ?? 0.7,
            },
        }),
        });

        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama chat failed (${response.status}): ${errorText}`);
        }

        const json = await response.json();
        const content = json?.message?.content ?? "";

        return {
        content,
        response: content,
        raw: json,
        statusCode: response.status,
        usage: {
            prompt_tokens: json?.prompt_eval_count ?? 0,
            completion_tokens: json?.eval_count ?? 0,
        },
        };
    }
    }