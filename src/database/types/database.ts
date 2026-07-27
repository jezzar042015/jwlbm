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