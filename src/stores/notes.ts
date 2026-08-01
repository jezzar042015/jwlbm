import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useDatabaseStore } from "./database";

import type { ConflictingNotesState, Note, NotesState, NoteWithTagMap } from "@/database/types/note";

export const useNotesStore = defineStore("notes", () => {


    const dbStore = useDatabaseStore();

    const notes = ref<NotesState[]>([]);

    /**
     * Creates a comparison key for a note.
     * IDs are intentionally ignored because each database
     * generates its own auto-incrementing IDs.
     */
    const getNoteKey = (note: Note): string => {
        const title = note[4] ?? "";
        const content = note[5] ?? "";

        return `${title}\u0000${content}`;
    };

    const activeDatabaseNotes = computed<NoteWithTagMap[]>(() => {
        return (
            notes.value.find(
                state => state.db_id === dbStore.activeDatabaseId
            )?.notesWithTagMaps ?? []
        );
    });

    /**
     * Returns notes from non-master databases that do not already
     * exist in the master database.
     *
     * Equality is determined by title + content.
     * The original note IDs are ignored because they are local
     * to each database and will be regenerated during import.
     */
    const conflictingNoteStates = computed<ConflictingNotesState[]>(() => {
        const masterDatabase = dbStore.databases.find(db => db.isMaster);

        if (!masterDatabase) {
            return [];
        }

        const masterState = notes.value.find(
            state => state.db_id === masterDatabase.id
        );

        const masterNotes = masterState?.notesWithTagMaps ?? [];

        const masterNoteKeys = new Set(
            masterNotes.map(({ note }) => getNoteKey(note))
        );

        return notes.value
            .filter(state => state.db_id !== masterDatabase.id)
            .map<ConflictingNotesState>(state => ({
                db_id: state.db_id,
                notes: (state.notesWithTagMaps ?? []).filter(({ note }) => {
                    return !masterNoteKeys.has(getNoteKey(note));
                }),
            }))
            .filter(state => state.notes.length > 0);
    });

    return {
        notes,
        activeDatabaseNotes,
        conflictingNoteStates,
    };
});