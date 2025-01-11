<template>
  <el-menu
    :default-active="$router.currentRoute.value.meta.name"
    default-active="2"
    class="el-menu-vertical-demo bg-[#f9fafc]"
    :collapse="store.isCollapse"
    @open="handleOpen"
    @close="handleClose"
    @select="navigateTo"
  >
  
  <div class="menu-header pt-4 pl-4 h-14 mb-4 flex justify-between items-center">
     <div class="flex items-center">
        <img class="w-6" src="../../assets/image/dentalor-min.png" alt="">
        <span v-if="!store.isCollapse" class="menu-title text-xl ml-2 text-[#385df0] font-bold">Denta Lor</span>
     </div>
     
  </div>

  <el-menu-item index="Dashboard" :route="{ name: 'Dashboard' }" class="text-[#495265]">
    <el-icon class="text-lg">
      <i class="fa-solid fa-house text-lg"></i>
    </el-icon>
    
    <template #title>Главная</template>
  </el-menu-item>
    
    <el-menu-item index="service" :route="{ name: 'service' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <i class="fa-solid fa-clipboard-list text-lg"></i>
      </el-icon>
      
      <template #title>Сервисы</template>
    </el-menu-item>

    <el-menu-item index="patient" :route="{ name: 'patient' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <i class="fa-solid fa-user text-lg"></i>
      </el-icon>
      <template #title>Пациенты</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();
const store = authStore();

const getIsCollapse = () => store.getIsCollapse

const isCollapse = ref(false)
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
const navigateTo = (index) => {
  router.push({ name: index });
};
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 250px;
  min-height: 400px;
}
</style>
