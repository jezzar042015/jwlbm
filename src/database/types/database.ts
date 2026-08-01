import type { DatabaseService } from "@/services/DatabaseService";

export interface DatabaseInstance {
    id: string;
    name: string;
    version?: string;
    isMaster: boolean;
    db: DatabaseService;
    importedAt: Date;
}

export interface DatabaseManifest {
    name: string
    creationDate: string
    version: number
    type: number
    userDataBackup: {
        lastModifiedDate: string
        deviceName: string
        databaseName: string
        hash: string
        schemaVersion: number
    }
}

export interface DatabaseWithManifest {
    id: string;
    isMaster: boolean;
    importedAt: Date;
    name: string;
    db: {
        manifest: {
            name: string;
            creationDate: string;
            version: number;
            type: number;
            userDataBackup: {
                lastModifiedDate: string;
                deviceName: string;
                databaseName: string;
                hash: string;
                schemaVersion: number;
            };
        } | undefined;
        open: (data: Uint8Array<ArrayBufferLike>, manifest?: DatabaseManifest) => Promise<void>;
        query: (sql: string) => any;
        close: () => void;
    };
}