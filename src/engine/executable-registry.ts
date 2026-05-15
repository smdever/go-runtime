    // src\engine\executable-registry.ts
    import path from "node:path";
    import fs from "node:fs/promises";

    const DEFAULT_EXECUTABLE_DIR =
    process.env.GO_EXECUTABLE_DIR ??
    path.resolve(process.cwd(), "flows", "executables");

    const ALLOWED_EXTENSIONS = new Set([".js", ".mjs", ".lfx", ".bfx"]);

    export interface ExecutableArtifact {
    id: string;
    name: string;
    kind: "executable";
    path: string;
    extension: string;
    }

    export async function listExecutables(
    executableDir = DEFAULT_EXECUTABLE_DIR
    ): Promise<ExecutableArtifact[]> {
    const entries = await fs.readdir(executableDir, { withFileTypes: true });

    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
        const fullPath = path.join(executableDir, entry.name);
        const parsed = path.parse(entry.name);

        return {
            id: parsed.name.toLowerCase(),
            name: parsed.name,
            kind: "executable" as const,
            path: fullPath,
            extension: parsed.ext.toLowerCase(),
        };
        })
        .filter((artifact) => ALLOWED_EXTENSIONS.has(artifact.extension))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    export async function findExecutable(
    flow: string,
    executableDir = DEFAULT_EXECUTABLE_DIR
    ): Promise<ExecutableArtifact | null> {
    const normalized = flow.trim().toLowerCase();
    const items = await listExecutables(executableDir);

    return (
        items.find((x) => x.id === normalized) ??
        items.find((x) => x.name.toLowerCase() === normalized) ??
        items.find((x) => path.basename(x.path).toLowerCase() === normalized) ??
        null
    );
    }