<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-20">
        <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-10 text-center">
            <h1 class="text-3xl font-semibold mb-4 text-slate-900">Welcome to JW Library Notes Viewer</h1>
            <p class="text-slate-600 mb-8">Open your JW Library backup and browse personal notes in a clean, dedicated
                space.</p>

            <button @click="gotoImport"
                class="bg-violet-900 hover:bg-violet-800 text-white px-8 cursor-pointer py-3 rounded-full shadow transition">
                Add JW Library Backup File
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import router from '@/router';

    const gotoImport = () => {
        router.push({ name: 'import' });
    }
</script>