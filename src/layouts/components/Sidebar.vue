<template>
  <el-menu
    default-active="2"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
  >
    <div>
      lll
    </div>
    
    <el-menu-item index="2">
      <el-icon class="text-lg">
        <i class="fa-solid fa-clipboard-list"></i>
      </el-icon>
      
      <template #title>Сервисы</template>
    </el-menu-item>

    <el-menu-item index="4">
      <el-icon class="text-lg">
        <i class="fa-solid fa-user-plus"></i>
      </el-icon>
      <template #title>Пациенты</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref } from 'vue'


const isCollapse = ref(false)
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 250px;
  min-height: 400px;
}
</style>
