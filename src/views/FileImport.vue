<template>
    <input id="" type="file" accept=".jwlibrary" @change="onFile">

    <h2>Databases: {{ dbCount }}</h2>

</template>

<script setup lang="ts">
    import { ref } from "vue";
    import { useImportBackup } from "@/composables/useImportBackup";
    import { useDatabaseStore } from "@/stores/database";

    const { importBackup } = useImportBackup();

    const dbCount = ref(0);

    async function onFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) return;

        await importBackup(file);

        const dbStore = useDatabaseStore();

        dbCount.value = dbStore.databases.length ?? 0;
    }
</script>