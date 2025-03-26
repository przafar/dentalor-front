<template>
  <div class="content_with_patient flex-1">
    <PatientCard :info="patientData" />

    <div class="w-full">
      <div class="pt-2 border-b border-[#eceeef]">
        <div class="relative rounded-lg pb-2 pl-4">
          <el-page-header @back="$router.push('/patients')" class="flex items-center">
            <template #content>
              <h1 class="text-md font-semibold text-gray-800">Детали пациента</h1>
            </template>
          </el-page-header>
        </div>
      </div>

      <div class="px-4 pt-4 relative w-full flex justify-start">
        <el-button @click="openModal" type="primary" class="rounded-md">Создать прием</el-button>
      </div>

      <div class="p-4 relative w-full">


        <el-tabs v-model="activeTab">
          <el-tab-pane label="Общая информация" name="info">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <Schedule :info="getAppointmentData" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="История приемов" name="history">
            <AppointmentTable :patientId="route.params.id" />
          </el-tab-pane>

          <el-tab-pane label="Исследования" name="treatment">
            <el-card class="mt-6 rounded-lg card-shadow">
              <h2 class="text-xl font-semibold">Следующее лечение</h2>
              <p class="text-gray-700 mt-2">Нет запланированных процедур.</p>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="Документы" name="record">
            <el-card class="mt-6 rounded-lg card-shadow">
              <h2 class="text-xl font-semibold">Медицинская карта</h2>
              <p class="text-gray-700 mt-2">Нет данных.</p>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-dialog
          v-model="isModalVisible"
          title="Создать прием"
          width="50%"
          :before-close="closeModal"
          destroy-on-close
      >
        <CreateAppointmentForm @submit="closeAppointmentForm" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { patientStore } from "@/store/patients";
import { servicesStore } from "@/store/services";
import { appointmentStore } from "@/store/appointments";
import CreateAppointmentForm from "./components/CreateAppointment.vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import AppointmentTable from "./components/AppointmentTable.vue";
import PatientCard from "@/components/patient/PatientCard.vue";
import Schedule from "./components/Schedule.vue"

import femaleIcon from '@/assets/image/female.png'
import maleIcon from '@/assets/image/men.png'


const store = patientStore();
const serviceStore = servicesStore();
const appointment = appointmentStore();
const route = useRoute();

const patientId = route.params.id;
const activeTab = ref("info");
const patientData = ref(null);
const loading = ref(false);


onMounted(async () => {
  await fetchPatientData();
});


const getAppointmentData = computed(() => appointment.getAppointment);

const fetchPatientData = async () => {
  loading.value = true;
  try {
    const res = await store.GET_BY_ID(patientId);
    await appointment.GET_ALL({
      patient_id: patientId,
      page: 1,
      per_page: 20,
    });
    patientData.value = res?.data || {};
  } catch (error) {
    ElMessage.error("Ошибка загрузки данных пациента");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return moment(dateString).format("DD-MM-YYYY");
};

const patientAge = computed(() => {
  if (!patientData.value?.birth_date) return "N/A";
  return moment().diff(moment(patientData.value.birth_date), "years");
});

const patientGender = computed(() => {
  if (patientData.value?.gender === "2") return "Женский";
  if (patientData.value?.gender === "1") return "Мужской";
  return "Не указан";
});

const isModalVisible = ref(false);
const openModal = async () => {
  isModalVisible.value = true;
};
const closeAppointmentForm = async () => {
  isModalVisible.value = false;
  await fetchPatientData();
};
const closeModal = (done) => {
  isModalVisible.value = false;
  if (typeof done === "function") done();
};

const services = ref([{ value: "LA", label: "LA (Лазерная терапия)" }]);

// Функция для редактирования приёма (доработайте по необходимости)
const editAppointment = (row) => {
  console.log("Редактирование приёма:", row);
};

// Функция для удаления приёма (доработайте по необходимости)
const deleteAppointment = (id) => {
  console.log("Удаление приёма с id:", id);
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