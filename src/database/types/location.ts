export enum LocationType {
    Document = 0,
    Unknown1 = 1,
    Unknown2 = 2,
    Unknown3 = 3,
}

export interface Location {
    /** Primary key */
    locationId: number

    /** Bible book number */
    bookNumber: number | null

    /** Bible chapter number */
    chapterNumber: number | null

    /** Publication document identifier */
    documentId: number | null

    /** Media/audio track number */
    track: number | null

    /** Issue tag number */
    issueTagNumber: number

    /** Publication key symbol (e.g. lff, nwt, w, wp) */
    keySymbol: string | null

    /** MEPS language identifier */
    mepsLanguage: number | null

    /** Location type */
    type: LocationType

    /** Display title */
    title: string | null

    /** Specialty information */
    specialty: string | null

    /** Edition information */
    edition: string | null
}