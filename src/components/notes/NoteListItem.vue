<template>
    <div class="p-4 m-2 bg-white shadow rounded ">
        <h3 class="font-semibold text-gray-800">{{ item.note[4] }}</h3>
        <p class="text-gray-600" v-html="formatText(item.note[5])"></p>
        <div v-if="item.tagMaps.length > 0">
            <span v-for="tag in tags" :key="tag.id"
                class="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mt-2">
                {{ tag.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { Note } from '@/database/types/note';
    import type { NoteTagMapRow } from '@/database/types/tagMap';
    import { useTagsStore } from '@/stores/tags';
    import { computed } from 'vue';

    const { item } = defineProps<{
        item: {
            note: Note,
            tagMaps: NoteTagMapRow[]
        }
    }>();

    const tagStore = useTagsStore();

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

    const tags = computed(() => {
        return item.tagMaps.map(m => ({
            id: m[4],
            label: tagStore.activeDatabaseTags.find(f => f[0] == m[4])?.[2] ?? '',
        }));
    }); 
</script>