// src/tools/mcp/mcp-streamable-client.ts
// Minimal MCP Streamable HTTP client for go-runtime.
// Mirrors the Desktop McpStreamableClient lifecycle:
// initialize -> notifications/initialized -> tools/list or tools/call -> DELETE close.

    export type JsonPrimitive = string | number | boolean | null;
    export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
    export type JsonObject = { [key: string]: JsonValue | undefined };

    export interface McpToolDescriptor {
    name: string;
    description: string;
    inputSchema: JsonObject;
    inputSchemaJson: string;
    }

    export interface McpToolResult {
    toolName: string;
    isError: boolean;
    textContent: string[];
    text: string;
    rawResponse: JsonObject;
    }

    export interface McpClientInfo {
    name: string;
    version: string;
    }

    export interface McpStreamableClientOptions {
    protocolVersion?: string;
    clientInfo?: McpClientInfo;
    fetchImpl?: typeof fetch;
    headers?: Record<string, string>;
    }

    interface JsonRpcResponse extends JsonObject {
    jsonrpc?: string;
    id?: JsonPrimitive;
    result?: JsonObject;
    error?: JsonObject;
    }

    export class McpStreamableClient {
    static readonly defaultProtocolVersion = "2025-03-26";

    readonly endpoint: URL;
    readonly clientInfo: McpClientInfo;
    readonly headers: Record<string, string>;

    private readonly fetchImpl: typeof fetch;
    private nextRequestId = 0;
    private closed = false;

    sessionId: string | null = null;
    protocolVersion: string;
    isInitialized = false;

    constructor(endpoint: string | URL, options: McpStreamableClientOptions = {}) {
        const rawEndpoint = String(endpoint ?? "").trim();
        if (!rawEndpoint) {
        throw new Error("MCP endpoint is required.");
        }

        this.endpoint = new URL(rawEndpoint);
        this.protocolVersion =
        options.protocolVersion?.trim() || McpStreamableClient.defaultProtocolVersion;
        this.clientInfo = options.clientInfo ?? {
        name: "go-runtime",
        version: "1.0.0",
        };
        this.fetchImpl = options.fetchImpl ?? fetch;
        this.headers = { ...(options.headers ?? {}) };
    }

    async initialize(signal?: AbortSignal): Promise<void> {
        this.throwIfClosed();
        if (this.isInitialized) return;

        const requestId = this.getNextRequestId();
        const response = await this.sendRequest(
        {
            jsonrpc: "2.0",
            id: requestId,
            method: "initialize",
            params: {
            protocolVersion: this.protocolVersion,
            capabilities: {},
            clientInfo: {
                name: this.clientInfo.name,
                version: this.clientInfo.version,
            },
            },
        },
        requestId,
        false,
        signal,
        );

        this.throwIfJsonRpcError(response);

        const result = this.requireObject(
        response.result,
        "MCP initialize response did not include a result object.",
        );
        const negotiatedProtocolVersion = this.readString(result.protocolVersion);

        if (!negotiatedProtocolVersion) {
        throw new Error("MCP initialize response did not include a protocol version.");
        }

        if (negotiatedProtocolVersion !== this.protocolVersion) {
        throw new Error(
            `MCP server negotiated unsupported protocol version '${negotiatedProtocolVersion}'. ` +
            `Client requested '${this.protocolVersion}'.`,
        );
        }

        this.protocolVersion = negotiatedProtocolVersion;

        await this.sendNotification("notifications/initialized", {}, signal);
        this.isInitialized = true;
    }

    async listTools(signal?: AbortSignal): Promise<McpToolDescriptor[]> {
        this.throwIfClosed();
        if (!this.isInitialized) await this.initialize(signal);

        const requestId = this.getNextRequestId();
        const response = await this.sendRequest(
        {
            jsonrpc: "2.0",
            id: requestId,
            method: "tools/list",
            params: {},
        },
        requestId,
        true,
        signal,
        );

        this.throwIfJsonRpcError(response);

        const result = this.requireObject(
        response.result,
        "MCP tools/list response did not include a result object.",
        );
        const tools = Array.isArray(result.tools) ? result.tools : [];
        const descriptors: McpToolDescriptor[] = [];

        for (const item of tools) {
        if (!this.isObject(item)) continue;

        const name = this.readString(item.name);
        if (!name) continue;

        const inputSchema = this.isObject(item.inputSchema) ? item.inputSchema : {};

        descriptors.push({
            name,
            description: this.readString(item.description) ?? "",
            inputSchema,
            inputSchemaJson: JSON.stringify(inputSchema),
        });
        }

        return descriptors;
    }

    async callTool(
        toolName: string,
        args: JsonObject = {},
        signal?: AbortSignal,
    ): Promise<McpToolResult> {
        this.throwIfClosed();

        const normalizedToolName = String(toolName ?? "").trim();
        if (!normalizedToolName) {
        throw new Error("MCP tool name is required.");
        }

        if (!this.isInitialized) await this.initialize(signal);

        const requestId = this.getNextRequestId();
        const response = await this.sendRequest(
        {
            jsonrpc: "2.0",
            id: requestId,
            method: "tools/call",
            params: {
            name: normalizedToolName,
            arguments: args,
            },
        },
        requestId,
        true,
        signal,
        );

        this.throwIfJsonRpcError(response);

        const result = this.requireObject(
        response.result,
        "MCP tools/call response did not include a result object.",
        );
        const content = Array.isArray(result.content) ? result.content : [];
        const textContent: string[] = [];

        for (const item of content) {
        if (!this.isObject(item)) continue;
        if (this.readString(item.type)?.toLowerCase() !== "text") continue;

        const text = this.readString(item.text);
        if (text?.trim()) textContent.push(text);
        }

        return {
        toolName: normalizedToolName,
        isError: result.isError === true,
        textContent,
        text: textContent.join("\n"),
        rawResponse: response,
        };
    }

    async close(signal?: AbortSignal): Promise<void> {
        if (this.closed) return;

        if (this.sessionId) {
        const response = await this.fetchImpl(this.endpoint, {
            method: "DELETE",
            headers: this.createHeaders(true),
            signal,
        });

        if (!response.ok && response.status !== 404 && response.status !== 405) {
            const body = await response.text();
            throw new Error(
            `MCP session close failed: HTTP ${response.status} ${response.statusText}. ${body}`,
            );
        }
        }

        this.sessionId = null;
        this.isInitialized = false;
        this.closed = true;
    }

    static async listToolsOnce(
        endpoint: string | URL,
        options: McpStreamableClientOptions = {},
        signal?: AbortSignal,
    ): Promise<McpToolDescriptor[]> {
        const client = new McpStreamableClient(endpoint, options);
        try {
        await client.initialize(signal);
        return await client.listTools(signal);
        } finally {
        await client.close(signal);
        }
    }

    static async callToolOnce(
        endpoint: string | URL,
        toolName: string,
        args: JsonObject = {},
        options: McpStreamableClientOptions = {},
        signal?: AbortSignal,
    ): Promise<McpToolResult> {
        const client = new McpStreamableClient(endpoint, options);
        try {
        await client.initialize(signal);
        return await client.callTool(toolName, args, signal);
        } finally {
        await client.close(signal);
        }
    }

    private async sendRequest(
        payload: JsonObject,
        expectedRequestId: number,
        includeSessionHeaders: boolean,
        signal?: AbortSignal,
    ): Promise<JsonRpcResponse> {
        const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: this.createHeaders(includeSessionHeaders),
        body: JSON.stringify(payload),
        signal,
        });

        this.captureSessionId(response);

        if (!response.ok) {
        const body = await response.text();
        throw new Error(
            `MCP request failed: HTTP ${response.status} ${response.statusText}. ${body}`,
        );
        }

        return await this.readJsonRpcResponse(response, expectedRequestId);
    }

    private async sendNotification(
        method: string,
        params: JsonObject,
        signal?: AbortSignal,
    ): Promise<void> {
        const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: this.createHeaders(true),
        body: JSON.stringify({
            jsonrpc: "2.0",
            method,
            params,
        }),
        signal,
        });

        if (!response.ok) {
        const body = await response.text();
        throw new Error(
            `MCP notification failed: HTTP ${response.status} ${response.statusText}. ${body}`,
        );
        }
    }

    private createHeaders(includeSessionHeaders: boolean): Headers {
        const headers = new Headers(this.headers);
        headers.set("Accept", "application/json, text/event-stream");
        headers.set("Content-Type", "application/json; charset=utf-8");

        if (includeSessionHeaders) {
        if (this.sessionId) headers.set("Mcp-Session-Id", this.sessionId);
        if (this.protocolVersion) headers.set("MCP-Protocol-Version", this.protocolVersion);
        }

        return headers;
    }

    private captureSessionId(response: Response): void {
        const sessionId = response.headers.get("Mcp-Session-Id")?.trim();
        if (sessionId) this.sessionId = sessionId;
    }

    private async readJsonRpcResponse(
        response: Response,
        expectedRequestId: number,
    ): Promise<JsonRpcResponse> {
        const mediaType = response.headers
        .get("content-type")
        ?.split(";", 1)[0]
        ?.trim()
        .toLowerCase();

        if (mediaType === "text/event-stream") {
        return await this.readSseJsonRpcResponse(response, expectedRequestId);
        }

        const body = await response.text();
        if (!body.trim()) {
        throw new Error("MCP request returned an empty response body.");
        }

        const selected = this.selectResponseById(
        JSON.parse(body) as JsonValue,
        expectedRequestId,
        );
        if (!selected) {
        throw new Error("MCP response did not contain the expected JSON-RPC request id.");
        }

        return selected;
    }

    private async readSseJsonRpcResponse(
        response: Response,
        expectedRequestId: number,
    ): Promise<JsonRpcResponse> {
        if (!response.body) {
        throw new Error("MCP SSE response did not include a readable body.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let boundary = this.findSseBoundary(buffer);
            while (boundary !== null) {
            const event = buffer.slice(0, boundary.index);
            buffer = buffer.slice(boundary.index + boundary.length);

            const selected = this.tryParseSseEvent(event, expectedRequestId);
            if (selected) return selected;

            boundary = this.findSseBoundary(buffer);
            }
        }

        buffer += decoder.decode();
        const finalMatch = this.tryParseSseEvent(buffer, expectedRequestId);
        if (finalMatch) return finalMatch;
        } finally {
        await reader.cancel().catch(() => undefined);
        }

        throw new Error(
        "MCP SSE response stream ended before receiving the expected JSON-RPC response.",
        );
    }

    private findSseBoundary(value: string): { index: number; length: number } | null {
        const lf = value.indexOf("\n\n");
        const crlf = value.indexOf("\r\n\r\n");

        if (lf < 0 && crlf < 0) return null;
        if (lf < 0) return { index: crlf, length: 4 };
        if (crlf < 0) return { index: lf, length: 2 };
        return lf < crlf ? { index: lf, length: 2 } : { index: crlf, length: 4 };
    }

    private tryParseSseEvent(
        event: string,
        expectedRequestId: number,
    ): JsonRpcResponse | null {
        const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n")
        .trim();

        if (!data) return null;

        try {
        return this.selectResponseById(
            JSON.parse(data) as JsonValue,
            expectedRequestId,
        );
        } catch {
        return null;
        }
    }

    private selectResponseById(
        value: JsonValue,
        expectedRequestId: number,
    ): JsonRpcResponse | null {
        if (Array.isArray(value)) {
        for (const item of value) {
            const selected = this.selectResponseById(item, expectedRequestId);
            if (selected) return selected;
        }
        return null;
        }

        if (!this.isObject(value)) return null;

        const id = value.id;
        if (id !== undefined && String(id) === String(expectedRequestId)) {
        return value as JsonRpcResponse;
        }

        return null;
    }

    private throwIfJsonRpcError(response: JsonRpcResponse): void {
        if (!this.isObject(response.error)) return;

        const code = typeof response.error.code === "number" ? response.error.code : null;
        const message = this.readString(response.error.message) ?? "Unknown MCP error.";

        throw new Error(
        `MCP JSON-RPC error${code === null ? "" : ` ${code}`}: ${message}`,
        );
    }

    private getNextRequestId(): number {
        this.nextRequestId += 1;
        return this.nextRequestId;
    }

    private requireObject(value: JsonValue | undefined, message: string): JsonObject {
        if (!this.isObject(value)) throw new Error(message);
        return value;
    }

    private readString(value: JsonValue | undefined): string | null {
        return typeof value === "string" ? value : null;
    }

    private isObject(value: unknown): value is JsonObject {
        return !!value && typeof value === "object" && !Array.isArray(value);
    }

    private throwIfClosed(): void {
        if (this.closed) throw new Error("MCP client is already closed.");
    }
    }


