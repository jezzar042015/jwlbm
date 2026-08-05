import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useDatabaseStore } from "./database";
import { getCachedPersistedState, readPersistedState, writePersistedState } from "./persistence";

import type { ConflictingNotesState, Note, NotesState, NoteWithTagMap } from "@/database/types/note";

export const useNotesStore = defineStore("notes", () => {


    const dbStore = useDatabaseStore();

    const notes = ref<NotesState[]>([]);

    const persist = async () => {
        await writePersistedState("notes", notes.value);
    };

    async function hydrate() {
        const cachedNotes = getCachedPersistedState<NotesState[]>("notes");
        if (cachedNotes !== undefined) {
            notes.value = cachedNotes;
        } else {
            const persistedNotes = await readPersistedState<NotesState[]>("notes");
            if (persistedNotes !== null) {
                notes.value = persistedNotes;
            }
        }
    }

    void hydrate();

    watch(() => notes.value, () => { void persist(); }, { deep: true, flush: "post" });



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

    const toComparableNotes = (state: NotesState | undefined) => {
        if (!state) {
            return [];
        }

        if ((state.notesWithTagMaps ?? []).length > 0) {
            return state.notesWithTagMaps ?? [];
        }

        return (state.notes ?? []).map((note) => ({
            note,
            tagMaps: [],
        }));
    };

    const activeDatabaseId = computed(() => {
        return dbStore.activeDatabaseId ?? dbStore.databases[0]?.id;
    });

    const activeDatabaseNotes = computed<NoteWithTagMap[]>(() => {
        const activeState = notes.value.find(
            state => state.db_id === activeDatabaseId.value
        );

        const notesWithTagMaps = activeState?.notesWithTagMaps ?? [];

        if (notesWithTagMaps.length > 0) {
            return notesWithTagMaps;
        }

        const rawNotes = activeState?.notes ?? [];
        return rawNotes.map((note) => ({
            note,
            tagMaps: [],
        }));
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
        const masterDatabaseId = dbStore.databases.find(db => db.isMaster)?.id
            ?? dbStore.databases[0]?.id
            ?? notes.value[0]?.db_id;

        if (!masterDatabaseId) {
            return [];
        }

        const masterState = notes.value.find(state => state.db_id === masterDatabaseId);
        const comparableMasterNotes = toComparableNotes(masterState as NotesState);
        const masterNoteKeys = new Set(
            comparableMasterNotes.map(({ note }) => getNoteKey(note))
        );

        return notes.value
            .filter(state => state.db_id !== masterDatabaseId)
            .map<ConflictingNotesState>(state => ({
                db_id: state.db_id,
                notes: toComparableNotes(state).filter(({ note }) => {
                    return !masterNoteKeys.has(getNoteKey(note));
                }),
            }))
            .filter(state => state.notes.length > 0);
    });

    const activeDatabaseConflictingNotes = computed<NoteWithTagMap[]>(() => {
        const activeId = activeDatabaseId.value;

        return (
            conflictingNoteStates.value.find(state => state.db_id === activeId)
                ?.notes ?? []
        );
    });

    return {
        notes,
        activeDatabaseNotes,
        activeDatabaseConflictingNotes,
        conflictingNoteStates,
        persist,
        hydrate,
    };
});