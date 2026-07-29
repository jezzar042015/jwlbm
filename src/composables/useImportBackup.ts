import type { DatabaseService } from "@/services/DatabaseService";
import type { Note } from "@/database/types/note";
import type { NoteTagMapRow } from "@/database/types/tagMap";
import type { UserMark } from "@/database/types/marker";
import { ImportService } from "@/services/ImportService";
import { NoteService } from "@/services/NoteService";
import { TagMapService } from "@/services/TagMapService";
import { TagService } from "@/services/TagService";
import { UserMarkService } from "@/services/UserMarkService";
import { ref } from "vue";
import { useDatabaseStore } from "@/stores/database";
import { useNotesStore } from "@/stores/notes";
import { useTagsStore } from "@/stores/tags";
import { useUserMarksStore } from "@/stores/userMarks";

export async function attachTagMapsToNotes(
    notes: Note[],
    tagMaps: NoteTagMapRow[],
    userMarks: UserMark[] = [],
    onProgress?: (progress: number) => Promise<void>
) {
    const total = notes.length;
    const attached = [] as Array<{
        note: Note;
        tagMaps: NoteTagMapRow[];
        marker?: UserMark;
    }>;

    for (let index = 0; index < total; index += 1) {
        const note = notes[index];
        const noteId = note?.[0];
        const noteUserMarkId = note?.[2];
        const relatedTagMaps = tagMaps.filter((tagMap) => {
            return tagMap[3] === noteId;
        });
        const marker = noteUserMarkId !== null
            ? userMarks.find((userMark) => userMark[0] === noteUserMarkId)
            : undefined;

        if (note) {
            attached.push({
                note,
                tagMaps: relatedTagMaps,
                marker,
            });
        }

        if (onProgress && (index % 10 === 0 || index === total - 1)) {
            await onProgress((index + 1) / total);
        }
    }

    return attached;
}

export function useImportBackup() {
    const loading = ref(false);

    const store = useDatabaseStore();
    const notesStore = useNotesStore();
    const tagsStore = useTagsStore();
    const userMarksStore = useUserMarksStore();

    async function importBackup(file: File, onProgress?: (p: number, msg?: string, mapProgress?: number) => void) {
        loading.value = true;

        const report = async (p: number, msg?: string, mapProgress?: number) => {
            onProgress?.(p, msg, mapProgress);
            // yield to the event loop so the UI can repaint between heavy steps
            await new Promise((r) => setTimeout(r, 0));
        };

        await report(0, 'Starting import...');

        try {
            await report(5, 'Extracting backup...');
            const db = await ImportService.importBackup(file);
            await report(40, 'Database opened');

            const instance = {
                id: crypto.randomUUID(),
                name: file.name,
                importedAt: new Date(),
                isMaster: false,
                db,
            }

            store.addDatabase(instance);
            await report(50, 'Registered database');

            await grabNotes(db, instance.id);
            await report(65, 'Loaded notes');

            await grabUserMarks(db, instance.id);
            await report(80, 'Loaded user marks');

            await grabTags(db, instance.id);
            await report(90, 'Loaded tags');

            await grabTagMaps(db, instance.id, report);
            await report(100, 'Import complete');
        } catch (err) {
            await report(100, 'Import failed');
            throw err;
        } finally {
            loading.value = false;
        }
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

    async function grabUserMarks(db: DatabaseService, id: string) {
        const userMarkService = new UserMarkService(db);
        const userMarks = userMarkService.getAll();

        userMarksStore.markers.push({
            userMarks,
            db_id: id
        });
    }

    async function grabTagMaps(db: DatabaseService, id: string, report: (p: number, msg?: string, mapProgress?: number) => Promise<void>) {
        await report(92, 'Loading tag maps...');

        const tagMapService = new TagMapService(db);
        const tagMaps = tagMapService.getAll();
        tagsStore.tagMaps.push({
            tagMaps,
            db_id: id
        });

        await report(95, 'Attaching tag maps to notes...');

        const notesForDb = notesStore.notes.find((entry) => entry.db_id === id);
        const userMarksForDb = userMarksStore.markers.find((entry) => entry.db_id === id);
        if (notesForDb) {
            const attachedNotes = await attachTagMapsToNotes(
                notesForDb.notes,
                tagMaps as NoteTagMapRow[],
                userMarksForDb?.userMarks ?? [],
                async (mapProgress) => {
                    await report(95 + mapProgress * 3, 'Attaching tag maps to notes...', mapProgress);
                }
            );
            notesStore.notes = notesStore.notes.map((entry) => {
                if (entry.db_id !== id) return entry;

                return {
                    ...entry,
                    notesWithTagMaps: attachedNotes,
                } as typeof entry & { notesWithTagMaps: typeof attachedNotes };
            });
        }

        await report(98, 'Tag maps attached');
    }

    return {
        loading,
        importBackup,
    };
}