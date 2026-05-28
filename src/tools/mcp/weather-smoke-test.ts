// src\tools\mcp\weather-smoke-test.ts
    import { McpStreamableClient } from "./mcp-streamable-client.js";

    const endpoint = "http://localhost:3001/mcp";

    async function main(): Promise<void> {
    console.log(`Connecting to MCP endpoint: ${endpoint}`);

    console.log("\nListing tools...");
    const tools = await McpStreamableClient.listToolsOnce(endpoint);

    for (const tool of tools) {
        console.log(`- ${tool.name}`);
        if (tool.description) {
        console.log(`  ${tool.description}`);
        }
        console.log(`  schema: ${tool.inputSchemaJson}`);
    }

    console.log("\nCalling weather_get_forecast...");
    const result = await McpStreamableClient.callToolOnce(
        endpoint,
        "weather_get_forecast",
        {
        city: "Kanab",
        state: "Utah",
        country: "United States",
        days: 3,
        },
    );

    console.log("\n=== Weather Result ===");
    console.log(result.text);

    if (result.isError) {
        console.error("MCP tool reported an error.");
        process.exitCode = 1;
    }
    }

    main().catch((error: unknown) => {
    console.error("\nMCP smoke test failed.");

    if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
    } else {
        console.error(error);
    }

    process.exitCode = 1;
    });
