import { DatabaseService } from "./DatabaseService";
import { NOTE_COUNT } from "@/database/queries/notes";

export class NoteService {
    constructor(private database: DatabaseService) { }

    getCount(): number {
        const result = this.database.query(NOTE_COUNT);

        return result[0].values[0][0] as number;
    }
}