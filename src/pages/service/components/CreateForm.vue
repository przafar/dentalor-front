<!-- CreateServiceForm.vue -->
<template>
  <el-form :model="form" label-width="100px" label-position="top">
    <el-form-item label="Код">
      <el-input v-model="form.code" />
    </el-form-item>
    <el-form-item label="Название">
      <el-input v-model="form.display" />
    </el-form-item>
    <el-form-item>
      <div class="flex justify-end">
        <el-button type="primary" @click="onCreate">Добавить</el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { servicesStore } from '@/store/services'

const store = servicesStore()

// Локальное состояние формы – изначально пустое
const form = ref({
  code: '',
  display: ''
})

// Эмит событий для передачи в родительский компонент
const emit = defineEmits(['create', 'cancel'])

// При клике на "Добавить"
const onCreate = () => {
  const payload = { ...form.value }
  store.CREATE_ENCOUNTER_CLASSES(payload)
  
  emit('create', payload)
}

// При клике на "Отмена"
const onCancel = () => {
  emit('cancel')
}
</script>