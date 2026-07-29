import { describe, expect, it } from "vitest";
import { attachTagMapsToNotes } from "../composables/useImportBackup";
import type { UserMark } from "../database/types/marker";
import type { Note } from "../database/types/note";
import type { NoteTagMapRow } from "../database/types/tagMap";

describe("attachTagMapsToNotes", () => {
    it("attaches tag maps to the matching note by noteId", async () => {
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

        const tagMaps: NoteTagMapRow[] = [
            [
                1,
                null,
                null,
                7,
                10,
                0,
            ]
        ];

        const result = await attachTagMapsToNotes(notes, tagMaps);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            note: notes[0],
            tagMaps,
        });
    });

    it("attaches the matching user mark when note[2] points to a user mark id", async () => {
        const notes: Note[] = [
            [
                7,
                "guid-1",
                42,
                null,
                "First note",
                "Body",
                "2024-01-01",
                "2024-01-01",
                0,
                null,
            ],
        ];

        const userMarks: UserMark[] = [
            [
                42,
                0,
                1,
                0,
                "mark-guid",
                1,
            ],
        ];

        const result = await attachTagMapsToNotes(notes, [], userMarks);

        expect(result[0]?.marker).toEqual(userMarks[0]);
    });
});
