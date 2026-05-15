export function logConsoleTelemetry(message: string, payload?: unknown): void {
  console.log(message, payload ?? "");
}
