export enum NoteBlockType {
    None = 0,
    Paragraph = 1,
    Unknown = 2,
}


export interface Note {
    /** Primary key */
    noteId: number

    /** Unique GUID */
    guid: string

    /** Optional reference to UserMark */
    userMarkId: number | null

    /** Optional reference to Location */
    locationId: number | null

    /** Optional title */
    title: string | null

    /** Optional note content */
    content: string | null

    /** ISO 8601 UTC timestamp */
    lastModified: string

    /** ISO 8601 UTC timestamp */
    created: string

    /**
     * 0 = None
     * 1 = Paragraph
     * 2 = ?
     */
    blockType: NoteBlockType

    /** Required when blockType is 1 or 2 */
    blockIdentifier: number | null
}