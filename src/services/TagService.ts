import type { Tag } from "@/database/types/tag";
import type { DatabaseService } from "./DatabaseService";
import { TAG_ALL_LIST } from "@/database/sql/tags";

export class TagService {
    constructor(readonly database: DatabaseService) { }

    getAll(): Tag[] {
        const result = this.database.query(TAG_ALL_LIST);
        return result[0].values as Tag[];
    }
}