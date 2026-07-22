import { ref } from "vue";
import { ImportService } from "@/services/ImportService";
import { useDatabaseStore } from "@/stores/database";

export function useImportBackup() {
    const loading = ref(false);

    const store = useDatabaseStore();

    async function importBackup(file: File) {
        loading.value = true;

        const db = await ImportService.importBackup(file);

        store.setDatabase(db);

        loading.value = false;
    }

    return {
        loading,
        importBackup,
    };
}