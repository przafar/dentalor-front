<template>
  <el-menu
    :default-active="$router.currentRoute.value.meta.name"
    default-active="2"
    class="el-menu-vertical-demo bg-[#f6f8fa]"
    :collapse="store.isCollapse"
    @open="handleOpen"
    @close="handleClose"
    @select="navigateTo"
  >
  
    <div class="menu-header pt-4 pl-4 h-14 mb-4 flex justify-between items-center">
       <div class="flex items-center">
          <img class="w-10" src="../../assets/image/dentalor-min.png" alt="">
          <span v-if="!store.isCollapse" class="menu-title ml-2">DENTA LOR</span>
       </div>

    </div>

    <el-menu-item v-if="vCan.can('main_index', 'all')" index="dashboard" :route="{ name: 'dashboard' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="ic:round-home" class="text-[28px]" :ssr="true" />
      </el-icon>

      <template #title>Главная</template>
    </el-menu-item>

    <el-menu-item v-if="vCan.can('organization_index', 'all')" index="organizations" :route="{ name: 'organizations' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="healthicons:hospital-24px" class="text-[28px]" :ssr="true" />
      </el-icon>

      <template #title>Организация</template>
    </el-menu-item>

    <el-menu-item v-if="vCan.can('practitioner_index', 'all')" index="practitioners" :route="{ name: 'practitioners' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="ic:round-supervisor-account" class="text-[28px]" :ssr="true" />
      </el-icon>

      <template #title>Сотрудники</template>
    </el-menu-item>
    
    <el-menu-item v-if="vCan.can('service_index', 'all')" index="service" :route="{ name: 'service' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="ic:round-account-tree" class="text-[28px]" :ssr="true" />

      </el-icon>
      
      <template #title>Сервисы</template>
    </el-menu-item>

    <el-menu-item v-if="vCan.can('patient_index', 'all')" index="patients" :route="{ name: 'patients' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="ic:baseline-person-add-alt-1" class="text-[28px]" :ssr="true" />
      </el-icon>
      <template #title>Пациенты</template>
    </el-menu-item>

    <el-menu-item v-if="vCan.can('appointment_index', 'all')" index="appointments" :route="{ name: 'appointments' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="healthicons:i-exam-multiple-choice" class="text-[28px]" :ssr="true" />
      </el-icon>
      <template #title>Запись на приём</template>
    </el-menu-item>
    <el-menu-item v-if="vCan.can('payment_index', 'all')" index="payments" :route="{ name: 'payments' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="material-symbols:money-bag-rounded" class="text-[28px]" :ssr="true" />
      </el-icon>
      <template #title>Касса</template>
    </el-menu-item>
    <el-menu-item v-if="vCan.can('tv_index', 'all')" index="QueueTable" :route="{ name: 'QueueTable' }" class="text-[#495265]">
      <el-icon class="text-lg">
        <Icon icon="material-symbols:live-tv-outline-rounded" class="text-[28px]" :ssr="true" />
      </el-icon>
      <template #title>Телевизор</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { Icon } from "@iconify/vue";
import { authStore } from '../../store/auth';

import { defineAbilitiesFor } from '../../plugins/ability';

const router = useRouter();
const store = authStore();

const { user } = store;

const vCan = defineAbilitiesFor(user?.roles[0]);
console.log(user?.roles[0]?.role, 'user?.roles');

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
  width: 260px;
  min-height: 400px;
}
</style>
