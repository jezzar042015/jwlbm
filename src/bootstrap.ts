import { ref } from 'vue';
import { useDatabaseStore } from './stores/database';
import { useNotesStore } from './stores/notes';
import { useTagsStore } from './stores/tags';
import { useUserMarksStore } from './stores/userMarks';
import { useLocationsStore } from './stores/locations';
import { useImportBackup } from './composables/useImportBackup';

export const isHydrating = ref(true);
export const hydrationMessage = ref('Preparing application...');
export const hydrationProgress = ref<number | null>(null);

let hydrationPromise: Promise<void> | null = null;

const HYDRATION_PROGRESS_SHARE = 70;

const waitForNextPaint = async () => {
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
};

const setHydrationState = (message: string, progress: number | null) => {
    hydrationMessage.value = message;
    hydrationProgress.value = progress;
};

export const runHydration = async () => {
    if (hydrationPromise) {
        return hydrationPromise;
    }

    hydrationPromise = (async () => {
        try {
            setHydrationState('Preparing persisted state...', 0);
            await waitForNextPaint();

            const hydrationTasks = [
                { label: 'Restoring databases...', hydrate: () => useDatabaseStore().hydrate() },
                { label: 'Restoring notes...', hydrate: () => useNotesStore().hydrate() },
                { label: 'Restoring tags...', hydrate: () => useTagsStore().hydrate() },
                { label: 'Restoring user marks...', hydrate: () => useUserMarksStore().hydrate() },
                { label: 'Restoring locations...', hydrate: () => useLocationsStore().hydrate() },
            ];

            for (const [index, task] of hydrationTasks.entries()) {
                const progress = Math.round((index / hydrationTasks.length) * HYDRATION_PROGRESS_SHARE);
                setHydrationState(task.label, progress);
                await task.hydrate();
            }

            setHydrationState('Rebuilding imported note relationships...', HYDRATION_PROGRESS_SHARE);

            const { rehydratePersistedImports } = useImportBackup();
            await rehydratePersistedImports((progress, message) => {
                const normalizedProgress = HYDRATION_PROGRESS_SHARE + Math.round(progress * (100 - HYDRATION_PROGRESS_SHARE));
                setHydrationState(message ?? 'Rebuilding imported note relationships...', normalizedProgress);
            });

            setHydrationState('Hydration complete.', 100);
        } catch {
            // Ignore hydration failures and keep the app bootable.
        } finally {
            isHydrating.value = false;
        }
    })();

    return hydrationPromise;
};