// src/routes/operator.ts
import type { FastifyInstance } from "fastify";
import { Operator } from "../logic/management/operator.js";
import type {
  CreateRunRequest,
  OperatorCloseRequest,
  OperatorListRequest,
  OperatorRunRequest,  
} from "../contracts/operator.js";

export async function registerOperatorRoutes(app: FastifyInstance) {
  const operator = new Operator();

  app.get("/operator/status", async () => {
    return operator.getStatus();
  });

  app.post<{ Body: CreateRunRequest }>("/operator/start", async (request) => {
    const orchestrator = await operator.createOrchestrator(request.body);
    await orchestrator.start();

    return {
      ok: true,
      runId: orchestrator.getRunId(),
      snapshot: await orchestrator.snapshot(),
    };
  });

  app.post<{ Body: OperatorListRequest }>("/operator/list", async (request, reply) => {
    const items = await operator.list(request.body);
    return reply.send({
      ok: true,
      items,
    });
  });

  app.post<{ Body: OperatorCloseRequest }>("/operator/close", async (request, reply) => {
    const result = await operator.close(request.body);

    if (!result.closed && result.reason === "forbidden") {
      return reply.code(403).send({
        ok: false,
        ...result,
      });
    }

    if (!result.closed && result.reason === "not_found") {
      return reply.code(404).send({
        ok: false,
        ...result,
      });
    }

    return reply.send({
      ok: true,
      ...result,
    });
  });

  app.post<{ Body: OperatorRunRequest }>("/operator/run", async (request, reply) => {
    const result = await operator.run(request.body);

    if (!result.ok && result.reason === "missing_executable") {
      return reply.code(400).send(result);
    }

    if (!result.ok && result.reason === "forbidden") {
      return reply.code(403).send(result);
    }

    if (!result.ok) {
      return reply.code(500).send(result);
    }

    return reply.send(result);
  });  
}

// import type { FastifyInstance } from "fastify";
// import { Operator } from "../logic/management/operator.js";
// import { Orchestrator } from "../logic/management/orchestrator.js";
// import type { CreateRunRequest } from "../contracts/operator.js";
// import { orchestratorRegistry } from "../logic/management/orchestrator-registry.js";

// export async function registerOperatorRoutes(app: FastifyInstance): Promise<void> {
//   const operator = new Operator();

//   app.get("/operator/status", async () => operator.getStatus());

//   app.post("/operator/start", async (request) => {
//     const runRequest = request.body as CreateRunRequest;
//     console.log("START request:", JSON.stringify(runRequest, null, 2));

//     const orchestrator = await operator.createOrchestrator(runRequest);
//     orchestratorRegistry.set(orchestrator);
//     await orchestrator.start();

//     return { ok: true, runId: orchestrator.getRunId() };
//   });
// }
