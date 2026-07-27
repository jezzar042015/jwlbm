<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl">
            <div ref="dropZone" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop"
                @click="triggerFileInput" :class="[
                    'border-2 border-dashed rounded-lg p-8 bg-white cursor-pointer transition',
                    isDragOver ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200'
                ]">
                <input ref="fileInput" class="hidden" type="file" accept=".jwlibrary" @change="onFile" id="" />

                <div class="flex flex-col items-center justify-center text-center space-y-4">

                    <img src="/jwl-icon.png" alt="JW Library Logo" class="w-16 h-16" />

                    <div class="text-lg font-medium text-gray-800">Drop your JW Library Back Up (.jwlibrary) file here
                    </div>
                    <div class="text-sm text-gray-500">or click to browse</div>
                    <div v-if="fileName" class="text-sm text-gray-700">Selected: <span class="font-semibold">{{ fileName
                            }}</span></div>

                </div>
            </div>
            <p class="mt-4 text-xs text-gray-500">Supported file type: .jwlibrary</p>
            <div class="pt-2 flex items-center justify-center w-full " v-if="dbStore.databases.length > 0">
                <button @click.stop="gotoDatabases"
                    class="bg-violet-800 text-white px-4 py-2 rounded shadow cursor-pointer">Databases
                    ({{
                        dbStore.databases.length }})</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { useImportBackup } from "@/composables/useImportBackup";
    import { useDatabaseStore } from "@/stores/database";
    import router from "@/router";

    const { importBackup } = useImportBackup();
    const dbStore = useDatabaseStore();

    const fileInput = ref<HTMLInputElement | null>(null);
    const dropZone = ref<HTMLElement | null>(null);
    const isDragOver = ref(false);
    const fileName = ref('');

    async function onFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        fileName.value = file.name;
        await importBackup(file);
    }

    function triggerFileInput() {
        fileInput.value?.click();
    }

    function onDragOver() {
        isDragOver.value = true;
    }

    function onDragLeave() {
        isDragOver.value = false;
    }

    async function onDrop(event: DragEvent) {
        isDragOver.value = false;
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        fileName.value = file.name;
        await importBackup(file);
    }

    const gotoDatabases = () => {
        router.push({ name: 'databases' });
    };
</script>