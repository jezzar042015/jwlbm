<template>
    <div class="p-2 md:p-6 bg-gray-50 min-h-screen flex flex-col">
        <div class="p-2 md:px-5 md:py-2 flex flex-col items-end w-full">
            <button @click="gotoImport" class="shadow uppercase text-xs px-4 py-2 bg-white rounded-full">
                Add Backup File
            </button>
        </div>
        <div class="p-2 md:px-5 py-2 space-y-4 flex flex-col items-center w-full flex-1">
            <div v-for="db in dbStore.databases" :key="db.id" @click="setActiveDatabase(db.id)"
                class="shadow p-4 rounded-tr-lg rounded-br-lg w-full max-w-full md:max-w-3xl border-l-6 border-violet-900 hover:shadow-lg transition-shadow bg-white cursor-pointer mx-auto">

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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import router from '@/router';
    import { useDatabaseStore } from '@/stores/database';
    import { useRelativeTime } from '@/composables/useRelativeTime';

    const dbStore = useDatabaseStore();
    const { formatRelativeTime } = useRelativeTime();

    const gotoImport = () => {
        router.push({ name: 'import' });
    }

    const setActiveDatabase = (dbId: string) => {
        dbStore.setActiveDatabase(dbId);
        router.push({ name: 'database-notes' });
    }
</script>
