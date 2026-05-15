// src\connectors\types.ts
export type ProviderId =
  | "openai"
  | "google"
  | "anthropic"
  | "xai"
  | "cohere"
  | "ollama";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
};

export type ChatResponse = {
  content: string;
  response?: string;
  usage?: unknown;
  raw?: unknown;
  statusCode?: number;
};

export interface LLMConnector {
  readonly provider: ProviderId;
  chat(request: ChatRequest): Promise<ChatResponse>;
}

