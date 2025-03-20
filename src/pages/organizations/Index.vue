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
                @click="createOrganizationDrawer = true"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              Добавить организацию
            </el-button>
          </div>
        </div>
      </div>
      <div>
        <el-table :data="getAllOrganizations" class="custom-table">
          <el-table-column prop="id" label="ID" min-width="50" />
          <el-table-column prop="name_ru" label="Название (RU)" />
          <el-table-column prop="org_type" label="Тип организации" min-width="150" />
          <el-table-column prop="phone_number" label="Телефон" min-width="120" />
          <el-table-column prop="address" label="Адрес" min-width="150" />
          <el-table-column label="Действия" width="150">
            <template #default="scope">
              <div class="flex items-center space-x-2">
                <router-link :to="`/organization/${scope.row.id}`">
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
            :current-page="currentPage"
            :page-size="pageSize"
            :total-items="totalItems"
            @page-changed="handlePageChange"
            @size-changed="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- Drawer для создания организации -->
    <el-drawer
        title="Создать организацию"
        v-model="createOrganizationDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <CreateForm @success="handleCreateSuccess" />
    </el-drawer>

    <!-- Drawer для редактирования организации -->
    <el-drawer
        title="Редактирование организации"
        v-model="updateOrganizationDrawer"
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
import { organizationsStore } from "@/store/organizations";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import CreateForm from "../organizations/components/FormCreate.vue";
import UpdateForm from "../organizations/components/FormUpdate.vue";
import Pagination from "@/components/Pagination.vue";

const store = organizationsStore();
const loading = ref(false);
const createOrganizationDrawer = ref(false);
const updateOrganizationDrawer = ref(false);
const selectedData = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => store.getOrganizationPagination?.total || 0);
const getAllOrganizations = computed(() => store.getOrganizations);

const fetchOrganizations = async () => {
  loading.value = true;
  try {
    await store.GET_LIST_OF_ORGANIZATIONS({
      page: currentPage.value,
      per_page: pageSize.value,
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки списка организаций");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

watch([currentPage, pageSize], fetchOrganizations);

onMounted(fetchOrganizations);

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const openEditDrawer = (data) => {
  selectedData.value = data;
  updateOrganizationDrawer.value = true;
};

const confirmDelete = async (data) => {
  try {
    await ElMessageBox.confirm(
        "Вы уверены, что хотите удалить эту организацию?",
        "Подтверждение удаления",
        {
          confirmButtonText: "Удалить",
          cancelButtonText: "Отмена",
          type: "warning",
        }
    );

    await store.DELETE_ORGANIZATION(data.id);
    await fetchOrganizations();

    ElNotification({
      title: "Успешно",
      message: "Организация успешно удалена.",
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
  await fetchOrganizations();
  updateOrganizationDrawer.value = false;
};

const handleCreateSuccess = async () => {
  await fetchOrganizations();
  createOrganizationDrawer.value = false;
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