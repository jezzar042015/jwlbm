import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { DatabaseService } from "@/services/DatabaseService";

export interface DatabaseInstance {
    id: string;
    name: string;
    version?: string;
    isMaster: boolean;
    db: DatabaseService;
    importedAt: Date;
}

export const useDatabaseStore = defineStore("database", () => {
    const databases = ref<DatabaseInstance[]>([]);
    const activeDatabaseId = ref<string>();

    const activeDatabase = computed(() =>
        databases.value.find(d => d.id === activeDatabaseId.value)
    );

    const masterDatabase = computed(() =>
        databases.value.find(d => d.isMaster)
    );

    function addDatabase(database: DatabaseInstance) {
        databases.value.push(database);

        // First imported database automatically becomes active/master
        if (databases.value.length === 1) {
            database.isMaster = true;
            activeDatabaseId.value = database.id;
        }
    }

    function removeDatabase(id: string) {
        databases.value = databases.value.filter(d => d.id !== id);

        if (activeDatabaseId.value === id) {
            activeDatabaseId.value = databases.value[0]?.id;
        }
    }

    function setActiveDatabase(id: string) {
        activeDatabaseId.value = id;
    }

    function setMasterDatabase(id: string) {
        databases.value.forEach(d => {
            d.isMaster = d.id === id;
        });
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
    };
});