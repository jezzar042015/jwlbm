<template>
    <input id="" type="file" accept=".jwlibrary" @change="onFile">

    <h2>Notes: {{ noteCount }}</h2>

</template>

<script setup lang="ts">
    import { ref } from "vue";
    import { useImportBackup } from "@/composables/useImportBackup";
    import { useDatabaseStore } from "@/stores/database";
    import { NoteService } from "@/services/NoteService";

    const { importBackup } = useImportBackup();

    const noteCount = ref(0);

    async function onFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) return;

        await importBackup(file);

        const store = useDatabaseStore();

        const service = new NoteService(store.database!);

        noteCount.value = service.getCount();
    }
</script>