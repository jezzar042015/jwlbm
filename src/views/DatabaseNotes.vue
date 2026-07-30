<template>
    <div class="p-0 bg-gray-50 min-h-screen">
        <div v-if="notesStore.activeDatabaseNotes.length === 0" class="text-gray-500 text-center mt-10">
            <p class="mb-8">No database or notes available for this database.</p>

            <button @click="gotoImport" class="bg-violet-900 text-white px-8 py-3 rounded-full shadow cursor-pointer">
                Add Backup File
            </button>
        </div>

        <div v-else class="space-y-4">
            <div class="flex justify-end px-2 md:p-6">
                <label for="note-search" class="sr-only">Search notes</label>
                <input id="note-search" v-model="searchTerm" type="search" placeholder="Search notes"
                    class="w-full md:w-80 rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:border-violet-500 focus:outline-none" />
            </div>

            <div v-if="filteredNotes.length === 0" class="text-center text-gray-500 py-8">
                No notes match your search.
            </div>

            <template v-else v-for="item in filteredNotes" :key="item.note[0]">
                <NoteListItem :item="item" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import NoteListItem from '@/components/notes/NoteListItem.vue';
    import router from '@/router';
    import { useNotesStore } from '@/stores/notes';
    import { computed, ref, watch } from 'vue';

    const notesStore = useNotesStore();
    const searchTerm = ref('');
    const debouncedSearchTerm = ref('');

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    watch(searchTerm, (value) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            debouncedSearchTerm.value = value.trim().toLowerCase();
        }, 300);
    });

    const filteredNotes = computed(() => {
        const keyword = debouncedSearchTerm.value;
        if (!keyword) {
            return notesStore.activeDatabaseNotes;
        }

        return notesStore.activeDatabaseNotes.filter((item) => {
            const title = item.note[4] ?? '';
            const content = item.note[5] ?? '';
            const searchableText = `${title} ${content}`.toLowerCase();
            return searchableText.includes(keyword);
        });
    });

    const gotoImport = () => {
        router.push({ name: 'import' });
    }
</script>