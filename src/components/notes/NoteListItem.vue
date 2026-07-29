<template>
    <div class="p-4 m-2 shadow rounded " :class="bg">
        <h3 class="font-semibold text-gray-800">{{ item.note[4] }}</h3>
        <p class="text-gray-600" v-html="formatText(item.note[5])"></p>
        <div v-if="item.tagMaps.length > 0">
            <span v-for="tag in tags" :key="tag.id"
                class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mt-2 shadow-xs">
                {{ tag.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { UserMark } from '@/database/types/marker';
    import type { Note } from '@/database/types/note';
    import type { NoteTagMapRow } from '@/database/types/tagMap';
    import { useTagsStore } from '@/stores/tags';
    import { computed } from 'vue';

    const { item } = defineProps<{
        item: {
            note: Note,
            tagMaps: NoteTagMapRow[],
            marker?: UserMark
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

    const bg = computed(() => {
        if (item.marker?.[1] === 0) {
            return 'bg-white';
        } else if (item.marker?.[1] === 1) {
            return 'bg-yellow-50';
        } else if (item.marker?.[1] === 2) {
            return 'bg-green-50';
        } else if (item.marker?.[1] === 3) {
            return 'bg-blue-100';
        } else if (item.marker?.[1] === 4) {
            return 'bg-red-100';
        } else if (item.marker?.[1] === 5) {
            return 'bg-orange-100';
        } else if (item.marker?.[1] === 6) {
            return 'bg-purple-100';
        } else {
            return '';
        }
    });
</script>