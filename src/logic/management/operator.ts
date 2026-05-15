// src\logic\management\operator.ts
  import { randomUUID } from "node:crypto";
  import type {
    OperatorStatus,
    RunSubmission,
    CreateRunRequest,
    OperatorListRequest,
    OperatorListItem,
    OperatorCloseRequest,
    OperatorCloseResult,
    OperatorRunRequest,
    OperatorRunResult,    
  } from "../../contracts/operator.js";
  import { RuntimeManager } from "../../cluster/runtime-manager.js";
  import type { IOrchestratorLike } from "./orchestrator.js";
  import { Orchestrator } from "./orchestrator.js";
  import { orchestratorRegistry } from "./orchestrator-registry.js";
  import { operatorList } from "./operator-list.js";
  import { operatorClose } from "./operator-close.js";
  import { operatorRun,  type OperatorRunDeps } from "./operator-run.js";
  import { findExecutable } from "../../engine/executable-registry.js";

  // const DEFAULT_EXECUTABLES = {
  //   chat: {
  //     id: "chat-lite",
  //     kind: "executable" as const,
  //     path: "./flows/executables/CHAT-Lite.js",
  //   },
  //   faicp: {
  //     id: "faicp-lite",
  //     kind: "executable" as const,
  //     path: "./flows/executables/FAICP-Lite.js",
  //   },
  // };

  export class Operator {
    constructor(private readonly runtimeManager = new RuntimeManager()) {}

    async getStatus(): Promise<OperatorStatus> {
      return {
        activeRuns: this.runtimeManager.count(),
        supportedEngines: ["executable", "interpretive"],
      };
    }

    // async createOrchestrator(request: CreateRunRequest): Promise<IOrchestratorLike> {
    //   const submission = this.normalizeSubmission(request);
    //   const orchestrator = new Orchestrator(submission, this.runtimeManager);
    //   orchestratorRegistry.set(orchestrator);
    //   return orchestrator;
    // }

    async createOrchestrator(request: CreateRunRequest): Promise<IOrchestratorLike> {
      const submission = await this.normalizeSubmission(request);
      const orchestrator = new Orchestrator(submission, this.runtimeManager);
      orchestratorRegistry.set(orchestrator);
      return orchestrator;
    }

    async list(request: OperatorListRequest): Promise<OperatorListItem[]> {
      return operatorList(request);
    }

    async close(request: OperatorCloseRequest): Promise<OperatorCloseResult> {
      return operatorClose(request);
    }

    async run(request: OperatorRunRequest): Promise<OperatorRunResult> {
      return operatorRun(request, {
        createOrchestrator: (createRequest) => this.createOrchestrator(createRequest),
      });
    }    

    private async normalizeSubmission(request: CreateRunRequest): Promise<RunSubmission> {
      const engine = request.engine ?? "executable";
      const actors = request.actors ?? [];
      const runId = request.runId ?? randomUUID();

      //const asset = this.resolveAsset(request, actors.length, !!request.reasoning);
      const asset = await this.resolveAsset(request);

      console.log("Normalized submission:", {
        runId,
        engine,
        asset,
        actors,
        reasoning: request.reasoning?.model ?? null,
      });

      return {
        runId,
        engine,
        asset,
        actors,
        reasoning: request.reasoning,
        initialPrompt: request.initialPrompt,
        metadata: request.metadata,
      };
    }

    // private resolveAsset(
    //   request: CreateRunRequest,
    //   actorCount: number,
    //   hasReasoning: boolean
    // ) {
    //   if (request.executable?.path || request.executable?.inlineContent) {
    //     return {
    //       id: "submitted-executable",
    //       kind: "executable" as const,
    //       path: request.executable.path,
    //       inlineContent: request.executable.inlineContent,
    //       entryExport: request.executable.entryExport,
    //       metadata: request.executable.metadata,
    //     };
    //   }

    //   if (actorCount <= 1 && !hasReasoning) {
    //     return { ...DEFAULT_EXECUTABLES.chat };
    //   }

    //   return { ...DEFAULT_EXECUTABLES.faicp };
    // }

    private async resolveAsset(request: CreateRunRequest) {
      if (request.executable?.path || request.executable?.inlineContent) {
        return {
          id: request.executable.metadata?.name?.toString() ?? "submitted-executable",
          kind: "executable" as const,
          path: request.executable.path,
          inlineContent: request.executable.inlineContent,
          entryExport: request.executable.entryExport,
          metadata: request.executable.metadata,
        };
      }

      if (!request.flow) {
        throw new Error("Start requires either executable or flow.");
      }

      const artifact = await findExecutable(request.flow);

      if (!artifact) {
        throw new Error(`Executable flow not found: ${request.flow}`);
      }

      return {
        id: artifact.id,
        kind: "executable" as const,
        path: artifact.path,
        metadata: {
          name: artifact.name,
          extension: artifact.extension,
          source: "trusted-folder",
        },
      };
    }
  }

