<template>
  <el-form :model="editForm" label-width="120px" label-position="top">
    <el-form-item label="Код">
      <el-input v-model="editForm.code" />
    </el-form-item>
    <el-form-item label="Название">
      <el-input v-model="editForm.display" />
    </el-form-item>
    <el-form-item label="Норма">
      <el-input v-model="editForm.norm" />
    </el-form-item>
    <el-form-item label="Ед. изм.">
      <el-input v-model="editForm.unit" />
    </el-form-item>
    <el-form-item label="Цена">
      <el-input-number v-model="editForm.price" :min="0" />
    </el-form-item>
    <el-form-item>
      <el-button :loading="isLoading" type="primary" @click="onSave">Сохранить</el-button>
      <el-button :loading="isLoading" @click="onCancel">Отмена</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, onMounted, watch, ref } from 'vue'
import { servicesStore } from '@/store/services'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['edit', 'cancel'])

const store = servicesStore()

const isLoading = ref(false)

const editForm = reactive({
  id: null,
  code: '',
  display: '',
  norm: '',
  unit: '',
  price: null
})

onMounted(() => {
  Object.assign(editForm, props.data)
})

watch(
    () => props.data,
    (newVal) => {
      Object.assign(editForm, newVal)
    },
    { deep: true }
)

const onSave = async () => {
  isLoading.value = true
  const payload = {
    code: editForm.code,
    display: editForm.display,
    norm: editForm.norm,
    unit: editForm.unit,
    price: editForm.price
  }
  try {
    await store.UPDATE_ANALYSIS_TYPE(editForm.id, payload)
    emit('edit', payload)
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