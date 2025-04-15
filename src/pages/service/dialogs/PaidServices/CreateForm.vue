<template>
  <el-form :model="form" label-width="100px" label-position="top">
    <el-form-item label="Код">
      <el-input v-model="form.code" />
    </el-form-item>
    <el-form-item label="Название">
      <el-input v-model="form.display" />
    </el-form-item>
    <el-form-item label="Цена">
      <el-input v-model="form.price" />
    </el-form-item>
    <el-form-item>
      <div class="flex justify-end">
        <el-button :loading="isLoading" type="primary" @click="onCreate">Создать</el-button>
        <el-button :loading="isLoading" @click="onCancel">Отмена</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { servicesStore } from '@/store/services'

const store = servicesStore()

const form = ref({
  code: '',
  display: '',
  price: ''
})


const emit = defineEmits(['success', 'cancel'])

const isLoading = ref(false)

const onCreate = async () => {
  isLoading.value = true
  const payload = {
    code: form.value.code,
    display: form.value.display,
    price: form.value.price
  }
  try {
    await store.CREATE_PAID_SERVICE(payload)
    emit('success', payload)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const onCancel = () => {
  emit('cancel')
}
</script>