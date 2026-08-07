<template>
    <div class="p-2 md:p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <div class="p-2 md:py-2 flex w-full items-center justify-between md:max-w-3xl">
            <div class="font-semibold text-xl">Back Up Files</div>
            <button type="button" @click="gotoImport"
                class="shadow uppercase text-sm px-4 py-2 bg-violet-900 text-white rounded-full">
                Add Backup File
            </button>
        </div>
        <div class="p-2 md:px-5 py-2 space-y-4 flex flex-col items-center w-full flex-1">
            <template v-for="db in dbStore.databases" :key="db.id">
                <DatabaseListItem :db="db" @set-active-database="setActiveDatabase" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import DatabaseListItem from '@/components/databases/DatabaseListItem.vue';
    import router from '@/router';
    import { useDatabaseStore } from '@/stores/database';

    const dbStore = useDatabaseStore();

    const gotoImport = () => {
        router.push({ name: 'import' });
    }

    const setActiveDatabase = (dbId: string) => {
        dbStore.setActiveDatabase(dbId);
        router.push({ name: 'database-notes' });
    }
</script>
