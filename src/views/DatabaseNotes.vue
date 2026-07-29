<template>
    <div class="p-2 md:p-6 bg-gray-50 min-h-screen">
        <div v-if="notesStore.activeDatabaseNotes.length === 0" class="text-gray-500 text-center mt-10">
            <p class="mb-8">No database or notes available for this database.</p>

            <button @click="gotoImport" class="bg-violet-900 text-white px-8 py-3 rounded-full shadow cursor-pointer">
                Add Database
            </button>
        </div>
        <template v-else v-for="item in notesStore.activeDatabaseNotes" :key="item.note[0]">
            <NoteListItem :item="item" />
        </template>

    </div>
</template>

<script setup lang="ts">
    import NoteListItem from '@/components/notes/NoteListItem.vue';
    import router from '@/router';
    import { useNotesStore } from '@/stores/notes';

    const notesStore = useNotesStore();

    function escapeHtml(unsafe: string) {
        return unsafe
            .replaceAll("&", '&amp;')
            .replaceAll("<", '&lt;')
            .replaceAll(">", '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatText(text: string | null | undefined) {
        if (!text) return '';
        // preserve existing HTML safety and convert newlines to <br>
        const escaped = escapeHtml(text);
        return escaped.replace(/\r\n|\r|\n/g, '<br>');
    }

    const gotoImport = () => {
        router.push({ name: 'import' });
    }
</script>