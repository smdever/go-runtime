// src\connectors\google.ts
import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";
import { getApiKeyForProvider } from "../shared/credentials.js";

export class GoogleConnector implements LLMConnector {
  readonly provider = "google" as const;

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = getApiKeyForProvider(this.provider);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: request.messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: request.temperature ?? 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google chat failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    const content = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return {
      content,
      response: content,
      usage: {
        prompt_tokens: json?.usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: json?.usageMetadata?.candidatesTokenCount ?? 0,
      },
      raw: json,
      statusCode: response.status,
    };
  }
}

// import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";

// export class GoogleConnector implements LLMConnector {
//   readonly provider = "google" as const;

//   async chat(_request: ChatRequest): Promise<ChatResponse> {
//     throw new Error("google connector not implemented yet.");
//   }
// }
