<template>
    <div class="relative p-0 bg-gray-50 h-screen overflow-hidden">
        <div v-if="notesStore.activeDatabaseNotes.length === 0" class="text-gray-500 text-center mt-10">
            <p class="mx-4 mb-8 text-center">No database or notes available for this database.</p>

            <button type="button" @click="gotoImport"
                class="bg-violet-900 text-white px-8 py-3 rounded-full shadow cursor-pointer">
                Add Backup File
            </button>
        </div>

        <div v-else class="flex justify-end flex-col h-screen overflow-hidden">
            <div class="flex px-2 py-2 md:px-12 shadow-md">
                <div class="mr-2 flex items-center" @click="gotoLibraries">
                    <HomeIcon class="w-6 h-6 text-gray-500" />
                </div>
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

                    <button type="button" v-if="filterTagLabels.length === 0 && isActiveMasterDatabase"
                        class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mt-2 shadow-xs cursor-pointer"
                        @click="modal = 'tag-selector'">
                        Select Tags
                    </button>
                </div>

                <div v-if="isActiveMasterDatabase"
                    class="flex md:hidden *:flex-wrap ml-4 shadow-xs py-1 px-4 rounded-full text-xs items-center  bg-violet-800 text-white">
                    <div v-if="filterTagLabels.length > 0" class="flex flex-1 cursor-pointer"
                        @click="modal = 'tag-selector'">
                        {{ filterTagLabels.length }} Tag{{ filterTagLabels.length > 1 ? 's' : '' }}
                    </div>
                    <div v-else class="flex flex-1 cursor-pointer items-center" @click="modal = 'tag-selector'">
                        Select Tags
                    </div>
                </div>

                <div v-if="!isActiveMasterDatabase" class="ml-auto flex items-center gap-2 pl-2">
                    <button v-if="batched && selectedConflictNoteIds.length > 0" type="button"
                        class="hidden md:inline-flex items-center rounded-full bg-violet-700 px-4 py-1.5 text-xs text-white cursor-pointer hover:bg-violet-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="isMigrating" @click="migrateBatch">
                        Migrate Batch
                    </button>
                    <label for="batch-selection-toggle" class="text-xs text-gray-600 whitespace-nowrap">Batch
                        Selection</label>
                    <button id="batch-selection-toggle" type="button" role="switch" :aria-checked="batched"
                        @click="toggleBatchSelection"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="isMigrating" :class="batched ? 'bg-violet-700' : 'bg-gray-300'">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                            :class="batched ? 'translate-x-6' : 'translate-x-1'" />
                    </button>
                </div>
            </div>

            <div v-if="filteredNotes.length === 0" class="flex-1 text-center text-gray-500 py-8">
                No notes match your search.
            </div>

            <div v-else class="flex-1 flex flex-col overflow-hidden">
                <div v-if="!isActiveMasterDatabase" class="uppercase pt-4 pb-2 text-sm px-4 md:px-12 text-gray-600">
                    <button v-if="batched && selectedConflictNoteIds.length > 0" type="button"
                        class="inline-flex md:hidden items-center rounded-full bg-violet-700 px-4 py-1.5 text-xs text-white cursor-pointer hover:bg-violet-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="isMigrating" @click="migrateBatch">
                        Migrate Batch
                    </button>
                    <div class="pt-3">
                        Missing
                        Notes in Master
                        Backup
                    </div>
                </div>
                <div v-bind="containerProps" class="overflow-y-auto flex-1 pt-4 px-0 md:px-10">
                    <div v-bind="wrapperProps" class="mb-10">
                        <div v-for="{ index, data } in virtualizedNotes" :key="data.note[0] ?? index"
                            :ref="(el) => setVirtualItemRef(el, data.note?.[0])">
                            <NoteListItem :item="data" :filter-tags :is-master="isActiveMasterDatabase" :batched
                                :selected-for-batch="selectedConflictNoteIds.includes(data.note[0])"
                                :is-migrating="isMigrating" @handle-tag-filter-change="handleTagFilterChange"
                                @toggle-note-batch-selection="toggleConflictNoteSelection"
                                @copy-note-to-master="copyConflictNoteToMaster" />
                        </div>
                    </div>
                </div>
                <div class="pl-4 py-1 text-xs text-gray-500">{{ filteredNotes.length }} notes</div>
            </div>
        </div>

        <NoteTagSelector :filterTags v-if="modal == 'tag-selector'" @handle-tag-filter-change="handleTagFilterChange"
            @close-me="modal = ''" />

        <div v-if="isMigrating" class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
            <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
                <div
                    class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-700">
                </div>
                <p class="text-sm text-gray-700">{{ migrationMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import HomeIcon from '@/components/icons/HomeIcon.vue';
    import NoteListItem from '@/components/notes/NoteListItem.vue';
    import NoteTagSelector from '@/components/notes/NoteTagSelector.vue';
    import router from '@/router';
    import type { ComponentPublicInstance } from 'vue';
    import type { Note, NoteWithTagMap } from '@/database/types/note';
    import { computed, onBeforeUnmount, ref, watch } from 'vue';
    import { useDatabaseStore } from '@/stores/database';
    import { useNotesStore } from '@/stores/notes';
    import { useTagsStore } from '@/stores/tags';
    import { useVirtualList } from '@vueuse/core';

    const notesStore = useNotesStore();
    const tagsStore = useTagsStore();
    const databaseStore = useDatabaseStore();
    const modal = ref<'' | 'tag-selector'>('')

    const searchTerm = ref('');
    const debouncedSearchTerm = ref('');
    const filterTags = ref<number[]>([]);
    const selectedConflictNoteIds = ref<number[]>([]);
    const batched = ref(false);
    const isMigrating = ref(false);
    const migrationMessage = ref('Migrating notes... Please wait.');
    const estimatedItemHeight = ref(320);
    const measuredHeightsByNoteId = ref<Record<number, number>>({});

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

    const isActiveMasterDatabase = computed(() => {
        return Boolean(databaseStore.activeDatabase?.isMaster);
    });

    const filteredNotes = computed(() => {
        const keyword = debouncedSearchTerm.value;
        const selectedTagIds = Array.isArray(filterTags.value) ? filterTags.value : [];
        const notes = databaseStore.activeDatabase?.isMaster
            ? notesStore.activeDatabaseNotes
            : notesStore.activeDatabaseConflictingNotes;

        const normalizedNotes = Array.isArray(notes) ? notes : [];

        return normalizedNotes.filter((item) => {
            const title = typeof item?.note?.[4] === 'string' ? item.note[4] : '';
            const content = typeof item?.note?.[5] === 'string' ? item.note[5] : '';
            const searchableText = `${title} ${content}`.toLowerCase();
            const matchesKeyword = !keyword || searchableText.includes(keyword);

            const tagMaps = Array.isArray(item?.tagMaps) ? item.tagMaps : [];
            const matchesTags = selectedTagIds.every((selectedTagId) => {
                return tagMaps.some((tagMap) => tagMap?.[4] === selectedTagId);
            });

            return matchesKeyword && matchesTags;
        });
    });

    let resizeObserver: ResizeObserver | undefined;
    const observedElementsByNoteId = new Map<number, Element>();

    const ensureResizeObserver = () => {
        if (resizeObserver || typeof ResizeObserver === 'undefined') {
            return;
        }

        resizeObserver = new ResizeObserver((entries) => {
            let hasChanges = false;
            const nextHeights = { ...measuredHeightsByNoteId.value };

            for (const entry of entries) {
                const noteIdAttr = (entry.target as HTMLElement).dataset.noteId;
                if (!noteIdAttr) {
                    continue;
                }

                const noteId = Number(noteIdAttr);
                const measuredHeight = Math.ceil(entry.contentRect.height);
                if (!Number.isFinite(noteId) || measuredHeight <= 0) {
                    continue;
                }

                if (nextHeights[noteId] !== measuredHeight) {
                    nextHeights[noteId] = measuredHeight;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                measuredHeightsByNoteId.value = nextHeights;
            }
        });
    };

    const setVirtualItemRef = (el: Element | ComponentPublicInstance | null, noteId: unknown) => {
        if (typeof noteId !== 'number') {
            return;
        }

        const domElement = el instanceof Element ? el : null;

        ensureResizeObserver();

        const previousElement = observedElementsByNoteId.get(noteId);
        if (previousElement && previousElement !== domElement) {
            resizeObserver?.unobserve(previousElement);
            observedElementsByNoteId.delete(noteId);
        }

        if (!domElement) {
            return;
        }

        (domElement as HTMLElement).dataset.noteId = String(noteId);
        observedElementsByNoteId.set(noteId, domElement);
        resizeObserver?.observe(domElement);
    };

    const { list: virtualizedNotes, containerProps, wrapperProps, scrollTo } = useVirtualList(filteredNotes, {
        itemHeight: (index) => {
            const noteId = filteredNotes.value[index]?.note?.[0];
            if (typeof noteId !== 'number') {
                return estimatedItemHeight.value;
            }

            return measuredHeightsByNoteId.value[noteId] ?? estimatedItemHeight.value;
        },
        overscan: 8,
    });

    watch(
        () => filteredNotes.value.length,
        (newLength, oldLength) => {
            if (typeof oldLength === 'number' && newLength < oldLength) {
                scrollTo(0);
            }
        }
    );

    watch(
        () => notesStore.activeDatabaseConflictingNotes.map((item) => item.note[0]),
        (noteIds) => {
            const currentNoteIds = new Set(noteIds);
            selectedConflictNoteIds.value = selectedConflictNoteIds.value.filter((id) => currentNoteIds.has(id));
        }
    );

    const toggleBatchSelection = () => {
        if (isActiveMasterDatabase.value || isMigrating.value) {
            return;
        }

        batched.value = !batched.value;
    };

    const toggleConflictNoteSelection = (noteId: number) => {
        if (isActiveMasterDatabase.value || isMigrating.value) {
            return;
        }

        if (selectedConflictNoteIds.value.includes(noteId)) {
            selectedConflictNoteIds.value = selectedConflictNoteIds.value.filter((id) => id !== noteId);
            return;
        }

        selectedConflictNoteIds.value = [...selectedConflictNoteIds.value, noteId];
    };

    const createMasterNoteFromConflict = (conflictNote: Note, masterNotes: Note[]): Note => {
        const currentMaxNoteId = masterNotes.reduce((maxId, note) => {
            return Math.max(maxId, note?.[0] ?? 0);
        }, 0);

        const generatedGuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `note-${Date.now()}-${currentMaxNoteId + 1}`;

        return [
            currentMaxNoteId + 1,
            generatedGuid,
            conflictNote[2] ?? null,
            conflictNote[3] ?? null,
            conflictNote[4] ?? null,
            conflictNote[5] ?? null,
            conflictNote[6] ?? '',
            conflictNote[7] ?? '',
            conflictNote[8],
            conflictNote[9] ?? null,
        ];
    };

    const ensureMasterNoteState = (masterDatabaseId: string) => {
        if (notesStore.notes.some((state) => state.db_id === masterDatabaseId)) {
            return;
        }

        notesStore.notes = [
            ...notesStore.notes,
            {
                db_id: masterDatabaseId,
                notes: [],
                notesWithTagMaps: [],
            },
        ];
    };

    const migrateConflictNotesByIds = (noteIds: number[]) => {
        if (isActiveMasterDatabase.value || noteIds.length === 0) {
            return;
        }

        const masterDatabaseId = databaseStore.masterDatabase?.id
            ?? databaseStore.databases[0]?.id
            ?? notesStore.notes[0]?.db_id;

        if (!masterDatabaseId) {
            return;
        }

        ensureMasterNoteState(masterDatabaseId);

        const selectedIdSet = new Set(noteIds);
        const notesToMigrate = notesStore.activeDatabaseConflictingNotes.filter((item) => {
            return selectedIdSet.has(item.note[0]);
        });

        if (notesToMigrate.length === 0) {
            return;
        }

        notesStore.notes = notesStore.notes.map((state) => {
            if (state.db_id !== masterDatabaseId) {
                return state;
            }

            const normalizedMasterNotes = Array.isArray(state.notes) ? [...state.notes] : [];
            const normalizedMasterNotesWithTagMaps = Array.isArray(state.notesWithTagMaps)
                ? [...state.notesWithTagMaps]
                : [];

            for (const noteWithTagMap of notesToMigrate) {
                const nextMasterNote = createMasterNoteFromConflict(noteWithTagMap.note, normalizedMasterNotes);
                normalizedMasterNotes.push(nextMasterNote);
                normalizedMasterNotesWithTagMaps.push({
                    note: nextMasterNote,
                    tagMaps: [],
                });
            }

            return {
                ...state,
                notes: normalizedMasterNotes,
                notesWithTagMaps: normalizedMasterNotesWithTagMaps,
            };
        });
    };

    const copyConflictNoteToMaster = async (noteWithTagMap: NoteWithTagMap) => {
        if (isActiveMasterDatabase.value || isMigrating.value) {
            return;
        }

        isMigrating.value = true;
        migrationMessage.value = 'Copying note to Master Backup...';
        try {
            migrateConflictNotesByIds([noteWithTagMap.note[0]]);
            selectedConflictNoteIds.value = selectedConflictNoteIds.value.filter((id) => id !== noteWithTagMap.note[0]);
        } finally {
            isMigrating.value = false;
            migrationMessage.value = 'Migrating notes... Please wait.';
        }
    };

    const migrateBatch = async () => {
        if (isActiveMasterDatabase.value || isMigrating.value || selectedConflictNoteIds.value.length === 0) {
            return;
        }

        isMigrating.value = true;
        migrationMessage.value = 'Migrating notes... Please wait.';
        try {
            const noteIdsToMigrate = [...selectedConflictNoteIds.value];
            migrateConflictNotesByIds(noteIdsToMigrate);
            selectedConflictNoteIds.value = [];
        } finally {
            isMigrating.value = false;
        }
    };

    onBeforeUnmount(() => {
        resizeObserver?.disconnect();
        observedElementsByNoteId.clear();
    });

    const gotoImport = () => {
        router.push({ name: 'import' });
    }

    const gotoLibraries = () => {
        router.push({ name: 'databases' });
    }
</script>