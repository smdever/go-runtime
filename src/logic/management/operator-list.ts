//  src\logic\management\operator-list.ts
    import type { OperatorListItem, OperatorListRequest } from "../../contracts/operator.js";
    import { orchestratorRegistry } from "./orchestrator-registry.js";
    import { isAdministratorKey } from "./operator-auth.js";

    export async function operatorList(request: OperatorListRequest): Promise<OperatorListItem[]> {
    if (isAdministratorKey(request.key)) {
        const orchestrators = orchestratorRegistry.list();

        return Promise.all(
        orchestrators.map(async (orchestrator) => ({
            runId: orchestrator.getRunId(),
            snapshot: await orchestrator.snapshot(),
        }))
        );
    }

    const runId = request.runId?.trim();
    if (!runId) {
        return [];
    }

    const orchestrator = orchestratorRegistry.get(runId);
    if (!orchestrator) {
        return [];
    }

    return [
        {
        runId: orchestrator.getRunId(),
        snapshot: await orchestrator.snapshot(),
        },
    ];
    }
    