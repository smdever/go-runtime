// src\app.ts

import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerOperatorRoutes } from "./routes/operator.js";
import { registerOrchestratorRoutes } from "./routes/orchestrator.js";
import { registerEventRoutes } from "./routes/events.js";
import { registerAdminRoutes } from "./routes/admin.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app);
  await registerOperatorRoutes(app);
  await registerOrchestratorRoutes(app);
  await registerEventRoutes(app);
  await registerAdminRoutes(app);
  return app;
}

// import Fastify from "fastify";
// import { registerHealthRoutes } from "./routes/health.js";
// import { registerOperatorRoutes } from "./routes/operator.js";
// import { registerOrchestratorRoutes } from "./routes/orchestrator.js";
// import { registerEventRoutes } from "./routes/events.js";
// import { registerAdminRoutes } from "./routes/admin.js";
// import { RuntimeManager } from "./cluster/runtime-manager.js";

// export async function buildApp() {
//   const app = Fastify({ logger: true });

//   const runtimeManager = new RuntimeManager();
//   const orchestrators = new Map<string, unknown>();

//   app.decorate("runtimeManager", runtimeManager);
//   app.decorate("orchestrators", orchestrators);

//   await registerHealthRoutes(app);
//   await registerOperatorRoutes(app);
//   await registerOrchestratorRoutes(app);
//   await registerEventRoutes(app);
//   await registerAdminRoutes(app);

//   return app;
// }
