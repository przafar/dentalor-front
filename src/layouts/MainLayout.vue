<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <div
      class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden"
    >
      <Header class="sticky top-0 z-50"/>
      <div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';

// Определение реактивного состояния
const sidebarOpen = ref(false);

// Функция для переключения состояния боковой панели
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

</script>

<style scoped></style>
