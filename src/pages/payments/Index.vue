<template>
  <div>
    <FilterForm @apply="applyFilters" @reset="resetFilters" />

    <div class="flex flex-col p-4">
      <div class="mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Список платежей</h1>
      </div>

      <el-table :data="getPayments" stripe class="custom-table">
        <el-table-column prop="id" label="ID" min-width="30" />
        <el-table-column label="Ф.И.О">
          <template #default="scope">
            <span>
              {{ scope.row.patient.last_name }} {{ scope.row.patient.first_name }} {{ scope.row.patient.middle_name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Сумма" />
        <el-table-column label="Дата платежа">
          <template #default="scope">
            <span v-if="scope.row.payment_date">{{ formatDate(scope.row.created_at) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Статус приёма">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.appointment.status).type">
              {{ getStatusTag(scope.row.appointment.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Статус">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'paid' ? 'success' : 'danger'">
              {{ scope.row.status === 'paid' ? 'Оплачен' : 'Не оплачен' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Действия" min-width="80">
          <template #default="scope">
            <div class="flex items-center space-x-2">
              <el-button type="info" size="small" @click="openViewDialog(scope.row)" class="rounded-md">
                <Icon icon="material-symbols:visibility" class="text-[18px]" :ssr="true" />
              </el-button>
              <el-button type="primary" size="small" @click="openUpdateDrawer(scope.row)" class="rounded-md">
                <Icon icon="material-symbols:edit-rounded" class="text-[18px]" :ssr="true" />
              </el-button>
              <el-button type="danger" size="small" @click="confirmDelete(scope.row)" class="rounded-md">
                <Icon icon="material-symbols:delete-rounded" class="text-[18px]" :ssr="true" />
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

    <!-- Диалог для обновления платежа -->
    <el-dialog
        title="Редактировать платеж"
        v-model="updatePaymentDrawer"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <PaymentUpdateForm :initialData="selectedPayment" @success="handleUpdateSuccess" />
    </el-dialog>

    <!-- Диалог для просмотра платежа -->
    <el-dialog
        title="Просмотр платежа"
        v-model="viewPaymentDialog"
        direction="rtl"
        size="40%"
        destroy-on-close
    >
      <PaymentViewForm :payment="selectedPaymentForView" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { paymentsStore } from "@/store/paymentsStore";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import FilterForm from "./components/FilterForm.vue";
import Pagination from "@/components/Pagination.vue";
import PaymentUpdateForm from "./components/PaymentUpdateForm.vue";
import PaymentViewForm from "./components/PaymentViewForm.vue";
import moment from "moment";
import { Icon } from "@iconify/vue";

const store = paymentsStore();
const router = useRouter();
const route = useRoute();

const updatePaymentDrawer = ref(false);
const viewPaymentDialog = ref(false);
const selectedPayment = ref(null);
const selectedPaymentForView = ref(null);

const currentPage = ref(Number(route.query.page) || 1);
const pageSize = ref(Number(route.query.per_page) || 10);
const totalItems = computed(() => store.getPaymentPagination?.total || 0);
const getPayments = computed(() => store.getPayments);

const filters = ref({
  payment_type: route.query.payment_type || ""
});

const fetchData = async (filterParams = {}) => {
  try {
    await store.GET_PAYMENTS({ page: currentPage.value, per_page: pageSize.value, ...filterParams });
  } catch (error) {
    ElMessage.error("Ошибка загрузки платежей");
    console.error(error);
  }
};

onMounted(() => {
  fetchData(filters.value);
});

const updateRouteQuery = () => {
  router.push({
    query: {
      ...route.query,
      page: currentPage.value,
      per_page: pageSize.value,
      payment_type: filters.value.payment_type
    }
  });
};

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

const openUpdateDrawer = (payment) => {
  selectedPayment.value = payment;
  updatePaymentDrawer.value = true;
};

const openViewDialog = (payment) => {
  selectedPaymentForView.value = payment;
  viewPaymentDialog.value = true;
};

const confirmDelete = async (payment) => {
  try {
    await ElMessageBox.confirm(
        "Вы уверены, что хотите удалить этот платеж?",
        "Подтверждение удаления",
        {
          confirmButtonText: "Удалить",
          cancelButtonText: "Отмена",
          type: "warning",
        }
    );
    await store.DELETE_PAYMENT(payment.id);
    await fetchData(filters.value);
    ElNotification({
      title: "Успешно",
      message: "Платеж успешно удален.",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    if (error !== "cancel") {
      ElNotification({
        title: "Ошибка",
        message: "Ошибка при удалении платежа.",
        type: "error",
        duration: 3000,
      });
      console.error("Ошибка удаления:", error);
    }
  }
};

const handleUpdateSuccess = async () => {
  await fetchData(filters.value);
  updatePaymentDrawer.value = false;
};

function applyFilters(newFilters) {
  filters.value = { ...newFilters };
  currentPage.value = 1;
  updateRouteQuery();
  fetchData(filters.value);
}

function resetFilters() {
  filters.value = { payment_type: "" };
  currentPage.value = 1;
  updateRouteQuery();
  fetchData();
}

const formatDate = (date) => moment(date).format("DD-MM-YYYY HH:mm");

const getStatusTag = (status) => {
  switch (status) {
    case "waitlist":
      return { text: "В ожидании", type: "warning" };
    case "booked":
      return { text: "Забронировано", type: "info" };
    case "arrived":
      return { text: "Прибыл", type: "success" };
    case "in-progress":
      return { text: "В процессе", type: "primary" };
    case "completed":
      return { text: "Выполнено", type: "success" };
    case "cancelled":
      return { text: "Отменено", type: "danger" };
    default:
      return { text: status, type: "info" };
  }
};
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