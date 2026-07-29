import type { UserMark } from "@/database/types/marker";
import { defineStore } from "pinia";
import { useDatabaseStore } from "./database";
import { computed, ref } from "vue";

export const useUserMarksStore = defineStore("userMarks", () => {
    interface UserMarksState {
        db_id: string;
        userMarks: UserMark[];
    }

    const dbStore = useDatabaseStore();

    const markers = ref<UserMarksState[]>([])

    const activeDatabaseUserMarks = computed(() => {
        const activeDbId = dbStore.activeDatabaseId;
        return markers.value.find(n => n.db_id === activeDbId)?.userMarks || [];
    })

    return {
        markers,
        activeDatabaseUserMarks
    }
})