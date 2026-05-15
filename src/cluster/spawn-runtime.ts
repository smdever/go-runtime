import { fork, type ChildProcess } from "node:child_process";
import path from "node:path";

export function spawnRuntimeWorker(): ChildProcess {
  const workerPath = path.resolve(process.cwd(), "dist/src/worker.js");
  return fork(workerPath, [], { stdio: ["inherit", "inherit", "inherit", "ipc"] });
}
