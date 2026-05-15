// src/connectors/anthropic.ts

import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";
import { getApiKeyForProvider } from "../shared/credentials.js";

export class AnthropicConnector implements LLMConnector {
  readonly provider = "anthropic" as const;

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = getApiKeyForProvider(this.provider);

    const systemMessages = request.messages.filter((m) => m.role === "system");
    const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

    const system = systemMessages.map((m) => m.content).join("\n\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        system: system || undefined,
        messages: nonSystemMessages,
        max_tokens: 4096,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic chat failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    const content = json?.content?.[0]?.text ?? "";

    return {
      content,
      response: content,
      usage: {
        prompt_tokens: json?.usage?.input_tokens ?? 0,
        completion_tokens: json?.usage?.output_tokens ?? 0,
      },
      raw: json,
      statusCode: response.status,
    };
  }
}


// import type { ChatRequest, ChatResponse, LLMConnector } from "./types.js";

// export class AnthropicConnector implements LLMConnector {
//   readonly provider = "anthropic" as const;
//   async chat(_request: ChatRequest): Promise<ChatResponse> {
//     throw new Error("anthropic connector not implemented yet.");
//   }
// }
