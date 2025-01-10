<template>
  <header class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Логотип или название -->
      <div class="text-lg font-bold">
        <router-link to="/" class="hover:text-gray-300">DentaLor</router-link>
      </div>

      <!-- Навигация -->
      <nav class="flex space-x-4">
        <router-link
          to="/"
          class="hover:text-gray-300"
          :class="{ 'text-yellow-400': isActive('/') }"
        >
          Dashboard
        </router-link>
        <button
          @click="logout"
          class="hover:text-gray-300"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Проверка активного маршрута
const isActive = (path) => route.path === path;

// Функция выхода из системы
const logout = () => {
  localStorage.removeItem('token'); // Удаление токена
  router.push('/login'); // Перенаправление на страницу входа
};
</script>

<style scoped>
/* Если хотите добавить стили */
</style>