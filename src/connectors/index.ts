// src/connectors/index.ts
import type { LLMConnector, ProviderId } from "./types.js";
import { OpenAIConnector } from "./openai.js";
import { AnthropicConnector } from "./anthropic.js";
import { GoogleConnector } from "./google.js";
import { XaiConnector } from "./xai.js";
import { CohereConnector } from "./cohere.js";
import { OllamaConnector } from "./ollama.js";

const registry = new Map<ProviderId, LLMConnector>();

registry.set("openai", new OpenAIConnector());
registry.set("anthropic", new AnthropicConnector());
registry.set("google", new GoogleConnector());
registry.set("xai", new XaiConnector());
registry.set("cohere", new CohereConnector());
registry.set("ollama", new OllamaConnector());

export function getConnector(provider: ProviderId): LLMConnector {
  const connector = registry.get(provider);
  if (!connector) {
    throw new Error(`No connector registered for provider: ${provider}`);
  }
  return connector;
}
