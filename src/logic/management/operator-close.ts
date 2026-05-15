    // src\logic\management\operator-close.ts
    import type { OperatorCloseRequest, OperatorCloseResult } from "../../contracts/operator.js";
    import { orchestratorRegistry } from "./orchestrator-registry.js";
    import { isAdministratorKey } from "./operator-auth.js";

    export async function operatorClose(
    request: OperatorCloseRequest
    ): Promise<OperatorCloseResult> {
    const orchestrator = orchestratorRegistry.get(request.runId);

    if (!orchestrator) {
        return {
        runId: request.runId,
        closed: false,
        reason: "not_found",
        };
    }

    const isAdmin = isAdministratorKey(request.key);
    if (!isAdmin && request.key !== request.runId) {
        return {
        runId: request.runId,
        closed: false,
        reason: "forbidden",
        };
    }

    await orchestrator.stop();
    orchestratorRegistry.delete(request.runId);

    return {
        runId: request.runId,
        closed: true,
    };
    }
