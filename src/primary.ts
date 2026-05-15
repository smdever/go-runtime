    import "dotenv/config";
    import { buildApp } from "./app.js";
    import { readConfig } from "./shared/config.js";

    // import { getProviderFromModel } from "./shared/provider-resolver.js";
    // import { getApiKeyForProvider } from "./shared/credentials.js";

    // const provider = getProviderFromModel("gpt-4o-mini");
    // const key = getApiKeyForProvider(provider);

    // console.log("provider:", provider);
    // console.log("key loaded:", Boolean(key));
    // console.log("key prefix:", key.slice(0, 7));

    // import { getProviderFromModel } from "./shared/provider-resolver.js";
    // import { getConnector } from "./connectors/index.js";

    // async function smokeTest() {
    // const model = "gpt-4o-mini";
    // const provider = getProviderFromModel(model);
    // const connector = getConnector(provider);

    // const result = await connector.chat({
    //     model,
    //     messages: [
    //     { role: "user", content: "Reply with exactly: provider path alive" },
    //     ],
    //     temperature: 0,
    // });

    // console.log("chat result:", result.content);
    // }

    // smokeTest().catch(console.error);

    const config = readConfig();
    const app = await buildApp();
    await app.listen({ port: config.port, host: config.host });
