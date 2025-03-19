<template>
  <div>
    <!-- Заголовок страницы -->
    <div class="pt-2 border-b border-[#eceeef]">
      <div class="relative rounded-lg pb-2 pl-4">
        <el-page-header @back="$router.push('/patient')" class="flex items-center">
          <template #content>
            <h1 class="text-md font-semibold text-gray-800">Детали пациента</h1>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="p-4 relative w-full">
      <!-- Карточка пациента -->
      <el-card class="rounded-lg mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <el-avatar
                :size="64"
                src="https://via.placeholder.com/150"
                class="border border-gray-300"
            />
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ patientData?.last_name }} {{ patientData?.first_name }} {{ patientData?.middle_name }}
              </h1>
              <el-tag type="info" class="mt-1">{{ patientGender }}</el-tag>
            </div>
          </div>
          <el-button @click="openModal" type="primary" class="rounded-md">Создать прием</el-button>
        </div>
      </el-card>

      <el-tabs v-model="activeTab">
        <!-- Информация о пациенте -->
        <el-tab-pane label="Информация о пациенте" name="info">
          <el-card class="mt-6 rounded-lg card-shadow">
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Данные пациента</h2>
              </div>
            </template>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
              <div><span class="font-medium">Возраст:</span> {{ patientAge }} лет</div>
              <div><span class="font-medium">Пол:</span> {{ patientGender }}</div>
              <div><span class="font-medium">Телефон:</span> {{ patientData?.phone_number }}</div>
              <div><span class="font-medium">Email:</span> {{ patientData?.email || 'Не указано' }}</div>
              <div><span class="font-medium">Адрес:</span> {{ patientData?.address || 'Не указано' }}</div>
              <div v-for="id in patientData?.identifier || []" :key="id.value">
                <span class="font-medium">{{ id.display }}:</span> {{ id.value }}
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="История приемов" name="history">
          <AppointmentTable :patientId="route.params.id" />
        </el-tab-pane>

        <!-- Следующее лечение -->
        <el-tab-pane label="Следующее лечение" name="treatment">
          <el-card class="mt-6 rounded-lg card-shadow">
            <h2 class="text-xl font-semibold">Следующее лечение</h2>
            <p class="text-gray-700 mt-2">Нет запланированных процедур.</p>
          </el-card>
        </el-tab-pane>

        <!-- Медицинская карта -->
        <el-tab-pane label="Медицинская карта" name="record">
          <el-card class="mt-6 rounded-lg card-shadow">
            <h2 class="text-xl font-semibold">Медицинская карта</h2>
            <p class="text-gray-700 mt-2">Нет данных.</p>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Диалог создания приема -->
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

const store = patientStore();
const serviceStore = servicesStore();
const appointment = appointmentStore();
const route = useRoute();

const patientId = route.params.id;
const activeTab = ref("info");
const patientData = ref(null);
const loading = ref(false);

// Получаем данные о приёмах (убедитесь, что appointment.getAppointment – реактивное свойство)

onMounted(async () => {
  await fetchPatientData();
});

const fetchPatientData = async () => {
  loading.value = true;
  try {
    const res = await store.GET_BY_ID(patientId);
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