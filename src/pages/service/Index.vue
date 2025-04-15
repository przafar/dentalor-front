<template>
  <div v-loading="loadingData" class="p-4">
    <el-tabs v-model="activeTab" @tab-click="changeTab">
      <!-- Сервисы -->
      <el-tab-pane label="Сервисы" name="services">
        <div class="mb-4 flex justify-between items-center">
          <h4 class="page_title">Сервисы</h4>
          <el-button type="primary" @click="openCreateDrawer">
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
      </el-tab-pane>

      <!-- Анализы -->
      <el-tab-pane label="Анализы" name="analysis">
        <div class="mb-4 flex justify-between items-center">
          <h4 class="page_title">Анализы</h4>
          <el-button type="primary" @click="openCreateDrawer">
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
      </el-tab-pane>

      <!-- Платные услуги -->
      <el-tab-pane label="Услуги при приёме" name="paidServices">
        <div class="mb-4 flex justify-between items-center">
          <h4 class="page_title">Платные услуги при приёме</h4>
          <el-button type="primary" @click="paidCreateVisible = true">
            <i class="fa-solid fa-plus mr-2"></i>
            Добавить
          </el-button>
        </div>
        <el-table :data="paidServicesData" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="Код" width="120" />
          <el-table-column prop="display" label="Название" />
          <el-table-column prop="price" label="Цена" />
          <el-table-column label="Действия" width="180">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-button type="info" size="small" @click="openShowDrawer(row)">
                  <i class="fa-solid fa-eye"></i>
                </el-button>
                <el-button type="primary" size="small" @click="updatePaidService(row)">
                  <i class="fa-solid fa-pen-to-square"></i>
                </el-button>
                <el-button type="danger" size="small" @click="deletePaidService(row)">
                  <i class="fa-solid fa-trash-can"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Модальные окна -->
    <el-drawer v-model="showDrawerVisible" title="Просмотр" direction="rtl" size="50%">
      <ViewTypes :data="selectedItem" />
    </el-drawer>

    <el-drawer v-model="editDrawerVisible" title="Редактировать" direction="rtl" size="40%">
      <component :is="editComponent" :data="selectedItem" @edit="handleEdit" @cancel="closeEditDrawer" />
    </el-drawer>

    <el-drawer v-model="createDrawerVisible" :title="createTitle" direction="rtl" size="60%">
      <component :is="createComponent" @create="handleCreate" @cancel="closeCreateDrawer" />
    </el-drawer>

    <el-drawer v-model="paidCreateVisible" title="Добавить платный приём" direction="rtl" size="50%">
      <PaidCreateForm @success="successLoadData" />
    </el-drawer>

    <el-drawer v-model="paidUpdateVisible" title="Редактировать платный приём" direction="rtl" size="50%">
      <PaidUpdateForm :data="selectedPaidItem" @success="successLoadData" />
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
import PaidCreateForm from './dialogs/PaidServices/CreateForm.vue'
import PaidUpdateForm from './dialogs/PaidServices/UpdateForm.vue'

const activeTab = ref('services')
const services = servicesStore()

const servicesData = computed(() => services.getEncounterClasses)
const analysisData = computed(() => services.getAnalysisTypes)
const paidServicesData = computed(() => services.getPaidServices)

const loadingData = ref(false)
const showDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const createDrawerVisible = ref(false)
const paidCreateVisible = ref(false)
const paidUpdateVisible = ref(false)

const selectedItem = ref(null)
const selectedPaidItem = ref(null)

const createComponent = computed(() =>
    activeTab.value === 'services' ? CreateForm : CreateAnalysisForm
)
const editComponent = computed(() =>
    activeTab.value === 'services' ? EditForm : EditAnalysisForm
)
const createTitle = computed(() =>
    activeTab.value === 'services' ? 'Добавить сервис' : 'Добавить анализ'
)

onMounted(fetchAll)

async function fetchAll() {
  loadingData.value = true
  await Promise.all([
    services.GET_LIST_OF_ECOUNTER_CLASSES(),
    services.GET_ANALYSIS_TYPES(),
    services.GET_PAID_SERVICES()
  ])
  loadingData.value = false
}

async function changeTab(tab) {
  activeTab.value = tab.props.name
  await fetchAll()
}

function openShowDrawer(row) {
  selectedItem.value = row
  showDrawerVisible.value = true
}

function openEditDrawer(row) {
  selectedItem.value = { ...row }
  editDrawerVisible.value = true
}

function openCreateDrawer() {
  createDrawerVisible.value = true
}

function closeEditDrawer() {
  editDrawerVisible.value = false
}

function closeCreateDrawer() {
  createDrawerVisible.value = false
}

async function handleCreate() {
  await fetchAll()
  createDrawerVisible.value = false
}

async function handleEdit() {
  await fetchAll()
  editDrawerVisible.value = false
}

function updatePaidService(row) {
  selectedPaidItem.value = row
  paidUpdateVisible.value = true
}

async function handleDelete(row) {
  const label = activeTab.value === 'services' ? 'сервис' : 'анализ'
  ElMessageBox.confirm(`Удалить ${label} "${row.display}"?`, 'Подтверждение', {
    confirmButtonText: 'Удалить',
    cancelButtonText: 'Отмена',
    type: 'warning'
  }).then(async () => {
    if (activeTab.value === 'services') {
      await services.DELETE_ENCOUNTER(row.id)
    } else if (activeTab.value === 'analysis') {
      await services.deleteAnalysisType(row.id)
    }
    await fetchAll()
    ElMessage.success(`${label} удален`)
  }).catch(() => {})
}

async function deletePaidService(row) {
  ElMessageBox.confirm(`Удалить услугу "${row.display}"?`, 'Подтверждение', {
    confirmButtonText: 'Удалить',
    cancelButtonText: 'Отмена',
    type: 'warning'
  }).then(async () => {
    await services.DELETE_PAID_SERVICE(row.id)
    await fetchAll()
    ElMessage.success(`Платная услуга удалена`)
  }).catch(() => {})
}

function successLoadData() {
  fetchAll()
  paidCreateVisible.value = false
  paidUpdateVisible.value = false
  editDrawerVisible.value = false
  createDrawerVisible.value = false
  showDrawerVisible.value = false
}
</script>