import { TAGMAP_ALL_LIST } from "@/database/sql/tagMaps";
import type { DatabaseService } from "./DatabaseService";

export class TagMapService {
    constructor(readonly database: DatabaseService) { }

    getAll() {
        const result = this.database.query(TAGMAP_ALL_LIST);
        return result[0].values;
    }
}