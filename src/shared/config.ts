// src\shared\config.ts
export interface AppConfig {
  port: number;
  host: string;
  administratorKey: string | null;
}

export function readConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "127.0.0.1",
    administratorKey: process.env.ADMINISTRATOR_KEY ?? null,
  };
}
