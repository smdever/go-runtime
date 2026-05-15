// src\logic\management\operator-auth.ts
    import { readConfig } from "../../shared/config.js";

    export function isAdministratorKey(value: string | null | undefined): boolean {
        const key = value?.trim();
        if (!key) {
            return false;
        }

        const config = readConfig();
        const adminKey = config.administratorKey?.trim();

        if (!adminKey) {
            return false;
        }

        return key === adminKey;
    }
    