import type { DatabaseService } from "@/services/DatabaseService";

export interface DatabaseInstance {
    id: string;
    name: string;
    version?: string;
    isMaster: boolean;
    db: DatabaseService;
    importedAt: Date;
}