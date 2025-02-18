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

    <div class="p-6 relative w-full">
      <!-- Карточка пациента -->
      <el-card class="rounded-xl mb-6">
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

        </div>
      </el-card>

      <!-- Карточка данных приёма -->
      <el-card class="rounded-xl mb-6">
        <template #header>
          <h2 class="text-xl font-semibold">Детали приема</h2>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
          <div>
            <span class="font-medium">ID приема:</span>
            <span>{{ getAppointmentData?.id }}</span>
          </div>
          <div>
            <span class="font-medium">Статус:</span>
            <span>{{ getAppointmentData?.status }}</span>
          </div>
          <div>
            <span class="font-medium">Тип встречи:</span>
            <span>{{ getAppointmentData?.encounter_type }}</span>
          </div>
          <div>
            <span class="font-medium">Класс встречи:</span>
            <span>{{ getAppointmentData?.encounter_class?.display }}</span>
          </div>
          <div>
            <span class="font-medium">Причина:</span>
            <span>{{ getAppointmentData?.reason_text }}</span>
          </div>
          <div>
            <span class="font-medium">Дата приема:</span>
            <span>{{ formatDate(getAppointmentData?.date) }}</span>
          </div>
          <div>
            <span class="font-medium">Время:</span>
            <span>{{ getAppointmentData?.time }}</span>
          </div>
          <div>
            <span class="font-medium">Организация:</span>
            <span>{{ getAppointmentData?.organization_id }}</span>
          </div>
          <div>
            <span class="font-medium">Создан:</span>
            <span>{{ formatDate(getAppointmentData?.created_at) }}</span>
          </div>
          <div>
            <span class="font-medium">Обновлен:</span>
            <span>{{ formatDate(getAppointmentData?.updated_at) }}</span>
          </div>
        </div>
      </el-card>

      <!-- Карточка слотов приема -->
      <el-card class="rounded-xl mb-6">
        <template #header>
          <h2 class="text-xl font-semibold">Слоты приема</h2>
        </template>
        <el-table :data="getAppointmentData?.slotsDetails" stripe style="width: 100%">
          <el-table-column prop="code" label="Слот"></el-table-column>
          <el-table-column prop="start" label="Начало"></el-table-column>
          <el-table-column prop="end" label="Окончание"></el-table-column>
          <el-table-column prop="minutes_duration" label="Длительность (мин)"></el-table-column>
          <el-table-column prop="status" label="Статус"></el-table-column>
          <el-table-column prop="date" label="Дата"></el-table-column>
        </el-table>
      </el-card>

      <!-- Остальные вкладки, например, информация о пациенте -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Информация о пациенте" name="info">
          <el-card class="mt-6 rounded-xl card-shadow">
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Данные пациента</h2>
              </div>
            </template>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
              <div>
                <span class="font-medium">Возраст:</span>
                <span>{{ patientAge }} лет</span>
              </div>
              <div>
                <span class="font-medium">Пол:</span>
                <span>{{ patientGender }}</span>
              </div>
              <div>
                <span class="font-medium">Телефон:</span>
                <span>{{ patientData?.phone_number }}</span>
              </div>
              <div>
                <span class="font-medium">Email:</span>
                <span>{{ patientData?.email || 'Не указано' }}</span>
              </div>
              <div>
                <span class="font-medium">Адрес:</span>
                <span>{{ patientData?.address || 'Не указано' }}</span>
              </div>
              <div v-for="id in patientData?.identifier || []" :key="id.value">
                <span class="font-medium">{{ id.display }}:</span>
                <span>{{ id.value }}</span>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appointmentStore } from "@/store/appointment";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const appointment = appointmentStore();

const appointmentId = route.params.id;
const loading = ref(false);

// Получаем данные приёма из стора
const getAppointmentData = computed(() => appointment.getAppointmentData);

// Если данные о пациенте вложены в appointment, то можно создать computed для удобства
const patientData = computed(() => getAppointmentData.value?.patient || {});
const patientGender = computed(() => {
  // Если информация о поле есть в данных пациента, выводим её, иначе — значение по умолчанию
  return getAppointmentData.value?.patient?.gender || 'Не указан';
});
const patientAge = computed(() => {
  // Здесь можно вычислить возраст, если в данных есть дата рождения
  return 30;
});

// Функция для форматирования дат
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD.MM.YYYY HH:mm");
};

const openModal = () => {
  // Реализация открытия модального окна для создания приема
  console.log("Открыть модальное окно для создания приема");
};

onMounted(async () => {
  await fetchData();
  console.log("getAppointmentData:", getAppointmentData.value); // для отладки
});

// Функция загрузки данных приёма
const fetchData = async () => {
  loading.value = true;
  try {
    await appointment.GET_BY_ID(appointmentId);
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка загрузки данных приёмов");
  } finally {
    loading.value = false;
  }
};

const activeTab = ref("info");
</script>

<style scoped>
/* Можно добавить свои стили */
</style>