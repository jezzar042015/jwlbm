import { defineStore } from "pinia";
import { ref } from "vue";

export const useLocationsStore = defineStore("locations", () => {
    interface LocationsState {
        db_id: string;
        locations: Location[];
    }

    const locations = ref<LocationsState[]>([]);

    return {
        locations,
    }
})