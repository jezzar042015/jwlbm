import { defineStore } from "pinia";
import { ref } from "vue";
import type { Location } from "@/database/types/location";

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