<template>
    <div @click.self="emit('close-me')"
        class="absolute h-full w-full bg-black/45 overflow-hidden right-0 top-0 p-1 md:p-5 ">
        <div @click.stop class="flex flex-col m-auto bg-white h-full md:rounded-md max-w-160 overflow-hidden p-4 pr-0">
            <div class="py-2 pr-4 relative">
                <div class="uppercase text-xs pb-2 border-b border-gray-300 text-gray-500 font-semibold">
                    Select Tags
                </div>
                <div class="flex md:hidden">
                    <CloseIcon @click="emit('close-me')"
                        class="w-6 h-6 cursor-pointer absolute right-2 top-0 text-gray-500 hover:text-gray-800" />
                </div>
            </div>
            <div class="flex-1 overflow-y-auto space-y-1 flex flex-wrap gap-1">
                <div v-for="tag in tags.activeDatabaseTags" :key="tag[0]"
                    class="bg-gray-100 shadow-sm py-1 px-3 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-between text-xs"
                    :class="{ 'bg-violet-900 text-white hover:bg-violet-950': filterTags.includes(tag[0]) }"
                    @click="handleTagFilterChange(tag[0])">
                    {{ tag[2] }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useTagsStore } from '@/stores/tags';
    import CloseIcon from '../icons/CloseIcon.vue';

    const tags = useTagsStore();
    const { filterTags } = defineProps<{
        filterTags: number[];
    }>();

    const emit = defineEmits<{
        (e: 'handle-tag-filter-change', tagId: number): void;
        (e: 'close-me'): void;
    }>();

    function handleTagFilterChange(tagId: number) {
        emit('handle-tag-filter-change', tagId);
    }

</script>