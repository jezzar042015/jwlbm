<template>
    <div @click="setActiveDatabase(db.id)"
        class="shadow p-4 rounded-tr-lg rounded-br-lg w-full max-w-full md:max-w-3xl border-l-6  hover:shadow-lg transition-shadow bg-white cursor-pointer mx-auto"
        :class="{ 'border-violet-200': !db.isMaster, 'border-violet-900': db.isMaster }">

        <div class="flex justify-between items-start mb-3 space-x-3 relative">
            <div>
                <img src="/jwl-icon.png" alt="JW Library Logo" class="min-w-12 w-12 h-12  mb-2" />
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800">{{ db.name }}</h3>
                <span v-if="db.isMaster"
                    class="absolute right-0 inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Primary
                    Backup</span>
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
    </div>
</template>

<script setup lang="ts">
    import { useRelativeTime } from '@/composables/useRelativeTime';
    import type { DatabaseManifest } from '@/database/types/database';
    import { useNotesStore } from '@/stores/notes';
    import { computed } from 'vue';

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
                } | undefined;
                open: (data: Uint8Array<ArrayBufferLike>, manifest?: DatabaseManifest) => Promise<void>;
                query: (sql: string) => any;
                close: () => void;
            };
        }
    }>();

    const { formatRelativeTime } = useRelativeTime();

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
