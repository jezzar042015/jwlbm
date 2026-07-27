import { getSqlJs } from "@/database/initSqlJs";
import type { DatabaseManifest } from "@/database/types/database";

export class DatabaseService {
    private db: any;
    manifest?: DatabaseManifest;

    async open(data: Uint8Array, manifest?: DatabaseManifest) {
        const SQL = await getSqlJs();

        this.db = new SQL.Database(data);
        this.manifest = manifest;
    }

    query(sql: string) {
        return this.db.exec(sql);
    }

    close() {
        this.db.close();
    }
}