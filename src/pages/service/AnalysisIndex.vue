<template>
  <div class="p-4">
    <!-- Вкладки -->
    <el-tabs v-model="activeTab" @tab-click="changeTab">
      <!-- Вкладка Сервисы -->
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

      <!-- Вкладка Анализы -->
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

    <!-- Drawer для просмотра -->
    <el-drawer
        title="Просмотр"
        v-model="showDrawerVisible"
        direction="rtl"
        size="50%">
      <ViewTypes :data="selectedItem" />
    </el-drawer>

    <!-- Drawer для редактирования -->
    <el-drawer
        title="Редактировать"
        v-model="editDrawerVisible"
        direction="rtl"
        size="40%">
      <EditForm :data="selectedItem" @edit="handleEdit" @cancel="closeEditDrawer" />
    </el-drawer>

    <!-- Drawer для создания -->
    <el-drawer
        :title="activeTab === 'services' ? 'Добавить сервис' : 'Добавить анализ'"
        v-model="createDrawerVisible"
        direction="rtl"
        size="40%">
      <!-- Компонент формы принимает параметр mode для различения создания сервиса и анализа -->
      <CreateForm @create="handleCreate" @cancel="closeCreateDrawer" :mode="activeTab" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// Импортируем store для сервисов и анализов
import { servicesStore } from '@/store/services'
import { analysisStore } from '@/store/analysis'

// Импорт компонентов для просмотра, создания и редактирования
import ViewTypes from './components/ViewTypes.vue'
import CreateForm from './dialogs/encounterClasses/CreateForm.vue'
import EditForm from './dialogs/encounterClasses/EditForm.vue'

const activeTab = ref('services')

// Получаем данные из store
const services = servicesStore()
const analysis = analysisStore()

// Вывод данных для таблиц
const servicesData = computed(() => services.getEncounterClasses)
const analysisData = computed(() => analysis.getAnalysisTypes)

// Видимость drawer'ов и выбранный элемент
const showDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const createDrawerVisible = ref(false)
const selectedItem = ref(null)

// При загрузке компонента получаем данные для активной вкладки
onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  if (activeTab.value === 'services') {
    await services.GET_LIST_OF_ECOUNTER_CLASSES()
  } else if (activeTab.value === 'analysis') {
    await analysis.GET_ANALYSIS_TYPES()
  }
}

// При переключении вкладок обновляем данные
const changeTab = async (tab) => {
  activeTab.value = tab.name
  await fetchData()
}

// Открыть drawer для просмотра
const openShowDrawer = async (row, mode) => {
  selectedItem.value = row
  // Если это сервис, можно получить дополнительные данные, например, типы сервиса
  if (mode === 'services') {
    await services.GET_LIST_OF_ECOUNTER_TYPES(row.code)
  }
  showDrawerVisible.value = true
}

// Открыть drawer для редактирования
const openEditDrawer = (row, mode) => {
  selectedItem.value = { ...row }
  editDrawerVisible.value = true
}

// Открыть drawer для создания (режим зависит от активной вкладки)
const openCreateDrawer = (mode) => {
  createDrawerVisible.value = true
}

// Обработчик создания — обновляем данные и закрываем форму
const handleCreate = async () => {
  await fetchData()
  createDrawerVisible.value = false
}

// Обработчик редактирования — обновляем данные и закрываем форму
const handleEdit = async () => {
  await fetchData()
  editDrawerVisible.value = false
}

// Обработка удаления
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
      .then(() => {
        if (mode === 'services') {
          services.deleteEncounterClass(row.id)
        } else if (mode === 'analysis') {
          analysis.deleteAnalysisType(row.id)
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