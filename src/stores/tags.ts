import type { Tag } from "@/database/types/tag";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTagsStore = defineStore("tags", () => {
    interface TagsState {
        db_id: string;
        tags: Tag[];
    }

    const tags = ref<TagsState[]>([])

    return {
        tags
    }
})