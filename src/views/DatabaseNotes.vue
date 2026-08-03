<template>
    <div class="relative p-0 bg-gray-50 h-screen overflow-hidden">
        <div v-if="notesStore.activeDatabaseNotes.length === 0" class="text-gray-500 text-center mt-10">
            <p class="mx-4 mb-8 text-center">No database or notes available for this database.</p>

            <button @click="gotoImport" class="bg-violet-900 text-white px-8 py-3 rounded-full shadow cursor-pointer">
                Add Backup File
            </button>
        </div>

        <div v-else class="flex justify-end flex-col h-screen overflow-hidden">
            <div class="flex px-2 py-2 md:px-4 shadow-md">
                <div class="w-1/2 md:w-80">
                    <label for="note-search" class="sr-only">Search notes</label>
                    <input id="note-search" v-model="searchTerm" type="search" placeholder="Search notes"
                        class="w-full rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:border-violet-500 focus:outline-none" />
                </div>

                <div class="hidden md:flex items-start flex-wrap ml-4 ">
                    <button v-for="tag in filterTagLabels" :key="tag.id" type="button"
                        class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mt-2 shadow-xs cursor-pointer"
                        @click="handleTagFilterChange(tag.id)">
                        {{ tag.label }}
                    </button>

                    <button v-if="filterTagLabels.length === 0"
                        class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mt-2 shadow-xs cursor-pointer"
                        @click="modal = 'tag-selector'">
                        Select Tags
                    </button>
                </div>

                <div
                    class="flex md:hidden *:flex-wrap ml-4 shadow-xs py-1 px-4 rounded-full text-xs items-center  bg-violet-800 text-white">
                    <div v-if="filterTagLabels.length > 0" class="flex flex-1 cursor-pointer">
                        {{ filterTagLabels.length }} Tag{{ filterTagLabels.length > 1 ? 's' : '' }}
                    </div>
                    <div v-else class="flex flex-1 cursor-pointer items-center" @click="modal = 'tag-selector'">
                        Select Tags
                    </div>
                </div>
            </div>

            <div v-if="filteredNotes.length === 0" class="flex-1 text-center text-gray-500 py-8">
                No notes match your search.
            </div>

            <div v-else class="flex-1 flex flex-col overflow-hidden">
                <div class="overflow-y-auto flex-1">
                    <template v-for="item in filteredNotes" :key="item.note[0]">
                        <NoteListItem :item="item" @handle-tag-filter-change="handleTagFilterChange" :filter-tags />
                    </template>
                </div>
                <div class="pl-4 py-1 text-xs text-gray-500">{{ filteredNotes.length }} notes</div>
            </div>
        </div>

        <NoteTagSelector :filterTags v-if="modal == 'tag-selector'" @handle-tag-filter-change="handleTagFilterChange"
            @close-me="modal = ''" />
    </div>
</template>

<script setup lang="ts">
    import NoteListItem from '@/components/notes/NoteListItem.vue';
    import NoteTagSelector from '@/components/notes/NoteTagSelector.vue';
    import router from '@/router';
    import { useNotesStore } from '@/stores/notes';
    import { useTagsStore } from '@/stores/tags';
    import { computed, ref, watch } from 'vue';

    const notesStore = useNotesStore();
    const tagsStore = useTagsStore();
    const modal = ref<'' | 'tag-selector'>('')

    const searchTerm = ref('');
    const debouncedSearchTerm = ref('');
    const filterTags = ref<number[]>([]);

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const handleTagFilterChange = (selectedTagId: number) => {
        if (filterTags.value.includes(selectedTagId)) {
            filterTags.value = filterTags.value.filter(id => id !== selectedTagId);
        } else {
            filterTags.value.push(selectedTagId);
        }
    };

    watch(searchTerm, (value) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            debouncedSearchTerm.value = value.trim().toLowerCase();
        }, 300);
    });

    const filterTagLabels = computed(() => {
        return filterTags.value.map((tagId) => ({
            id: tagId,
            label: tagsStore.activeDatabaseTags.find((tag) => tag[0] === tagId)?.[2] ?? String(tagId),
        }));
    });

    const filteredNotes = computed(() => {
        const keyword = debouncedSearchTerm.value;
        const selectedTagIds = Array.isArray(filterTags.value) ? filterTags.value : [];
        const notes = Array.isArray(notesStore.activeDatabaseNotes) ? notesStore.activeDatabaseNotes : [];

        return notes.filter((item) => {
            const title = typeof item?.note?.[4] === 'string' ? item.note[4] : '';
            const content = typeof item?.note?.[5] === 'string' ? item.note[5] : '';
            const searchableText = `${title} ${content}`.toLowerCase();
            const matchesKeyword = !keyword || searchableText.includes(keyword);

            const tagMaps = Array.isArray(item?.tagMaps) ? item.tagMaps : [];
            const matchesTags = selectedTagIds.length === 0 || selectedTagIds.every((selectedTagId) => {
                return tagMaps.some((tagMap) => tagMap?.[4] === selectedTagId);
            });

            return matchesKeyword && matchesTags;
        });
    });

    const gotoImport = () => {
        router.push({ name: 'import' });
    }
</script>