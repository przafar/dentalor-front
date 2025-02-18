<template>
  <div>
    <div class="pt-2 border-b  border-[#eceeef]">
      <div class="relative rounded-lg pb-2 pl-4">
        <el-page-header @back="$router.push('/')" class="flex items-center">
          <template #content>
            <h1 class="text-md font-semibold text-gray-800">Пациенты</h1>
          </template>
        </el-page-header>
      </div>
    </div>
    <div class="flex flex-col p-4">
      <div >
        <div class="mb-4 flex justify-between items-center">
          <div>
          </div>
          <div>
            <el-button class="rounded-md" id="el_button" type="success" icon="el-icon-circle-plus" @click="createPatientDrawer = true">
              <i class="fa-solid fa-plus mr-2"></i>
              Добавить пациента
            </el-button>
          </div>
        </div>
<!--        <div class="bg-[#]">-->
<!--          <FormFilter :initialFilters="filters" @update:filters="updateFilters"  />-->
<!--        </div>-->
      </div>
      <div>

        <el-table
            :data="getAllPatients"
            class="custom-table"
        >
          <el-table-column prop="id" label="ID" min-width="20" />

          <el-table-column prop="full_name" label="ФИО" />

          <el-table-column prop="gender" :formatter="formatGender" label="Пол" />

          <el-table-column label="Год рождения" min-width="120">
            <template #default="scope">
              <span v-if="scope.row.birth_date">
                {{ scope.row.birth_date }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="Телефон" min-width="100">
            <template #default="scope">
              <span>{{ scope.row.phone_number }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Действия" width="150">
            <template #default="scope">
              <div class="flex items-center space-x-2">
                <router-link :to="`/patient/${scope.row.id}`">
                  <el-button type="info" size="small" class="rounded-md">
                    <i class="fa-solid fa-eye"></i>
                  </el-button>
                </router-link>
                <el-button type="primary" size="small" @click="openEditDrawer(scope.row)" class="rounded-md">
                  <i class="fa-solid fa-pen-to-square"></i>
                </el-button>
                <el-button type="danger" size="small" @click="confirmDelete(scope.row)" class="rounded-md">
                  <i class="fa-solid fa-trash-can"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <Pagination
            class="mt-4"
            :current-page="currentPage"
            :page-size="pageSize"
            :total-items="totalItems"
            @page-changed="handlePageChange"
            @size-changed="handlePageSizeChange"
        />
      </div>

    </div>

    <el-drawer
        title="Создать пациента"
        v-model="createPatientDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <CreateForm
          @success="handleCreateSuccess"
      />
    </el-drawer>

    <el-drawer
        title="Редактирования пациента"
        v-model="updatePatientDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <UpdateForm
          :initialData="selectedData"
          @success="handleEditSuccess"
      />
    </el-drawer>
  </div>


</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { patientStore } from '@/store/patient';
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus';
import CreateForm from "../patient/components/FormCreate.vue";
import UpdateForm from "../patient/components/FormUpdate.vue";
import Pagination from "@/components/Pagination.vue";

const store = patientStore();
const loading = ref(false);
const createPatientDrawer = ref(false);
const updatePatientDrawer = ref(false);

const selectedData = ref(null);

// 🔹 Параметры пагинации
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => store.patientsPagination?.total || 0);
const getAllPatients = computed(() => store.getPatients);

// 🔹 Функция загрузки списка пациентов
const fetchFormController = async () => {
  loading.value = true;
  try {
    await store.GET_ALL({
      page: currentPage.value,
      per_page: pageSize.value
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки списка пациентов");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 🔹 Обновление данных при изменении страницы или размера страницы
watch([currentPage, pageSize], () => {
  fetchFormController();
});

// 🔹 Загружаем данные при монтировании компонента
onMounted(fetchFormController);

// 🔹 Обработчик смены страницы
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 🔹 Обработчик смены размера страницы
const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // Сбрасываем на первую страницу
};

const openEditDrawer = (data) => {
  selectedData.value = data;
  updatePatientDrawer.value = true;
};

// 🔹 Удаление пациента
const confirmDelete = async (data) => {
  try {
    await ElMessageBox.confirm(
        "Вы уверены, что хотите удалить этого пациента?",
        "Подтверждение удаления",
        {
          confirmButtonText: "Удалить",
          cancelButtonText: "Отмена",
          type: "warning",
        }
    );

    await store.DELETE_PATIENT(data.id);
    await fetchFormController();

    ElNotification({
      title: "Успешно",
      message: "Пациент успешно удален.",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    if (error !== "cancel") {
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка при удалении.",
        type: "error",
        duration: 3000,
      });
      console.error("Ошибка при удалении:", error);
    }
  }
};

const handleEditSuccess = async () => {
  await fetchFormController();
  updatePatientDrawer.value = false;
};

const handleCreateSuccess = async () => {
  await fetchFormController();
  createPatientDrawer.value = false;
};
</script>
<style scoped>
.filters {
  margin-bottom: 20px;
}
.add-button-row {
  margin: 20px 0;
}
.pagination {
  text-align: right;
}
#el_button {
  padding-left: 0;
}

.custom-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
}

/* Стили заголовка (header) */
::v-deep(.el-table__header-wrapper thead th) {
  background-color: #f3f4f6; /* Светло-серый фон */
  color: #374151; /* Темный текст */
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* Закругленные углы таблицы */
::v-deep(.el-table__inner-wrapper) {
  border-radius: 12px;
  overflow: hidden;
}

/* Стили строк таблицы */
::v-deep(.el-table__row) {
  transition: background 0.2s ease-in-out;
}

/* Подсветка строки при наведении */
::v-deep(.el-table__row:hover) {
  background-color: #f9fafb;

}

/* Обрезаем границы у первой и последней строки */
::v-deep(.el-table__row:first-child td:first-child) {
  border-top-left-radius: 12px;
}
::v-deep(.el-table__row:first-child td:last-child) {
  border-top-right-radius: 12px;
}
::v-deep(.el-table__row:last-child td:first-child) {
  border-bottom-left-radius: 12px;
}
::v-deep(.el-table__row:last-child td:last-child) {
  border-bottom-right-radius: 12px;
}
</style>
