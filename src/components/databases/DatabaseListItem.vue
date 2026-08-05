<template>
    <div @click="setActiveDatabase(db.id)"
        class="shadow p-4 rounded-tr-lg rounded-br-lg w-full max-w-full md:max-w-3xl border-l-6  hover:shadow-lg transition-shadow bg-white cursor-pointer mx-auto"
        :class="{ 'border-violet-200': !db.isMaster, 'border-violet-900': db.isMaster }">

        <div class="flex justify-between items-start mb-3 space-x-3 relative">
            <div>
                <img src="/jwl-icon.png" alt="JW Library Logo" class="min-w-12 w-12 h-12  mb-2"
                    :class="{ 'opacity-55': !db.isMaster }" />
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800">{{ db.name }}</h3>
            </div>
            <div class="relative" ref="menuContainerRef">
                <button type="button"
                    class="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    aria-label="Open database actions" aria-haspopup="menu" :aria-expanded="isMenuOpen"
                    @click.stop="toggleMenu">
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                    </svg>
                </button>
                <div v-if="isMenuOpen"
                    class="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-20"
                    role="menu" aria-label="Database actions" @click.stop>
                    <button type="button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        role="menuitem" @click.stop="handleRemoveDatabase">
                        Remove Database
                    </button>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Device</p>
                <p class="font-medium text-gray-800">{{ db.db.manifest?.userDataBackup.deviceName || 'N/A' }}
                </p>
            </div>
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Last Modified</p>
                <p class="font-medium text-gray-800">
                    {{ formatRelativeTime(db.db.manifest?.userDataBackup.lastModifiedDate) }}
                </p>
            </div>
        </div>
        <div v-if="!db.isMaster" class="mt-4">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Not in Primary Backup</p>
                <p class="font-medium text-gray-800">{{ missingNotes.length }} notes
                </p>
            </div>
        </div>
        <div v-if="db.isMaster"
            class="inline-block mt-5 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Primary
            Backup
        </div>
    </div>
</template>

<script setup lang="ts">

    import type { DatabaseManifest } from '@/database/types/database';
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import { useNotesStore } from '@/stores/notes';
    import { useRelativeTime } from '@/composables/useRelativeTime';
    import { useDatabaseStore } from '@/stores/database';

    const { db } = defineProps<{
        db: {
            id: string;
            isMaster: boolean;
            importedAt: Date;
            name: string;
            db: {
                manifest?: {
                    name: string;
                    creationDate: string;
                    version: number;
                    type: number;
                    userDataBackup: {
                        lastModifiedDate: string;
                        deviceName: string;
                        databaseName: string;
                        hash: string;
                        schemaVersion: number;
                    };
                };
                open: (data: Uint8Array<ArrayBufferLike>, manifest?: DatabaseManifest) => Promise<void>;
                query: (sql: string) => any;
                close: () => void;
            };
        }
    }>();

    const { formatRelativeTime } = useRelativeTime();
    const dbStore = useDatabaseStore();
    const isMenuOpen = ref(false);
    const menuContainerRef = ref<HTMLElement | null>(null);

    const handleRemoveDatabase = () => {
        isMenuOpen.value = false;
        dbStore.removeDatabase(db.id);
    }

    const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value;
    }

    const handleClickOutsideMenu = (event: MouseEvent) => {
        const target = event.target as Node;
        if (!menuContainerRef.value?.contains(target)) {
            isMenuOpen.value = false;
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleClickOutsideMenu);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutsideMenu);
    });

    const emits = defineEmits<{
        (e: 'set-active-database', dbId: string): void
    }>();

    const setActiveDatabase = (dbId: string) => {
        emits('set-active-database', dbId);
    }

    const notes = useNotesStore();

    const missingNotes = computed(() => {
        if (db.isMaster) {
            return [];
        }
        const dbNotes = notes.conflictingNoteStates.find(note => note.db_id === db.id);

        return dbNotes ? dbNotes.notes : [];
    });
</script>
