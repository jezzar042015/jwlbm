export enum LocationType {
    Document = 0,
    Unknown1 = 1,
    Unknown2 = 2,
    Unknown3 = 3,
}

export type Location = [
    locationId: number,
    bookNumber: number | null,
    chapterNumber: number | null,
    documentId: number | null,
    track: number | null,
    issueTagNumber: number,
    keySymbol: string | null,
    mepsLanguage: number | null,
    type: LocationType,
    title: string | null,
    specialty: string | null,
    edition: string | null,
]