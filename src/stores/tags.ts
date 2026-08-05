import type { Tag } from "@/database/types/tag";
import type { TagMap } from "@/database/types/tagMap";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useDatabaseStore } from "./database";
import { getCachedPersistedState, readPersistedState, writePersistedState } from "./persistence";

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

    async function hydrate() {
        const cachedTags = getCachedPersistedState<TagsState[]>("tags");
        if (cachedTags !== undefined) {
            tags.value = cachedTags;
        } else {
            const persistedTags = await readPersistedState<TagsState[]>("tags");
            if (persistedTags !== null) {
                tags.value = persistedTags;
            }
        }

        const cachedTagMaps = getCachedPersistedState<TagMapsState[]>("tagMaps");
        if (cachedTagMaps !== undefined) {
            tagMaps.value = cachedTagMaps;
        } else {
            const persistedTagMaps = await readPersistedState<TagMapsState[]>("tagMaps");
            if (persistedTagMaps !== null) {
                tagMaps.value = persistedTagMaps;
            }
        }
    }

    void hydrate();

    watch(() => tags.value, () => { void persist(); }, { deep: true });
    watch(() => tagMaps.value, () => { void persist(); }, { deep: true });

    const persist = async () => {
        await writePersistedState("tags", tags.value);
        await writePersistedState("tagMaps", tagMaps.value);
    };

    const activeDatabaseId = computed(() => {
        return dbStore.activeDatabaseId ?? dbStore.databases[0]?.id;
    });

    const activeDatabaseTags = computed(() => {
        return tags.value.find(n => n.db_id === activeDatabaseId.value)?.tags || [];
    })

    return {
        tags,
        tagMaps,
        activeDatabaseTags,
        persist,
        hydrate,
    }
})