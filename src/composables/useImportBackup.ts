import { ref } from "vue";
import { ImportService } from "@/services/ImportService";
import { useDatabaseStore } from "@/stores/database";
import type { DatabaseService } from "@/services/DatabaseService";
import { NoteService } from "@/services/NoteService";
import { useNotesStore } from "@/stores/notes";
import { useTagsStore } from "@/stores/tags";
import { TagService } from "@/services/TagService";

export function useImportBackup() {
    const loading = ref(false);

    const store = useDatabaseStore();
    const notesStore = useNotesStore();
    const tagsStore = useTagsStore();

    async function importBackup(file: File) {
        loading.value = true;

        const db = await ImportService.importBackup(file);

        const instance = {
            id: crypto.randomUUID(),
            name: "My Backup 2026",
            version: "15.1",
            importedAt: new Date(),
            isMaster: false,
            db,
        }

        store.addDatabase(instance);
        await grabNotes(db, instance.id);
        await grabTags(db, instance.id);

        loading.value = false;
    }

    async function grabNotes(db: DatabaseService, id: string) {
        const noteService = new NoteService(db);
        const notes = noteService.getAll();

        notesStore.notes.push({
            notes,
            db_id: id
        });
    }

    async function grabTags(db: DatabaseService, id: string) {
        const tagsService = new TagService(db);
        const tags = tagsService.getAll();
        tagsStore.tags.push({
            tags,
            db_id: id
        });
    }

    return {
        loading,
        importBackup,
    };
}