import { LOCATIONS_ALL_LIST } from "@/database/sql/locations";
import type { DatabaseService } from "./DatabaseService";

export class LocationService {
    constructor(readonly database: DatabaseService) { }

    getAll() {
        const result = this.database.query(LOCATIONS_ALL_LIST);
        return result[0].values;
    }
}