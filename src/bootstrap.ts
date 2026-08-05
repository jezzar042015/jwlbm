import { ref } from 'vue';
import { useDatabaseStore } from './stores/database';
import { useNotesStore } from './stores/notes';
import { useTagsStore } from './stores/tags';
import { useUserMarksStore } from './stores/userMarks';
import { useLocationsStore } from './stores/locations';
import { useImportBackup } from './composables/useImportBackup';

export const isHydrating = ref(true);

let hydrationPromise: Promise<void> | null = null;

export const runHydration = async () => {
    if (hydrationPromise) {
        return hydrationPromise;
    }

    hydrationPromise = (async () => {
        try {
            useDatabaseStore().hydrate();
            useNotesStore().hydrate();
            useTagsStore().hydrate();
            useUserMarksStore().hydrate();
            useLocationsStore().hydrate();

            const { rehydratePersistedImports } = useImportBackup();
            await rehydratePersistedImports();
        } catch {
            // Ignore hydration failures and keep the app bootable.
        } finally {
            isHydrating.value = false;
        }
    })();

    return hydrationPromise;
};