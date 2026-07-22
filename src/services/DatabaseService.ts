import { getSqlJs } from "@/database/initSqlJs";

export class DatabaseService {
    private db: any;

    async open(data: Uint8Array) {
        const SQL = await getSqlJs();

        this.db = new SQL.Database(data);
    }

    query(sql: string) {
        return this.db.exec(sql);
    }

    close() {
        this.db.close();
    }
}