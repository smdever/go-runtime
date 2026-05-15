// src/telemetry/sse.ts
import type { FastifyReply } from "fastify";
import type { BufferedRuntimeEvent } from "../contracts/events.js";

export interface SseSink {
  publish(event: BufferedRuntimeEvent): void;
  close(): void;
}

export function writeSseHeaders(reply: FastifyReply): void {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("X-Accel-Buffering", "no");
}

export function writeSseEvent(reply: FastifyReply, event: BufferedRuntimeEvent): void {
  reply.raw.write(`id: ${event.sequence}\n`);
  reply.raw.write(`event: ${event.name}\n`);
  reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function writeNdjsonHeaders(reply: FastifyReply): void {
  reply.raw.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("X-Accel-Buffering", "no");
}

export function writeNdjsonEvent(reply: FastifyReply, event: BufferedRuntimeEvent): void {
  reply.raw.write(`${JSON.stringify(event)}\n`);
}

export function createSseSink(reply: FastifyReply): SseSink {
  return {
    publish(event: BufferedRuntimeEvent): void {
      writeSseEvent(reply, event);
    },
    close(): void {
      if (!reply.raw.destroyed) {
        reply.raw.end();
      }
    },
  };
}

// // src\telemetry\sse.ts
// export interface SseSink {
//   publish(event: unknown): void;
// }
