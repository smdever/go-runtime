import type { FastifyInstance } from "fastify";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get("/admin", async () => ({ ok: true, note: "Admin surface stub." }));
}
