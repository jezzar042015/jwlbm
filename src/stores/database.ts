import { defineStore } from "pinia";
import { ref } from "vue";
import { DatabaseService } from "@/services/DatabaseService";

export const useDatabaseStore = defineStore("database", () => {
    const database = ref<DatabaseService>();

    function setDatabase(db: DatabaseService) {
        database.value = db;
    }

    return {
        database,
        setDatabase,
    };
});