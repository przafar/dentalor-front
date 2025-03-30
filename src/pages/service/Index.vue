<template>
  <div class="p-4">
    <el-tabs v-model="activeTab" @tab-click="changeTab">
      <el-tab-pane label="Сервисы" name="services">
        <div class="mb-4 flex justify-between items-center">
          <h4 class="page_title">Сервисы</h4>
          <el-button type="primary" @click="openCreateDrawer('services')">
            <i class="fa-solid fa-plus mr-2"></i>
            Добавить сервис
          </el-button>
        </div>
        <el-table :data="servicesData" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="Код" width="120" />
          <el-table-column prop="display" label="Название" />
          <el-table-column label="Действия" width="180">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-button type="info" size="small" @click="openShowDrawer(row, 'services')">
                  <i class="fa-solid fa-eye"></i>
                </el-button>
                <el-button type="primary" size="small" @click="openEditDrawer(row, 'services')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row, 'services')">
                  <i class="fa-solid fa-trash-can"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="Анализы" name="analysis">
        <div class="mb-4 flex justify-between items-center">
          <h4 class="page_title">Анализы</h4>
          <el-button type="primary" @click="openCreateDrawer('analysis')">
            <i class="fa-solid fa-plus mr-2"></i>
            Добавить анализ
          </el-button>
        </div>
        <el-table :data="analysisData" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="Код" width="120" />
          <el-table-column prop="display" label="Название" />
          <el-table-column prop="norm" label="Норма" />
          <el-table-column prop="unit" label="Ед. изм." />
          <el-table-column prop="price" label="Цена" />
          <el-table-column label="Действия" width="180">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-button type="info" size="small" @click="openShowDrawer(row, 'analysis')">
                  <i class="fa-solid fa-eye"></i>
                </el-button>
                <el-button type="primary" size="small" @click="openEditDrawer(row, 'analysis')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row, 'analysis')">
                  <i class="fa-solid fa-trash-can"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-drawer
        title="Просмотр"
        v-model="showDrawerVisible"
        direction="rtl"
        size="50%">
      <ViewTypes :data="selectedItem" />
    </el-drawer>

    <el-drawer
        title="Редактировать"
        v-model="editDrawerVisible"
        direction="rtl"
        size="40%">
      <template v-if="activeTab === 'services'">
        <EditForm :data="selectedItem" @edit="handleEdit" @cancel="closeEditDrawer" />
      </template>
      <template v-else>
        <EditAnalysisForm :data="selectedItem" @edit="handleEdit" @cancel="closeEditDrawer" />
      </template>
    </el-drawer>

    <el-drawer
        :title="activeTab === 'services' ? 'Добавить сервис' : 'Добавить анализ'"
        v-model="createDrawerVisible"
        direction="rtl"
        size="60%">
      <template v-if="activeTab === 'services'">
        <CreateForm @create="handleCreate" @cancel="closeCreateDrawer" />
      </template>
      <template v-else>
        <CreateAnalysisForm @create="handleCreate" @cancel="closeCreateDrawer" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import { servicesStore } from '@/store/services'

import ViewTypes from './components/ViewTypes.vue'
import CreateForm from './dialogs/encounterClasses/CreateForm.vue'
import EditForm from './dialogs/encounterClasses/EditForm.vue'
import CreateAnalysisForm from './dialogs/AnalysisTypes/CreateForm.vue'
import EditAnalysisForm from './dialogs/AnalysisTypes/EditForm.vue'

const activeTab = ref('services')

const services = servicesStore()

const servicesData = computed(() => services.getEncounterClasses)
const analysisData = computed(() => services.getAnalysisTypes)

const showDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const createDrawerVisible = ref(false)
const selectedItem = ref(null)

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  if (activeTab.value === 'services') {
    await services.GET_LIST_OF_ECOUNTER_CLASSES()
  } else if (activeTab.value === 'analysis') {
    await services.GET_ANALYSIS_TYPES()
  }
}

const changeTab = async (tab) => {
  activeTab.value = tab.props.name
  await fetchData()
}

const openShowDrawer = async (row, mode) => {
  selectedItem.value = row
  if (mode === 'services') {
    await services.GET_LIST_OF_ECOUNTER_TYPES(row.code)
  }
  showDrawerVisible.value = true
}

const openEditDrawer = (row, mode) => {
  selectedItem.value = { ...row }
  editDrawerVisible.value = true
}

const openCreateDrawer = (mode) => {
  createDrawerVisible.value = true
}

const handleCreate = async () => {
  await fetchData()
  createDrawerVisible.value = false
}

const handleEdit = async () => {
  await fetchData()
  editDrawerVisible.value = false
}

const handleDelete = (row, mode) => {
  ElMessageBox.confirm(
      `Вы уверены, что хотите удалить ${mode === 'services' ? 'сервис' : 'анализ'} "${row.display}"?`,
      'Подтверждение',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
  )
      .then(async () => {
        if (mode === 'services') {
          await services.DELETE_ENCOUNTER(row.id)
          await fetchData()
        } else if (mode === 'analysis') {
          services.deleteAnalysisType(row.id)
        }
        ElMessage.success(`${mode === 'services' ? 'Сервис' : 'Анализ'} удален`)
      })
      .catch(() => {})
}

const closeEditDrawer = () => {
  editDrawerVisible.value = false
}

const closeCreateDrawer = () => {
  createDrawerVisible.value = false
}
</script>