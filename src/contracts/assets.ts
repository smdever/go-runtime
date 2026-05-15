// src\contracts\assets.ts
  export type AssetKind = "executable" | "source";

  export interface AssetRef {
    id: string;
    kind: AssetKind;
    path?: string;
    inlineContent?: string;
    entryExport?: string;
    metadata?: Record<string, unknown>;
  }
