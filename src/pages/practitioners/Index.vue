<template>
  <div>
    <div class="flex flex-col p-4">
      <div>
        <div class="mb-4 flex justify-between items-center">
          <div></div>
          <div>
            <el-button
                class="rounded-md"
                id="el_button"
                type="success"
                icon="el-icon-circle-plus"
                @click="createPractitionerDrawer = true"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              Добавить практикующего
            </el-button>
          </div>
        </div>
      </div>
      <div>
        <el-table :data="getAllPractitioners" class="custom-table">
          <el-table-column prop="id" label="ID" min-width="50" />
          <el-table-column label="ФИО" min-width="200">
            <template #default="scope">
              <span>
                {{ scope.row.last_name }} {{ scope.row.first_name }} {{ scope.row.middle_name || '' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="Организация" min-width="100">
            <template #default="scope">
              <span>
                {{ scope.row.organization ? scope.row.organization.name_ru : 'Не указано' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="phone_number" label="Телефон" min-width="120" />
          <el-table-column prop="address" label="Адрес" min-width="150" />
          <el-table-column label="Действия" width="150">
            <template #default="scope">
              <div class="flex items-center space-x-2">
                <router-link :to="`/practitioner/${scope.row.id}`">
                  <el-button type="info" size="small" class="rounded-md">
                    <i class="fa-solid fa-eye"></i>
                  </el-button>
                </router-link>
                <el-button
                    type="primary"
                    size="small"
                    @click="openEditDrawer(scope.row)"
                    class="rounded-md"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="confirmDelete(scope.row)"
                    class="rounded-md"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <Pagination
            class="mt-4"
            :current-page="getPractitionerPagination.current_page"
            :page-size="getPractitionerPagination.per_page"
            :total-items="getPractitionerPagination.total"
            @page-changed="handlePageChange"
            @size-changed="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- Drawer для создания практикующего -->
    <el-drawer
        title="Создать практикующего"
        v-model="createPractitionerDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <CreateForm @success="handleCreateSuccess" />
    </el-drawer>

    <!-- Drawer для редактирования практикующего -->
    <el-drawer
        title="Редактирование практикующего"
        v-model="updatePractitionerDrawer"
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
import { practitionersStore } from "@/store/practitioners";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import CreateForm from "../practitioners/components/FormCreate.vue";
import UpdateForm from "../practitioners/components/FormUpdate.vue";
import Pagination from "@/components/Pagination.vue";

const store = practitionersStore();
const loading = ref(false);
const createPractitionerDrawer = ref(false);
const updatePractitionerDrawer = ref(false);
const selectedData = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);
const getPractitionerPagination = computed(() => store.getPractitionerPagination);
const getAllPractitioners = computed(() => store.getPractitioners);

const fetchPractitioners = async () => {
  loading.value = true;
  try {
    await store.GET_LIST_OF_PRACTITIONERS({
      page: currentPage.value,
      per_page: pageSize.value,
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки списка практикующих");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

watch([currentPage, pageSize], fetchPractitioners);

onMounted(fetchPractitioners);

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const openEditDrawer = (data) => {
  selectedData.value = data;
  updatePractitionerDrawer.value = true;
};

const confirmDelete = async (data) => {
  try {
    await ElMessageBox.confirm(
        "Вы уверены, что хотите удалить этого практикующего?",
        "Подтверждение удаления",
        {
          confirmButtonText: "Удалить",
          cancelButtonText: "Отмена",
          type: "warning",
        }
    );

    await store.DELETE_PRACTITIONER(data.id);
    await fetchPractitioners();

    ElNotification({
      title: "Успешно",
      message: "Практикующий успешно удалён.",
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
  await fetchPractitioners();
  updatePractitionerDrawer.value = false;
};

const handleCreateSuccess = async () => {
  await fetchPractitioners();
  createPractitionerDrawer.value = false;
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

::v-deep(.el-table__header-wrapper thead th) {
  background-color: #f3f4f6;
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

::v-deep(.el-table__row:hover) {
  background-color: #f9fafb;
}

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