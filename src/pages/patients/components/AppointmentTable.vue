<template>
  <div class="mt-4">
    <el-table
        :data="getAppointmentData.data"
        style="width: 100%"
        stripe
        v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="Время приема" width="150">
        <template #default="scope">
          <span v-if="scope.row.time">{{ scope.row.time }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Дата приема" width="120">
        <template #default="scope">
          <span v-if="scope.row.date">{{ formatDate(scope.row.date) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Услуга">
        <template #default="scope">
          <span v-if="scope.row.encounter_class && scope.row.encounter_class.display">
            {{ scope.row.encounter_class.display }}
          </span>
          <span v-else>
            {{ scope.row.encounter_class }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Специалист">
        <template #default="scope">
          <span v-if="scope.row.practitioner && scope.row.practitioner.last_name">
            {{ scope.row.practitioner.last_name }} {{ scope.row.practitioner.first_name }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>



      <el-table-column label="Статус" width="140">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status).type">
            {{ getStatusTag(scope.row.status).text }}
          </el-tag>
        </template>
      </el-table-column>



      <el-table-column label="Действия" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editAppointment(scope.row)">
            <i class="fa-solid fa-eye mr-2"></i> Просмотр
          </el-button>
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
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appointmentStore } from "@/store/appointments";
import { ElMessage } from "element-plus";
import moment from "moment";
import Pagination from "@/components/Pagination.vue";

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  }
});

const route = useRoute();
const router = useRouter();
const appointment = appointmentStore();

const patientId = route.params.id || props.patientId;

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

const totalItems = computed(() => getAppointmentData.value?.pagination?.total || 0);
const getAppointmentData = computed(() => appointment.getAppointment);

const fetchData = async () => {
  loading.value = true;
  try {
    await appointment.GET_ALL({
      patient_id: patientId,
      page: currentPage.value,
      per_page: pageSize.value,
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки данных приемов");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
});

const handlePageChange = async (page) => {
  currentPage.value = page;
  await appointment.GET_ALL({
    patient_id: patientId,
    page: page,
    per_page: pageSize.value,
  });
};

const handlePageSizeChange = async (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  await appointment.GET_ALL({
    patient_id: patientId,
    page: currentPage.value,
    per_page: pageSize.value,
  });
};

const formatDate = (dateString) => {
  return moment(dateString).format("DD-MM-YYYY");
};

const editAppointment = (appointment) => {
  router.push({ name: 'appointments-show', params: { id: appointment.id } });
};

const deleteAppointment = (id) => {
  console.log("Удалить appointment с id", id);
};

const getStatusTag = (status) => {
  switch (status) {
    case 'waitlist':
      return { text: 'в ожидании', type: 'warning' };
    case 'booked':
      return { text: 'забронировано', type: 'info' };
    case 'arrived':
      return { text: 'прибыл', type: 'success' };
    case 'in-progress':
      return { text: 'в процессе', type: 'primary' };
    case 'fulfilled':
      return { text: 'выполнено', type: 'success' };
    case 'cancelled':
      return { text: 'Отменено', type: 'danger' };
    default:
      return { text: status, type: 'info' };
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
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 600;
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