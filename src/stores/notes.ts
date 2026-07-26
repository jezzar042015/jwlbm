import type { Note } from "@/database/types/note";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotesStore = defineStore("notes", () => {

    interface NotesState {
        db_id: string;
        notes: Note[];
    }

    const notes = ref<NotesState[]>([])

    return {
        notes
    }
})