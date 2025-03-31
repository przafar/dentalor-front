<template>
  <div>
    <div class="mb-4 flex justify-between items-center">
      <div>
        <h4 class="page_title">{{ props.data.display }}</h4>
      </div>
      <div>
        <el-button type="primary" @click="openCreateDrawer">
          <i class="fa-solid fa-plus mr-2"></i>
          Добавить услугу
        </el-button>
      </div>
    </div>
    <el-table :data="getAllData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="Код" width="120" />
      <el-table-column prop="display" label="Название" />
      <el-table-column prop="price" label="Цена" />
      <el-table-column label="Действия" width="120">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-button type="primary" size="small" @click="openEditDrawer(row)">
              <i class="fa-solid fa-pen-to-square"></i>
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <i class="fa-solid fa-trash-can"></i>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer
        title="Добавить услугу"
        v-model="createDrawerVisible"
        direction="rtl"
        size="40%">
      <CreateForm :parentData="props.data" @create="handleCreate" @cancel="handleCancel" />
    </el-drawer>

    <el-drawer
        title="Редактировать услугу"
        v-model="editDrawerVisible"
        direction="rtl"
        size="40%">
      <EditForm :data="selectedService" @edit="handleEdit" @cancel="closeEditDrawer" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { servicesStore } from '@/store/services'
import CreateForm from '../dialogs/EncounterTypes/CreateForm.vue'
import EditForm from '../dialogs/EncounterTypes/EditForm.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const store = servicesStore()

const createDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const selectedService = ref(null)

const getAllData = computed(() => store.getEncounterTypes)

const fetchFormController = async () => {
  await store.GET_LIST_OF_ECOUNTER_TYPES(props.data.code)
}

const openCreateDrawer = () => {
  createDrawerVisible.value = true
}
const handleCreate = async () => {
  await fetchFormController()
  createDrawerVisible.value = false
}

const openEditDrawer = (row) => {
  selectedService.value = {...row}
  editDrawerVisible.value = true
}
const handleEdit = async () => {
  await fetchFormController()
  editDrawerVisible.value = false
}
const closeEditDrawer = () => {
  editDrawerVisible.value = false
}

const handleCancel = () => {
  createDrawerVisible.value = false
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        'Вы уверены, что хотите удалить услугу?',
        'Предупреждение',
        {
          confirmButtonText: 'Да',
          cancelButtonText: 'Нет',
          type: 'warning'
        }
    )
    await store.DELETE_ENCOUNTER_TYPES(row.id)
    ElMessage.success('Услуга удалена')
    await fetchFormController()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка удаления')
    }
  }
}
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>