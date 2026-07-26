export enum TagType {
    User = 0,
    // Replace these names once their actual meanings are confirmed
    Unknown1 = 1,
    Unknown2 = 2,
}

export interface Tag {
    /** Primary key */
    tagId: number

    /** Tag category */
    type: TagType

    /** Tag name */
    name: string
}