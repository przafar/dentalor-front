<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <div>
        <h4 class="page_title">Сервисы</h4>
      </div>
      <div>
        <el-button type="primary" @click="openCreateDrawer">
          <i class="fa-solid fa-plus mr-2"></i>
          Добавить сервис
        </el-button>
      </div>
    </div>
    <el-table :data="getAllData" border stripe >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="Код" width="120" />
      <el-table-column prop="display" label="Название" />
      <el-table-column label="Действия" width="180">
        <template #default="{ row }">
          <div class="flex items-center"> 
            <el-button type="info" size="small" @click="openShowDrawer(row)">
              <i class="fa-solid fa-eye"></i>
            </el-button>
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
      title="Просмотр сервиса"
      v-model="showDrawerVisible"
      direction="rtl"
      size="50%">
      <View-types :data="selectedService" />
    </el-drawer>

    <el-drawer
      title="Редактировать сервис"
      v-model="editDrawerVisible"
      direction="rtl"
      size="40%">
      <edit-form :data="selectedService" @edit="handleEdit" @cancel="closeEditDrawer" />
    </el-drawer>

    <el-drawer
      title="Добавить сервис"
      v-model="createDrawerVisible"
      direction="rtl"
      size="40%">
      <CreateForm @create="handleCreate" @cancel="handleCancel" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { servicesStore } from '@/store/services'

import ViewTypes from './components/ViewTypes.vue'

import CreateForm from './dialogs/encounterClasses/CreateForm.vue'
import EditForm from './dialogs/encounterClasses/EditForm.vue'



const store = servicesStore()

const showDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const createDrawerVisible = ref(false)
const selectedService = ref(null)





const getAllData = computed(() => store.getEncounterClasses)


onMounted(async () => {
  await fetchFormController();
});

const fetchFormController = async () => {
  await store.GET_LIST_OF_ECOUNTER_CLASSES();
};

const openShowDrawer = async (row) => {
  await store.GET_LIST_OF_ECOUNTER_TYPES(row.code)
  selectedService.value = row
  showDrawerVisible.value = true
}

const openEditDrawer = (row) => {
  selectedService.value = { ...row }
  editDrawerVisible.value = true
}

const openCreateDrawer = () => {
  createDrawerVisible.value = true
}

const handleCreate = async () => {
  await fetchFormController()
  createDrawerVisible.value = false
}
const handleEdit = async () => {
  await fetchFormController()
  editDrawerVisible.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `Вы уверены, что хотите удалить сервис "${row.display}"?`,
    'Подтверждение',
    {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning'
    }
  )
    .then(() => {
      services.value = services.value.filter(item => item.id !== row.id)
      ElMessage.success('Сервис удален')
    })
    .catch(() => {
    })
}

const closeEditDrawer = () => {
  editDrawerVisible.value = false
}

const closeCreateDrawer = () => {
  createDrawerVisible.value = false
}
</script>