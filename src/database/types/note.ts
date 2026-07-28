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