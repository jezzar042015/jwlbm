import type { UserMark } from "@/database/types/marker";
import { defineStore } from "pinia";
import { useDatabaseStore } from "./database";
import { getCachedPersistedState, readPersistedState, writePersistedState } from "./persistence";
import { computed, ref, watch } from "vue";

export const useUserMarksStore = defineStore("userMarks", () => {
    interface UserMarksState {
        db_id: string;
        userMarks: UserMark[];
    }

    const dbStore = useDatabaseStore();

    const markers = ref<UserMarksState[]>([])

    async function hydrate() {
        const cachedMarkers = getCachedPersistedState<UserMarksState[]>("userMarks");
        if (cachedMarkers !== undefined) {
            markers.value = cachedMarkers;
        } else {
            const persistedMarkers = await readPersistedState<UserMarksState[]>("userMarks");
            if (persistedMarkers !== null) {
                markers.value = persistedMarkers;
            }
        }
    }

    void hydrate();

    watch(() => markers.value, () => { void persist(); }, { deep: true });

    const persist = async () => {
        await writePersistedState("userMarks", markers.value);
    };

    const activeDatabaseId = computed(() => {
        return dbStore.activeDatabaseId ?? dbStore.databases[0]?.id;
    });

    const activeDatabaseUserMarks = computed(() => {
        return markers.value.find(n => n.db_id === activeDatabaseId.value)?.userMarks || [];
    })

    return {
        markers,
        activeDatabaseUserMarks,
        persist,
        hydrate,
    }
})