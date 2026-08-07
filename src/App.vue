<template>
  <div class="min-h-screen mx-auto bg-gray-50">
    <div v-if="isHydrating"
      class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white px-6 backdrop-blur-sm"
      aria-busy="true" aria-live="polite">
      <div class="w-full max-w-md bg-white p-8 text-center">
        <div class="mx-auto mb-5 h-12 w-12 rounded-full border-t-violet-700 animate-spin">
        </div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-700">Restoring Session</p>
        <h1 class="mt-3 text-xl font-semibold text-gray-900">Loading your library data</h1>
        <p class="mt-3 text-sm leading-6 text-gray-600">{{ hydrationMessage }}</p>

        <div class="mt-6" v-if="hydrationProgress !== null">
          <div class="h-2 overflow-hidden rounded-full bg-gray-200">
            <div class="h-full rounded-full bg-violet-700 transition-[width] duration-200 ease-out"
              :style="{ width: `${hydrationProgress}%` }" />
          </div>
          <p class="mt-2 text-xs font-medium text-gray-500">{{ Math.round(hydrationProgress) }}% complete</p>
        </div>
        <p v-else class="mt-6 text-xs font-medium text-gray-500">This can take a moment for larger backups.</p>
      </div>
    </div>
    <RouterView v-else />
  </div>
</template>

<script setup lang="ts">
  import { hydrationMessage, hydrationProgress, isHydrating } from '@/bootstrap';
  import { useDatabaseStore } from './stores/database';
  import { watch } from 'vue';
  import router from './router';

  const dbStore = useDatabaseStore();

  watch(
    () => isHydrating.value,
    (newValue) => {
      if (!newValue) {
        if (dbStore.databases.length > 0) {
          router.push({ name: 'databases' });
        }
      }
    }
  );
</script>