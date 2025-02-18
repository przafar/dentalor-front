<template>
  <div class="flex items-center w-full bg-white border-b ">
    <div class="close_header">
      <button
        @click="store.toggleCollapse"
      >
      <i v-if="store.isCollapse" class="fa-solid fa-angle-right"></i>
      <i v-else class="fa-solid fa-angle-left"></i>
    </button>
   </div>
   <header class=" text-black px-4 py-2 h-16 w-full">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Логотип или название -->
      <div class="flex flex-col  ml-4 ">
        <h5 class="text-base font-bold text-[#385df0]">{{ user?.practitioner?.last_name }} {{ user?.practitioner?.first_name }} {{ user?.practitioner?.middle_name || '' }}</h5>
        <p>{{ user?.organization?.name_en }}</p>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();
const route = useRoute();
const store = authStore();



const user = ref(null);

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser); // Парсим строку в объект
  }
});

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