import { ref } from "vue";
import { ImportService } from "@/services/ImportService";
import { useDatabaseStore } from "@/stores/database";
import type { DatabaseService } from "@/services/DatabaseService";
import { NoteService } from "@/services/NoteService";
import { useNotesStore } from "@/stores/notes";
import { useTagsStore } from "@/stores/tags";
import { TagService } from "@/services/TagService";
import { TagMapService } from "@/services/TagMapService";
import type { Note } from "@/database/types/note";
import type { NoteTagMapRow } from "@/database/types/tagMap";

export function attachTagMapsToNotes(notes: Note[], tagMaps: NoteTagMapRow[]) {
    return notes.map((note) => {
        const noteId = note[0];
        const relatedTagMaps = tagMaps.filter((tagMap) => {
            return tagMap[3] === noteId;
        });

        return {
            note,
            tagMaps: relatedTagMaps,
        };
    });
}

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
            name: file.name,
            importedAt: new Date(),
            isMaster: false,
            db,
        }

        store.addDatabase(instance);
        await grabNotes(db, instance.id);
        await grabTags(db, instance.id);
        await grabTagMaps(db, instance.id);

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

    async function grabTagMaps(db: DatabaseService, id: string) {
        const tagMapService = new TagMapService(db);
        const tagMaps = tagMapService.getAll();
        tagsStore.tagMaps.push({
            tagMaps,
            db_id: id
        });

        const notesForDb = notesStore.notes.find((entry) => entry.db_id === id);
        if (notesForDb) {
            const attachedNotes = attachTagMapsToNotes(notesForDb.notes, tagMaps as NoteTagMapRow[]);
            notesStore.notes = notesStore.notes.map((entry) => {
                if (entry.db_id !== id) return entry;

                return {
                    ...entry,
                    notesWithTagMaps: attachedNotes,
                } as typeof entry & { notesWithTagMaps: typeof attachedNotes };
            });
        }
    }

    return {
        loading,
        importBackup,
    };
}