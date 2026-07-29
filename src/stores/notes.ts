
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useDatabaseStore } from "./database";
import type { Note } from "@/database/types/note";
import type { NoteTagMapRow } from "@/database/types/tagMap";

export const useNotesStore = defineStore("notes", () => {

    interface NotesState {
        db_id: string;
        notes: Note[];
        notesWithTagMaps?: {
            note: Note,
            tagMaps: NoteTagMapRow[]
        }[];
    }

    const dbStore = useDatabaseStore();

    const notes = ref<NotesState[]>([])

    const activeDatabaseNotes = computed(() => {
        const activeDbId = dbStore.activeDatabaseId;
        return notes.value.find(n => n.db_id === activeDbId)?.notesWithTagMaps || [];
    })

    return {
        notes,
        activeDatabaseNotes
    }
})