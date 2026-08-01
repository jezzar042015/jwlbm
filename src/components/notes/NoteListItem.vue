<template>
    <div class="p-4 m-2 shadow rounded cursor-pointer" :class="bg">
        <p v-if="item.note[6]" class="text-xs text-gray-500 mb-2">
            {{ formatRelativeTime(item.note[6]) }}
        </p>
        <h3 class="font-semibold text-gray-800">{{ item.note[4] }}</h3>
        <p class="text-gray-600" v-html="formatText(item.note[5])"></p>
        <div v-if="normalizedTagMaps.length > 0">
            <span v-for="tag in tags" :key="tag.id" @click="handleTagClick(tag.id)"
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
    import { useRelativeTime } from '@/composables/useRelativeTime';
    import { computed } from 'vue';

    const { item } = defineProps<{
        item: {
            note: Note,
            tagMaps: NoteTagMapRow[],
            marker?: UserMark
        }
    }>();

    const emit = defineEmits<{
        (e: 'handle-tag-filter-change', selectedTagId: number): void;
    }>();

    const handleTagClick = (tagId: number) => {
        emit('handle-tag-filter-change', tagId);
    };

    const tagStore = useTagsStore();
    const { formatRelativeTime } = useRelativeTime();

    function escapeHtml(unsafe: string) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatText(text: string | null | undefined) {
        if (!text) return '';
        // preserve existing HTML safety and convert newlines to <br>
        const escaped = escapeHtml(text);
        return escaped.replace(/\r\n|\r|\n/g, '<br>');
    }

    const normalizedTagMaps = computed(() => {
        return Array.isArray(item?.tagMaps) ? item.tagMaps : [];
    });

    const tags = computed(() => {
        return normalizedTagMaps.value
            .map((m) => ({
                id: m[4],
                label: tagStore.activeDatabaseTags.find(f => f[0] == m[4])?.[2] ?? '',
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
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