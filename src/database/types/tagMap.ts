interface BaseTagMap {
    tagMapId: number
    tagId: number
    position: number
}

export interface PlaylistItemTagMap extends BaseTagMap {
    playlistItemId: number
    locationId: null
    noteId: null
}

export interface LocationTagMap extends BaseTagMap {
    playlistItemId: null
    locationId: number
    noteId: null
}

export interface NoteTagMap extends BaseTagMap {
    playlistItemId: null
    locationId: null
    noteId: number
}

export type TagMap =
    | PlaylistItemTagMap
    | LocationTagMap
    | NoteTagMap