<template>
  <div class="flex items-center w-full bg-white">
    <div class="close_header">
      <button
        @click="store.toggleCollapse"
      >
      <i v-if="store.isCollapse" class="fa-solid fa-angle-right"></i>
      <i v-else class="fa-solid fa-angle-left"></i>
    </button>
   </div>
   <header class=" text-black px-4 py-2 h-14 w-full">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Логотип или название -->
      <div class="text-lg font-bold mt-4">
        <router-link to="/" class="hover:text-gray-300">DentaLor</router-link>
      </div>

      <!-- Навигация -->
      <nav class="flex space-x-4">
       
        <button
          @click="logout"
          class="hover:text-gray-300"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
  </div>
  
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();
const route = useRoute();
const store = authStore();

// Проверка активного маршрута
const isActive = (path) => route.path === path;
const handleMenu = () => {
  store.toggleCollapse();
};
// Функция выхода из системы
const logout = () => {
  localStorage.removeItem('token'); // Удаление токена
  router.push('/login'); // Перенаправление на страницу входа
};
</script>

<style scoped>
/* Если хотите добавить стили */
</style>