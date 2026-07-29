export enum TagType {
    User = 0,
    // Replace these names once their actual meanings are confirmed
    Unknown1 = 1,
    Unknown2 = 2,
}

export type Tag = [
    tagId: number,
    type: TagType,
    name: string,
]