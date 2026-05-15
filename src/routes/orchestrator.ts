// src\routes\orchestrator.ts
  import type { FastifyInstance } from "fastify";
  import { orchestratorRegistry } from "../logic/management/orchestrator-registry.js";

  export async function registerOrchestratorRoutes(app: FastifyInstance): Promise<void> {
    app.post("/orchestrator/:runId/send", async (request, reply) => {
      const { runId } = request.params as { runId: string };
      const body = request.body as { prompt?: string };

      const orchestrator = orchestratorRegistry.get(runId);
      if (!orchestrator) {
        reply.code(404);
        return { ok: false, runId, error: "Run not found." };
      }

      const prompt = String(body?.prompt ?? "").trim();
      if (!prompt) {
        reply.code(400);
        return { ok: false, runId, error: "Prompt is required." };
      }

      await orchestrator.send(prompt);
      return { ok: true, runId, acceptedPrompt: prompt };
    });

    app.get("/orchestrator/:runId/status", async (request, reply) => {
      const { runId } = request.params as { runId: string };

      const orchestrator = orchestratorRegistry.get(runId);
      if (!orchestrator) {
        reply.code(404);
        return { ok: false, runId, error: "Run not found." };
      }

      const snapshot = await orchestrator.snapshot();
      return { ok: true, runId, snapshot };
    });

    app.get("/orchestrator/:runId/response", async (request, reply) => {
      const { runId } = request.params as { runId: string };

      const orchestrator = orchestratorRegistry.get(runId);
      if (!orchestrator) {
        reply.code(404);
        return { ok: false, runId, error: "Run not found." };
      }

      const snapshot = await orchestrator.snapshot();

      return {
        ok: true,
        runId,
        activeNode: snapshot?.activeNode ?? null,
        unifiedResponse: snapshot?.unifiedResponse ?? null,
        updatedAt: snapshot?.updatedAt ?? null,
      };
    });
  }