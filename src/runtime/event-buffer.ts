    // src/runtime/event-buffer.ts
    import type { RuntimeEvent } from "../contracts/events.js";

    /**
     * Worker-local rolling runtime event buffer.
     *
     * TEMPORARY:
     * - In-memory only
     * - Owned by the worker/run boundary
     * - Meant to preserve the outward contract so storage can be replaced later with ILokiEvent or similar
     */
    export interface BufferedRuntimeEvent<T = unknown> extends RuntimeEvent<T> {
    sequence: number;
    }

    export interface EventBufferOptions {
    maxEvents?: number;
    }

    export class EventBuffer {
    private readonly maxEvents: number;
    private sequence = 0;
    private events: BufferedRuntimeEvent[] = [];

    constructor(options: EventBufferOptions = {}) {
        this.maxEvents = Math.max(1, options.maxEvents ?? 100);
    }

    append<T = unknown>(event: RuntimeEvent<T>): BufferedRuntimeEvent<T> {
        const buffered: BufferedRuntimeEvent<T> = {
        ...event,
        sequence: ++this.sequence,
        };

        this.events.push(buffered);

        if (this.events.length > this.maxEvents) {
        this.events.splice(0, this.events.length - this.maxEvents);
        }

        return buffered;
    }

    getAll(): BufferedRuntimeEvent[] {
        return [...this.events];
    }

    getSince(sequence?: number | null): BufferedRuntimeEvent[] {
        if (sequence == null || !Number.isFinite(sequence)) {
        return this.getAll();
        }

        return this.events.filter((event) => event.sequence > sequence);
    }

    getLatestSequence(): number {
        return this.sequence;
    }

    clear(): void {
        this.events = [];
        this.sequence = 0;
    }

    size(): number {
        return this.events.length;
    }
    }