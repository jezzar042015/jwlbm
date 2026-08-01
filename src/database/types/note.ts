import type { Location } from "./location";
import type { UserMark } from "./marker";
import type { NoteTagMapRow } from "./tagMap";

export enum NoteBlockType {
    None = 0,
    Paragraph = 1,
    Unknown = 2,
}


export type Note = [
    noteId: number,
    guid: string,
    userMarkId: number | null,
    locationId: number | null,
    title: string | null,
    content: string | null,
    lastModified: string,
    created: string,
    blockType: NoteBlockType,
    blockIdentifier: number | null,
];

export interface NoteWithTagMap {
    note: Note;
    tagMaps: NoteTagMapRow[];
    marker?: UserMark;
    location?: Location;
}

export interface NotesState {
    db_id: string;
    notes: Note[];
    notesWithTagMaps?: NoteWithTagMap[];
}

export interface ConflictingNotesState {
    db_id: string;
    notes: NoteWithTagMap[];
}