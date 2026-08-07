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
            <div class="progress-fill h-full rounded-full transition-[width] duration-200 ease-out"
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

<style scoped>
  .progress-fill
  {
    background: linear-gradient(90deg,
        #4c1d95 0%,
        #7c3aed 25%,
        #c4b5fd 50%,
        #7c3aed 75%,
        #4c1d95 100%);

    background-size: 300% 100%;
    animation: progress-gradient 2s linear infinite, progress-glow 1.8s ease-in-out infinite alternate;
    box-shadow: 0 0 0 rgba(124, 58, 237, 0.35);

    transition: width 300ms ease;
  }

  @keyframes progress-gradient
  {
    0%
    {
      background-position: 300% 0;
    }

    100%
    {
      background-position: -100% 0;
    }
  }

  @keyframes progress-glow
  {
    0%
    {
      box-shadow: 0 0 2px rgba(124, 58, 237, 0.25), 0 0 6px rgba(124, 58, 237, 0.18);
      filter: saturate(1);
    }

    100%
    {
      box-shadow: 0 0 6px rgba(124, 58, 237, 0.45), 0 0 14px rgba(124, 58, 237, 0.3);
      filter: saturate(1.2);
    }
  }
</style>