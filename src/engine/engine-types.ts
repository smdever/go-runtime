// src\engine\engine-types.ts
import type { EngineId } from "../contracts/engine.js";

export interface EngineDescriptor {
  id: EngineId;
  name: string;
}
