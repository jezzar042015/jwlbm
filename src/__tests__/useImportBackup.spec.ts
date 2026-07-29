import { describe, expect, it } from "vitest";
import { attachTagMapsToNotes } from "../composables/useImportBackup";
import type { Note } from "../database/types/note";
import type { NoteTagMap } from "../database/types/tagMap";

describe("attachTagMapsToNotes", () => {
    it("attaches tag maps to the matching note by noteId", () => {
        const notes: Note[] = [
            [
                7,
                "guid-1",
                null,
                null,
                "First note",
                "Body",
                "2024-01-01",
                "2024-01-01",
                0,
                null,
            ],
        ];

        const tagMaps: NoteTagMap[] = [
            {
                tagMapId: 1,
                tagId: 10,
                position: 0,
                playlistItemId: null,
                locationId: null,
                noteId: 7,
            },
        ];

        const result = attachTagMapsToNotes(notes, tagMaps);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            note: notes[0],
            tagMaps,
        });
    });
});
