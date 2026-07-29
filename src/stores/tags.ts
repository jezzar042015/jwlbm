import type { Tag } from "@/database/types/tag";
import type { TagMap } from "@/database/types/tagMap";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useDatabaseStore } from "./database";

export const useTagsStore = defineStore("tags", () => {
    interface TagsState {
        db_id: string;
        tags: Tag[];
    }
    interface TagMapsState {
        db_id: string;
        tagMaps: TagMap[];
    }

    const tags = ref<TagsState[]>([])
    const tagMaps = ref<TagMapsState[]>([])
    const dbStore = useDatabaseStore();

    const activeDatabaseTags = computed(() => {
        const activeDbId = dbStore.activeDatabaseId;
        return tags.value.find(n => n.db_id === activeDbId)?.tags || [];
    })

    return {
        tags,
        tagMaps,
        activeDatabaseTags
    }
})