// src\logic\management\orchestrator-registry.ts
    import type { IOrchestratorLike } from "./orchestrator.js";

    class OrchestratorRegistry {
    private readonly items = new Map<string, IOrchestratorLike>();

    set(orchestrator: IOrchestratorLike): void {
        this.items.set(orchestrator.getRunId(), orchestrator);
    }

    get(runId: string): IOrchestratorLike | undefined {
        return this.items.get(runId);
    }

    list(): IOrchestratorLike[] {
        return Array.from(this.items.values());
    }

    delete(runId: string): boolean {
        return this.items.delete(runId);
    }

    has(runId: string): boolean {
        return this.items.has(runId);
    }
    }

    export const orchestratorRegistry = new OrchestratorRegistry();
