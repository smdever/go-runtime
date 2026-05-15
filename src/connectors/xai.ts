// src\connectors\xai.ts
import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";
import { getApiKeyForProvider } from "../shared/credentials.js";

export class XaiConnector implements LLMConnector {
  readonly provider = "xai" as const;

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = getApiKeyForProvider(this.provider);

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI chat failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content ?? "";

    return {
      content,
      response: content,
      usage: json?.usage,
      raw: json,
      statusCode: response.status,
    };
  }
}

// import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";

// export class XaiConnector implements LLMConnector {
//   readonly provider = "xai" as const;
//   async chat(_request: ChatRequest): Promise<ChatResponse> {
//     throw new Error("xai connector not implemented yet.");
//   }
// }
