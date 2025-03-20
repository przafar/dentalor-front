<template>
  <div>
    <FilterForm @apply="applyFilters" @reset="resetFilters" />

    <div class="flex flex-col p-4">
      <div class="mb-4 flex justify-between items-center">
        <div></div>
        <div>
          <el-button
              class="rounded-md"
              id="el_button"
              type="success"
              @click="createPatientDrawer = true"
          >
            <i class="fa-solid fa-plus mr-2"></i>
            Добавить пациента
          </el-button>
        </div>
      </div>
      <div>
        <el-table :data="getAllPatients" class="custom-table" stripe>
          <el-table-column prop="id" label="ID" min-width="30" />
          <el-table-column prop="full_name" label="ФИО" min-width="180" />
          <el-table-column prop="gender" :formatter="formatGender" label="Пол" />
          <el-table-column label="Дата рождения" min-width="120">
            <template #default="scope">
              <span v-if="scope.row.birth_date">{{ scope.row.birth_date }}</span>
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
      <CreateForm @success="handleCreateSuccess" />
    </el-drawer>

    <el-drawer
        title="Редактирование пациента"
        v-model="updatePatientDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <UpdateForm :initialData="selectedData" @success="handleEditSuccess" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { patientStore } from "@/store/patients";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import CreateForm from "./components/FormCreate.vue";
import UpdateForm from "./components/FormUpdate.vue";
import FilterForm from "./components/FilterForm.vue";
import Pagination from "@/components/Pagination.vue";
import moment from "moment";

const store = patientStore();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const createPatientDrawer = ref(false);
const updatePatientDrawer = ref(false);
const selectedData = ref(null);

const currentPage = ref(Number(route.query.page) || 1);
const pageSize = ref(Number(route.query.per_page) || 10);
const totalItems = computed(() => store.getPatientPagination?.total || 0);
const getAllPatients = computed(() => store.getPatients);

const filters = ref({
  last_name: route.query.last_name || "",
  first_name: route.query.first_name || "",
  middle_name: route.query.middle_name || "",
  birth_date: route.query.birth_date || "",
  phone_number: route.query.phone_number || ""
});

const fetchData = async (filterParams = {}) => {
  loading.value = true;
  try {
    await store.GET_ALL({
      page: currentPage.value,
      per_page: pageSize.value,
      ...filterParams
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки списка пациентов");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const updateRouteQuery = () => {
  router.push({
    query: {
      ...route.query,
      page: currentPage.value,
      per_page: pageSize.value,
      last_name: filters.value.last_name,
      first_name: filters.value.first_name,
      middle_name: filters.value.middle_name,
      birth_date: filters.value.birth_date,
      phone_number: filters.value.phone_number
    }
  });
};

onMounted(() => {
  fetchData(filters.value);
});

const handlePageChange = async (page) => {
  currentPage.value = page;
  updateRouteQuery();
  await fetchData(filters.value);
};

const handlePageSizeChange = async (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  updateRouteQuery();
  await fetchData(filters.value);
};

const formatGender = (row) => {
  return row.gender === "male"
      ? "Мужской"
      : row.gender === "female"
          ? "Женский"
          : "Не указан";
};

const openEditDrawer = (data) => {
  selectedData.value = data;
  updatePatientDrawer.value = true;
};

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
    await fetchData(filters.value);
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
  await fetchData(filters.value);
  updatePatientDrawer.value = false;
};

const handleCreateSuccess = async () => {
  await fetchData(filters.value);
  createPatientDrawer.value = false;
};

function applyFilters(newFilters) {
  filters.value = { ...newFilters };
  currentPage.value = 1;
  updateRouteQuery();
  fetchData(filters.value);
}

function resetFilters() {
  filters.value = {
    last_name: "",
    first_name: "",
    middle_name: "",
    birth_date: "",
    phone_number: ""
  };
  currentPage.value = 1;
  updateRouteQuery();
  fetchData();
}
</script>

<style scoped>
.custom-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
}
::v-deep(.el-table__header-wrapper thead th) {
  background-color: #f6f8fa;
  color: #374151;
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
}
::v-deep(.el-table__inner-wrapper) {
  border-radius: 12px;
  overflow: hidden;
}
::v-deep(.el-table__row) {
  transition: background 0.2s ease-in-out;
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