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
    <div class="flex justify-between items-center">
      <div class="flex flex-col ml-4 ">
        <h5 class="text-base font-bold text-[#385df0]">{{ user?.practitioner?.last_name }} {{ user?.practitioner?.first_name }} {{ user?.practitioner?.middle_name || '' }}</h5>
        <p>{{ user?.organization?.name_en }}</p>
      </div>

      <nav class="flex space-x-4">
       
        <button
          @click="logout"
          class="hover:text-gray-300"
        >
          Выйти
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
    user.value = JSON.parse(storedUser);
  }
});

const isActive = (path) => route.path === path;
const handleMenu = () => {
  store.toggleCollapse();
};
const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
</style>