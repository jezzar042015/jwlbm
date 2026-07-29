import { USERMARK_ALL_LIST } from "@/database/sql/userMarks";
import type { DatabaseService } from "./DatabaseService";

export class UserMarkService {
    constructor(readonly database: DatabaseService) { }

    getAll() {
        const result = this.database.query(USERMARK_ALL_LIST);
        return result[0].values;
    }
}