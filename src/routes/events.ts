// src/routes/events.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { BufferedRuntimeEvent } from "../contracts/events.js";
import { orchestratorRegistry } from "../logic/management/orchestrator-registry.js";
import {
  writeNdjsonEvent,
  writeNdjsonHeaders,
  writeSseEvent,
  writeSseHeaders,
} from "../telemetry/sse.js";

type EventsParams = {
  runId: string;
};

type EventsQuery = {
  since?: string;
};

function parseSince(value: string | undefined): number | undefined {
  if (value == null || value.trim() === "") return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;

  return parsed;
}

type EventStreamFormat = "json" | "ndjson" | "sse";

function getEventStreamFormat(request: FastifyRequest): EventStreamFormat {
  const accept = request.headers.accept ?? "";
  if (accept.includes("text/event-stream")) return "sse";
  if (accept.includes("application/x-ndjson")) return "ndjson";
  return "json";
}

export async function registerEventRoutes(app: FastifyInstance): Promise<void> {
  app.get<{
    Params: EventsParams;
    Querystring: EventsQuery;
  }>("/orchestrator/:runId/events", async (request, reply) => {
    const { runId } = request.params;
    const since = parseSince(request.query.since);
    const format = getEventStreamFormat(request);

    const orchestrator = orchestratorRegistry.get(runId);
    if (!orchestrator) {
      reply.code(404);
      return {
        ok: false,
        runId,
        error: "Run not found.",
      };
    }

    if (format === "json") {
      const events = await orchestrator.getEventsSince(since);

      return {
        ok: true,
        runId,
        since: since ?? null,
        count: events.length,
        events,
      };
    }

    const writeEvent =
      format === "sse"
        ? (event: BufferedRuntimeEvent) => writeSseEvent(reply, event)
        : (event: BufferedRuntimeEvent) => writeNdjsonEvent(reply, event);

    if (format === "sse") {
      writeSseHeaders(reply);
    } else {
      writeNdjsonHeaders(reply);
    }

    reply.hijack();

    const initialEvents = await orchestrator.getEventsSince(since);
    for (const event of initialEvents) {
      writeEvent(event);
    }

    const unsubscribe = orchestrator.onEvent((event) => {
      writeEvent(event);
    });

    const heartbeat = setInterval(() => {
      if (format === "sse") {
        reply.raw.write(": heartbeat\n\n");
        return;
      }

      reply.raw.write(`${JSON.stringify({ type: "heartbeat", at: Date.now() })}\n`);
    }, 15000);

    let closed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;

      clearInterval(heartbeat);
      unsubscribe();

      if (!reply.raw.destroyed) {
        reply.raw.end();
      }
    };

    request.raw.on("close", cleanup);
    request.raw.on("error", cleanup);
  });
}

// // src\routes\events.ts
// import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import type { BufferedRuntimeEvent } from "../contracts/events.js";
// import type { Orchestrator } from "../logic/management/orchestrator.js";

// type EventsParams = {
//   runId: string;
// };

// type EventsQuery = {
//   since?: string;
// };

// function parseSince(value: string | undefined): number | undefined {
//   if (value == null || value.trim() === "") return undefined;

//   const parsed = Number(value);
//   if (!Number.isFinite(parsed)) return undefined;

//   return parsed;
// }

// function wantsSse(request: FastifyRequest): boolean {
//   const accept = request.headers.accept ?? "";
//   return accept.includes("text/event-stream");
// }

// function writeSseEvent(reply: FastifyReply, event: BufferedRuntimeEvent): void {
//   reply.raw.write(`id: ${event.sequence}\n`);
//   reply.raw.write(`event: ${event.name}\n`);
//   reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
// }

// export async function registerEventRoutes(app: FastifyInstance): Promise<void> {
//   app.get<{
//     Params: EventsParams;
//     Querystring: EventsQuery;
//   }>("/orchestrator/:runId/events", async (request, reply) => {
//     const { runId } = request.params;
//     const since = parseSince(request.query.since);

//     const orchestrator = (app as any).orchestrators?.get(runId) as Orchestrator | undefined;
//     if (!orchestrator) {
//       return reply.code(404).send({
//         ok: false,
//         error: `No live orchestrator found for runId=${runId}`,
//       });
//     }

//     if (!wantsSse(request)) {
//       const events = await orchestrator.getEventsSince(since);

//       return reply.send({
//         ok: true,
//         runId,
//         since: since ?? null,
//         count: events.length,
//         events,
//       });
//     }

//     reply.raw.setHeader("Content-Type", "text/event-stream");
//     reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
//     reply.raw.setHeader("Connection", "keep-alive");

//     // helpful for some reverse proxies
//     reply.raw.setHeader("X-Accel-Buffering", "no");

//     reply.hijack();

//     const initialEvents = await orchestrator.getEventsSince(since);
//     for (const event of initialEvents) {
//       writeSseEvent(reply, event);
//     }

//     const unsubscribe = orchestrator.onEvent((event) => {
//       writeSseEvent(reply, event);
//     });

//     const heartbeat = setInterval(() => {
//       reply.raw.write(": heartbeat\n\n");
//     }, 15000);

//     const cleanup = () => {
//       clearInterval(heartbeat);
//       unsubscribe();
//       reply.raw.end();
//     };

//     request.raw.on("close", cleanup);
//     request.raw.on("error", cleanup);
//   });
// }

// // import type { FastifyInstance } from "fastify";

// // export async function registerEventRoutes(app: FastifyInstance): Promise<void> {
// //   app.get("/events", async () => ({ ok: true, note: "SSE/websocket transport stub." }));
// // }
