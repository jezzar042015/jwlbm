import type { Note } from "@/database/types/note";
import { DatabaseService } from "./DatabaseService";
import { NOTE_ALL_LIST, NOTE_COUNT } from "@/database/sql/notes";

export class NoteService {
    constructor(readonly database: DatabaseService) { }

    getCount(): number {
        const result = this.database.query(NOTE_COUNT);

        return result[0].values[0][0] as number;
    }

    getAll(): Note[] {
        const result = this.database.query(NOTE_ALL_LIST);
        return result[0].values as Note[];
    }

    // getById()
    // search()
}