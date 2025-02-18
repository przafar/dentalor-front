<template>
  <div class="mt-4">
    <el-table :data="getAppointmentData.data" style="width: 100%" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
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
      <el-table-column prop="reason_text" label="Причина приема"></el-table-column>
      <el-table-column prop="status" label="Статус" width="100"></el-table-column>
      <el-table-column label="Дата приема" width="120">
        <template #default="scope">
          <span v-if="scope.row.date">{{ formatDate(scope.row.date) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Время приема" width="150">
        <template #default="scope">
          <span v-if="scope.row.time">{{ scope.row.time }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="Слоты" width="200">-->
<!--        <template #default="scope">-->
<!--          <span v-if="scope.row.slotsDetails && scope.row.slotsDetails.length > 0">-->
<!--            <span v-for="slot in scope.row.slotsDetails" :key="slot.id">-->
<!--              {{ slot.start }}–{{ slot.end }};&nbsp;-->
<!--            </span>-->
<!--          </span>-->
<!--          <span v-else>-</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="Действия" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editAppointment(scope.row)"><i class="fa-solid fa-eye mr-2"></i> Просмотр</el-button>
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
import { useRoute } from "vue-router";
import { patientStore } from "@/store/patient";
import { appointmentStore } from "@/store/appointment";
import { ElMessage } from "element-plus";
import moment from "moment";
import Pagination from '@/components/Pagination.vue';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  }
});

const store = patientStore();
const appointment = appointmentStore();
const route = useRoute();

const patientId = route.params.id || props.patientId;

const patientData = ref(null);
const loading = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => getAppointmentData.value?.pagination?.total || 0);

const getAppointmentData = computed(() => appointment.getAppointment);

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await store.GET_BY_ID(patientId);
    patientData.value = res?.data || {};

    await appointment.GET_ALL({
      patient_id: patientId,
      page: currentPage.value,
      per_page: pageSize.value
    });
  } catch (error) {
    ElMessage.error("Ошибка загрузки данных пациента");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  await appointment.GET_ALL({
    patient_id: patientId,
    page: page,
    per_page: pageSize.value
  });
};
const handlePageSizeChange = async (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  await appointment.GET_ALL({
    patient_id: patientId,
    page: currentPage.value,
    per_page: pageSize.value
  });
};

const formatDate = (dateString) => {
  return moment(dateString).format("DD-MM-YYYY");
};

const editAppointment = (appointment) => {
  console.log("Редактировать", appointment);
};

const deleteAppointment = (id) => {
  console.log("Удалить appointment с id", id);
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