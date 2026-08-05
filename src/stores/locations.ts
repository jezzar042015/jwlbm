import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Location } from "@/database/types/location";
import { getCachedPersistedState, readPersistedState, writePersistedState } from "./persistence";

export const useLocationsStore = defineStore("locations", () => {
    interface LocationsState {
        db_id: string;
        locations: Location[];
    }

    const locations = ref<LocationsState[]>([]);

    async function hydrate() {
        const cachedLocations = getCachedPersistedState<LocationsState[]>("locations");
        if (cachedLocations !== undefined) {
            locations.value = cachedLocations;
        } else {
            const persistedLocations = await readPersistedState<LocationsState[]>("locations");
            if (persistedLocations !== null) {
                locations.value = persistedLocations;
            }
        }
    }

    void hydrate();

    watch(() => locations.value, () => { void persist(); }, { deep: true });

    const persist = async () => {
        await writePersistedState("locations", locations.value);
    };

    return {
        locations,
        persist,
        hydrate,
    }
})