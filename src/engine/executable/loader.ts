// src/engine/executable/loader.ts
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface ExecutableFlowInstance {
  info?: Record<string, unknown>;
  getInformation?: () => unknown;
  getRuntime?: () => unknown;
  execute(ctx: unknown): Promise<unknown>;
  continue?(ctx: unknown): Promise<unknown>;
}

export interface ExecutableFlowModule {
  createFlow(runtime: Record<string, unknown>): ExecutableFlowInstance;
}

const SOURCE_FILE_EXTENSIONS = new Set([".lfx", ".bfx"]);

export async function loadExecutableModule(
  modulePath: string,
  passphrase = "LOKIPIED",
): Promise<ExecutableFlowModule> {
  const ext = path.extname(modulePath).toLowerCase();

  if (SOURCE_FILE_EXTENSIONS.has(ext)) {
    const source = await fs.readFile(modulePath, "utf8");

    return loadExecutableModuleFromSource(
      source,
      path.basename(modulePath),
      passphrase,
    );
  }

  const moduleUrl = pathToFileURL(modulePath).href;
  console.log("loadExecutableModule import url:", moduleUrl);

  const loaded = (await import(moduleUrl)) as Partial<ExecutableFlowModule>;

  if (typeof loaded.createFlow !== "function") {
    throw new Error(`Executable module missing createFlow(runtime): ${modulePath}`);
  }

  return loaded as ExecutableFlowModule;
}

export async function loadExecutableModuleFromSource(
  source: string,
  label = "submitted-flow",
  passphrase = "LOKIPIED",
): Promise<ExecutableFlowModule> {
  const encoded = Buffer.from(source, "utf8").toString("base64");
  const moduleUrl =
    `data:text/javascript;base64,${encoded}#${encodeURIComponent(label)}-${Date.now()}`;

  const loaded = (await import(moduleUrl)) as Partial<
    ExecutableFlowModule & {
      unpackLibrary?: (passphrase?: string) => Promise<ExecutableFlowModule>;
    }
  >;

  if (typeof loaded.createFlow === "function") {
    return loaded as ExecutableFlowModule;
  }

  if (typeof loaded.unpackLibrary === "function") {
    const unpacked = await loaded.unpackLibrary(passphrase);

    if (typeof unpacked.createFlow !== "function") {
      throw new Error(`Unpacked executable missing createFlow(runtime): ${label}`);
    }

    return unpacked;
  }

  throw new Error(
    `Executable module missing createFlow(runtime) or unpackLibrary(passphrase): ${label}`,
  );
}

// // src/engine/executable/loader.ts
//   import { pathToFileURL } from "node:url";

//   export interface ExecutableFlowInstance {
//     info?: Record<string, unknown>;
//     getInformation?: () => unknown;
//     getRuntime?: () => unknown;
//     execute(ctx: unknown): Promise<unknown>;
//     continue?(ctx: unknown): Promise<unknown>;
//   }

//   export interface ExecutableFlowModule {
//     createFlow(runtime: Record<string, unknown>): ExecutableFlowInstance;
//   }

//   export async function loadExecutableModule(
//     modulePath: string,
//   ): Promise<ExecutableFlowModule> {
//     const moduleUrl = pathToFileURL(modulePath).href;
//     console.log("loadExecutableModule import url:", moduleUrl);

//     const loaded = (await import(moduleUrl)) as Partial<ExecutableFlowModule>;

//     if (typeof loaded.createFlow !== "function") {
//       throw new Error(`Executable module missing createFlow(runtime): ${modulePath}`);
//     }

//     return loaded as ExecutableFlowModule;
//   }

//   export async function loadExecutableModuleFromSource(
//     source: string,
//     label = "submitted-flow",
//     passphrase = "LOKIPIED",
//   ): Promise<ExecutableFlowModule> {
//     const encoded = Buffer.from(source, "utf8").toString("base64");
//     const moduleUrl =
//       `data:text/javascript;base64,${encoded}#${encodeURIComponent(label)}-${Date.now()}`;

//     const loaded = (await import(moduleUrl)) as Partial<
//       ExecutableFlowModule & {
//         unpackLibrary?: (passphrase?: string) => Promise<ExecutableFlowModule>;
//       }
//     >;

//     if (typeof loaded.createFlow === "function") {
//       return loaded as ExecutableFlowModule;
//     }

//     if (typeof loaded.unpackLibrary === "function") {
//       const unpacked = await loaded.unpackLibrary(passphrase);

//       if (typeof unpacked.createFlow !== "function") {
//         throw new Error(`Unpacked executable missing createFlow(runtime): ${label}`);
//       }

//       return unpacked;
//     }

//     throw new Error(
//       `Executable module missing createFlow(runtime) or unpackLibrary(passphrase): ${label}`,
//     );
//   }
  