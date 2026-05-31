    import "dotenv/config";
    import { buildApp } from "./app.js";
    import { readConfig } from "./shared/config.js";
    const config = readConfig();
    const app = await buildApp();
    await app.listen({ port: config.port, host: config.host });
