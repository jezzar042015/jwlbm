import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DatabaseService } from "@/services/DatabaseService";
import { getCachedPersistedState, readPersistedState, writePersistedState } from "./persistence";

export interface DatabaseInstance {
    id: string;
    isMaster: boolean;
    importedAt: Date;
    name: string;
    db: DatabaseService;
}

interface PersistedDatabaseEntry {
    id: string;
    isMaster: boolean;
    importedAt: string;
    name: string;
    manifest?: unknown;
}

function hydrateDatabase(entry: PersistedDatabaseEntry): DatabaseInstance {
    const databaseService = new DatabaseService();
    databaseService.manifest = entry.manifest as any;

    return {
        id: entry.id,
        isMaster: entry.isMaster,
        importedAt: new Date(entry.importedAt),
        name: entry.name,
        db: databaseService,
    };
}

export const useDatabaseStore = defineStore("database", () => {
    const databases = ref<DatabaseInstance[]>([]);
    const activeDatabaseId = ref<string | undefined>(undefined);

    async function hydrate() {
        const cachedDatabases = getCachedPersistedState<PersistedDatabaseEntry[]>("database");
        if (cachedDatabases !== undefined) {
            databases.value = cachedDatabases.map(hydrateDatabase);
        } else {
            const persistedDatabases = await readPersistedState<PersistedDatabaseEntry[]>("database");
            if (persistedDatabases !== null) {
                databases.value = persistedDatabases.map(hydrateDatabase);
            }
        }

        const cachedActive = getCachedPersistedState<{ activeDatabaseId?: string }>("database:active");
        if (cachedActive !== undefined) {
            if (cachedActive?.activeDatabaseId) {
                activeDatabaseId.value = cachedActive.activeDatabaseId;
            }
        } else {
            const persistedActive = await readPersistedState<{ activeDatabaseId?: string }>("database:active");
            if (persistedActive?.activeDatabaseId) {
                activeDatabaseId.value = persistedActive.activeDatabaseId;
            }
        }
    }

    void hydrate();

    watch(() => databases.value, () => { void persist(); }, { deep: true });
    watch(activeDatabaseId, () => { void persist(); });

    const activeDatabase = computed(() =>
        databases.value.find(d => d.id === activeDatabaseId.value)
    );

    const masterDatabase = computed(() =>
        databases.value.find(d => d.isMaster)
    );

    async function persist() {
        const payload = databases.value.map((database) => ({
            id: database.id,
            isMaster: database.isMaster,
            importedAt: database.importedAt.toISOString(),
            name: database.name,
            manifest: database.db?.manifest,
        } satisfies PersistedDatabaseEntry));

        await writePersistedState("database", payload);
        await writePersistedState("database:active", { activeDatabaseId: activeDatabaseId.value });
    }

    function addDatabase(database: DatabaseInstance) {
        databases.value.push(database);

        // First imported database automatically becomes active/master
        if (databases.value.length === 1) {
            database.isMaster = true;
            activeDatabaseId.value = database.id;
        }

        void persist();
    }

    async function removeDatabase(id: string) {
        databases.value = databases.value.filter(d => d.id !== id);

        if (activeDatabaseId.value === id) {
            activeDatabaseId.value = databases.value[0]?.id ?? undefined;
        }

        const { useNotesStore } = await import("./notes");
        const notesStore = useNotesStore();
        notesStore.notes = notesStore.notes.filter((state) => state.db_id !== id);

        const { useTagsStore } = await import("./tags");
        const tagsStore = useTagsStore();
        tagsStore.tags = tagsStore.tags.filter((state) => state.db_id !== id);
        tagsStore.tagMaps = tagsStore.tagMaps.filter((state) => state.db_id !== id);

        const { useUserMarksStore } = await import("./userMarks");
        const userMarksStore = useUserMarksStore();
        userMarksStore.markers = userMarksStore.markers.filter((state) => state.db_id !== id);

        const { useLocationsStore } = await import("./locations");
        const locationsStore = useLocationsStore();
        locationsStore.locations = locationsStore.locations.filter((state) => state.db_id !== id);

        void persist();
    }

    function setActiveDatabase(id: string) {
        activeDatabaseId.value = id;
        void persist();
    }

    function setMasterDatabase(id: string) {
        databases.value.forEach(d => {
            d.isMaster = d.id === id;
        });
        void persist();
    }

    return {
        databases,
        activeDatabaseId,
        activeDatabase,
        masterDatabase,
        addDatabase,
        removeDatabase,
        setActiveDatabase,
        setMasterDatabase,
        persist,
        hydrate,
    };
});