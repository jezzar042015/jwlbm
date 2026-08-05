import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { DatabaseService } from "../services/DatabaseService";
import { useDatabaseStore } from "../stores/database";
import { useNotesStore } from "../stores/notes";
import { useImportBackup } from "../composables/useImportBackup";
import { useTagsStore } from "../stores/tags";
import { useUserMarksStore } from "../stores/userMarks";
import { useLocationsStore } from "../stores/locations";
import { clearPersistedStateCache, readPersistedState } from "../stores/persistence";

describe("database persistence", () => {
    beforeEach(async () => {
        clearPersistedStateCache();

        if (typeof window !== "undefined" && window.indexedDB) {
            const request = window.indexedDB.open("jw-library-backup-viewer-db", 1);
            await new Promise<void>((resolve) => {
                request.onupgradeneeded = () => {
                    const database = request.result;
                    if (!database.objectStoreNames.contains("persisted-state")) {
                        database.createObjectStore("persisted-state");
                    }
                };
                request.onsuccess = () => {
                    const database = request.result;
                    const transaction = database.transaction("persisted-state", "readwrite");
                    const store = transaction.objectStore("persisted-state");
                    const clearRequest = store.clear();
                    clearRequest.onsuccess = () => resolve();
                    clearRequest.onerror = () => resolve();
                    transaction.onabort = () => resolve();
                    transaction.onerror = () => resolve();
                    database.close();
                };
                request.onerror = () => resolve();
            });
        }

        setActivePinia(createPinia());
    });

    it("persists databases and parsed data so they can be rehydrated", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();
        const tagsStore = useTagsStore();
        const userMarksStore = useUserMarksStore();
        const locationsStore = useLocationsStore();

        const dbService = new DatabaseService();
        dbService.manifest = {
            userDataBackup: {
                lastModifiedDate: "2024-01-01",
                deviceName: "Test device",
            },
        } as any;

        dbStore.addDatabase({
            id: "db-1",
            isMaster: false,
            importedAt: new Date("2024-01-01T00:00:00.000Z"),
            name: "Backup 1",
            db: dbService,
        });

        notesStore.notes.push({ db_id: "db-1", notes: [] as any });
        tagsStore.tags.push({ db_id: "db-1", tags: [] as any });
        tagsStore.tagMaps.push({ db_id: "db-1", tagMaps: [] as any });
        userMarksStore.markers.push({ db_id: "db-1", userMarks: [] as any });
        locationsStore.locations.push({ db_id: "db-1", locations: [] as any });

        await notesStore.persist();
        await tagsStore.persist();
        await userMarksStore.persist();
        await locationsStore.persist();

        const persisted = await readPersistedState<unknown[]>("database");
        expect(persisted).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: "db-1" }),
        ]));

        setActivePinia(createPinia());

        const rehydratedDbStore = useDatabaseStore();
        const rehydratedNotesStore = useNotesStore();
        const rehydratedTagsStore = useTagsStore();
        const rehydratedUserMarksStore = useUserMarksStore();
        const rehydratedLocationsStore = useLocationsStore();

        expect(rehydratedDbStore.databases).toHaveLength(1);
        expect(rehydratedDbStore.databases[0]?.name).toBe("Backup 1");
        expect(rehydratedNotesStore.notes).toHaveLength(1);
        expect(rehydratedTagsStore.tags).toHaveLength(1);
        expect(rehydratedTagsStore.tagMaps).toHaveLength(1);
        expect(rehydratedUserMarksStore.markers).toHaveLength(1);
        expect(rehydratedLocationsStore.locations).toHaveLength(1);
    });

    it("recomputes the active database views after switching the active database", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();
        const tagsStore = useTagsStore();
        const userMarksStore = useUserMarksStore();
        const locationsStore = useLocationsStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "db-1",
            isMaster: true,
            importedAt: new Date(),
            name: "Backup 1",
            db: dbService,
        });

        notesStore.notes.push({
            db_id: "db-1",
            notes: [] as any,
            notesWithTagMaps: [{
                note: [1, "guid", null, null, "Title", "Body", "", "", 0, null] as any,
                tagMaps: [],
            }],
        });
        tagsStore.tags.push({ db_id: "db-1", tags: [] as any });
        tagsStore.tagMaps.push({ db_id: "db-1", tagMaps: [] as any });
        userMarksStore.markers.push({ db_id: "db-1", userMarks: [] as any });
        locationsStore.locations.push({ db_id: "db-1", locations: [] as any });

        await notesStore.persist();
        await tagsStore.persist();
        await userMarksStore.persist();
        await locationsStore.persist();
        await dbStore.persist();

        expect(notesStore.activeDatabaseNotes).toHaveLength(1);
        expect(tagsStore.activeDatabaseTags).toEqual([]);

        dbStore.setActiveDatabase("db-1");

        expect(notesStore.activeDatabaseNotes).toHaveLength(1);
    });

    it("falls back to raw notes when notesWithTagMaps are missing", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "db-2",
            isMaster: true,
            importedAt: new Date(),
            name: "Backup 2",
            db: dbService,
        });

        notesStore.notes.push({
            db_id: "db-2",
            notes: [[1, "guid", null, null, "Title", "Body", "", "", 0, null] as any],
        });

        await notesStore.persist();

        expect(notesStore.activeDatabaseNotes).toHaveLength(1);
        expect(notesStore.activeDatabaseNotes[0]?.note[4]).toBe("Title");
    });

    it("computes conflicting notes from raw persisted notes when enriched data is missing", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "master-db",
            isMaster: true,
            importedAt: new Date(),
            name: "Master",
            db: dbService,
        });

        dbStore.addDatabase({
            id: "secondary-db",
            isMaster: false,
            importedAt: new Date(),
            name: "Secondary",
            db: dbService,
        });

        notesStore.notes.push(
            {
                db_id: "master-db",
                notes: [[1, "master-guid", null, null, "Shared title", "Body", "", "", 0, null] as any],
            },
            {
                db_id: "secondary-db",
                notes: [
                    [2, "secondary-guid-1", null, null, "Shared title", "Body", "", "", 0, null] as any,
                    [3, "secondary-guid-2", null, null, "Unique title", "Body", "", "", 0, null] as any,
                ],
            }
        );

        await notesStore.persist();

        expect(notesStore.conflictingNoteStates).toHaveLength(1);
        expect(notesStore.conflictingNoteStates[0]?.db_id).toBe("secondary-db");
        expect(notesStore.conflictingNoteStates[0]?.notes).toHaveLength(1);
        expect(notesStore.conflictingNoteStates[0]?.notes[0]?.note[4]).toBe("Unique title");
    });

    it("falls back to the first database when no database is explicitly marked as master", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "first-db",
            isMaster: false,
            importedAt: new Date(),
            name: "First",
            db: dbService,
        });

        dbStore.addDatabase({
            id: "second-db",
            isMaster: false,
            importedAt: new Date(),
            name: "Second",
            db: dbService,
        });

        notesStore.notes.push(
            {
                db_id: "first-db",
                notes: [[1, "first-guid", null, null, "Shared title", "Body", "", "", 0, null] as any],
            },
            {
                db_id: "second-db",
                notes: [[2, "second-guid", null, null, "Unique title", "Body", "", "", 0, null] as any],
            }
        );

        expect(notesStore.conflictingNoteStates).toHaveLength(1);
        expect(notesStore.conflictingNoteStates[0]?.db_id).toBe("second-db");
        expect(notesStore.conflictingNoteStates[0]?.notes[0]?.note[4]).toBe("Unique title");
    });

    it("derives conflicting notes from persisted note data even before the database store is fully restored", async () => {
        const notesStore = useNotesStore();

        notesStore.notes = [
            {
                db_id: "master-db",
                notes: [[1, "master-guid", null, null, "Shared title", "Body", "", "", 0, null] as any],
            },
            {
                db_id: "secondary-db",
                notes: [
                    [2, "secondary-guid-1", null, null, "Shared title", "Body", "", "", 0, null] as any,
                    [3, "secondary-guid-2", null, null, "Unique title", "Body", "", "", 0, null] as any,
                ],
            }
        ] as any;

        expect(notesStore.conflictingNoteStates).toHaveLength(1);
        expect(notesStore.conflictingNoteStates[0]?.db_id).toBe("secondary-db");
        expect(notesStore.conflictingNoteStates[0]?.notes[0]?.note[4]).toBe("Unique title");
    });

    it("rehydrates conflicting notes correctly after a fresh reload", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        const master = {
            id: "master-db",
            isMaster: true,
            importedAt: new Date(),
            name: "Master",
            db: dbService,
        };

        dbStore.addDatabase(master);
        dbStore.addDatabase({
            id: "secondary-db",
            isMaster: false,
            importedAt: new Date(),
            name: "Secondary",
            db: dbService,
        });

        notesStore.notes.push(
            {
                db_id: "master-db",
                notes: [[1, "master-guid", null, null, "Shared title", "Body", "", "", 0, null] as any],
            },
            {
                db_id: "secondary-db",
                notes: [
                    [2, "secondary-guid-1", null, null, "Shared title", "Body", "", "", 0, null] as any,
                    [3, "secondary-guid-2", null, null, "Unique title", "Body", "", "", 0, null] as any,
                ],
            }
        );

        await notesStore.persist();
        await dbStore.persist();

        setActivePinia(createPinia());

        const rehydratedDbStore = useDatabaseStore();
        const rehydratedNotesStore = useNotesStore();

        await rehydratedDbStore.hydrate();
        await rehydratedNotesStore.hydrate();

        expect(rehydratedNotesStore.conflictingNoteStates).toHaveLength(1);
        expect(rehydratedNotesStore.conflictingNoteStates[0]?.db_id).toBe("secondary-db");
        expect(rehydratedNotesStore.conflictingNoteStates[0]?.notes[0]?.note[4]).toBe("Unique title");
    });

    it("rehydrates persisted tag maps onto notes after reload", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();
        const tagsStore = useTagsStore();
        const userMarksStore = useUserMarksStore();
        const locationsStore = useLocationsStore();
        const { rehydratePersistedImports } = useImportBackup();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "db-3",
            isMaster: true,
            importedAt: new Date(),
            name: "Backup 3",
            db: dbService,
        });

        notesStore.notes.push({
            db_id: "db-3",
            notes: [[1, "guid-1", null, null, "Title", "Body", "", "", 0, null] as any],
        });

        tagsStore.tags.push({ db_id: "db-3", tags: [] as any });
        tagsStore.tagMaps.push({
            db_id: "db-3",
            tagMaps: [[1, null, null, 1, 10, 0] as any],
        });
        userMarksStore.markers.push({ db_id: "db-3", userMarks: [] as any });
        locationsStore.locations.push({ db_id: "db-3", locations: [] as any });

        await notesStore.persist();
        await tagsStore.persist();
        await userMarksStore.persist();
        await locationsStore.persist();

        await rehydratePersistedImports();

        expect(notesStore.notes[0]?.notesWithTagMaps).toHaveLength(1);
        expect(notesStore.notes[0]?.notesWithTagMaps?.[0]?.tagMaps).toHaveLength(1);
    });

    it("removes the database and its parsed data when deleted", async () => {
        const dbStore = useDatabaseStore();
        const notesStore = useNotesStore();
        const tagsStore = useTagsStore();
        const userMarksStore = useUserMarksStore();
        const locationsStore = useLocationsStore();

        const dbService = new DatabaseService();
        dbService.manifest = {} as any;

        dbStore.addDatabase({
            id: "db-1",
            isMaster: true,
            importedAt: new Date(),
            name: "Backup 1",
            db: dbService,
        });

        notesStore.notes.push({ db_id: "db-1", notes: [] as any });
        tagsStore.tags.push({ db_id: "db-1", tags: [] as any });
        tagsStore.tagMaps.push({ db_id: "db-1", tagMaps: [] as any });
        userMarksStore.markers.push({ db_id: "db-1", userMarks: [] as any });
        locationsStore.locations.push({ db_id: "db-1", locations: [] as any });

        await notesStore.persist();
        await tagsStore.persist();
        await userMarksStore.persist();
        await locationsStore.persist();

        await dbStore.removeDatabase("db-1");

        expect(dbStore.databases).toHaveLength(0);
        expect(notesStore.notes).toHaveLength(0);
        expect(tagsStore.tags).toHaveLength(0);
        expect(tagsStore.tagMaps).toHaveLength(0);
        expect(userMarksStore.markers).toHaveLength(0);
        expect(locationsStore.locations).toHaveLength(0);
    });
});
