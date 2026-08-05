<template>
  <div class="min-h-screen mx-auto bg-gray-50">
    <div v-if="isHydrating" class="min-h-screen flex items-center justify-center px-6">
      <div class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <div class="mx-auto mb-4 w-10 h-10 border-4 border-gray-200 border-t-violet-700 rounded-full animate-spin">
        </div>
        <p class="text-sm font-semibold tracking-wide text-gray-900 uppercase">Loading Library Data</p>
        <p class="mt-2 text-sm text-gray-600">Restoring backups and notes...</p>
      </div>
    </div>
    <RouterView v-else />
  </div>
</template>

<script setup lang="ts">
  import { isHydrating } from '@/bootstrap';

</script>