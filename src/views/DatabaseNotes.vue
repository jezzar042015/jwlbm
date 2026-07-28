<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <div v-for="note in notesStore.activeDatabaseNotes" :key="note[0]" class="p-4 m-2 bg-white shadow rounded ">
            <h3 class="font-semibold text-gray-800">{{ note[4] }}</h3>
            <p class="text-gray-600" v-html="formatText(note[5])"></p>
        </div>
    </div>
</template>

<script setup lang="ts">
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
</script>