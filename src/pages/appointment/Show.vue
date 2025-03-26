<template>
  <div class="content_with_patient flex-1">
    <PatientCard :info="getAppointmentData?.patient" />
    <div>
      <div class="pt-2 border-b border-[#eceeef]">
        <div class="relative rounded-lg pb-2 pl-4">
          <el-page-header @back="goBack" class="flex items-center">
            <template #content>
              <h1 class="text-md font-semibold text-gray-800">Детали приема</h1>
            </template>
          </el-page-header>
        </div>
      </div>

      <div class="p-4 w-full">

        <div class="mt-4 flex space-x-4">
          <template v-if="isWaitlistOrArrived">
            <el-button type="primary" @click="startWork">Начать работу</el-button>
          </template>
          <template v-else-if="getAppointmentData?.observation">
            <el-button type="success" @click="changeService(getAppointmentData.observation)">
              Изменить услугу
            </el-button>
          </template>
          <template v-else-if="getAppointmentData?.status === 'in-progress'">
            <el-button type="success" @click="addServices(getAppointmentData)">
              Добавить услуги
            </el-button>
          </template>
        </div>



        <el-tabs v-model="activeTab" class="mt-4">
          <el-tab-pane label="Информация о приёме" name="info" class="w-full">
            <div class="w-full">
              <el-card class="rounded-xl w-full my-6">
                <template #header>
                  <h2 class="text-xl font-semibold">Информация о приёме</h2>
                </template>

                <!-- Первая строка -->
                <el-row :gutter="20" type="flex" align="stretch">
                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>ID приема:</strong>
                      <span>{{ getAppointmentData?.id }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Статус:</strong>
                      <el-tag :type="getStatusTag(getAppointmentData?.status).type">
                        {{ getStatusTag(getAppointmentData?.status).text }}
                      </el-tag>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Тип встречи:</strong>
                      <span>{{ getAppointmentData?.encounter_type || '—' }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Класс встречи:</strong>
                      <span>{{ getAppointmentData?.encounter_class?.display || '—' }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Причина:</strong>
                      <span>{{ getAppointmentData?.reason_text || '—' }}</span>
                    </div>
                  </el-col>
                </el-row>

                <!-- Вторая строка -->
                <el-row :gutter="20" type="flex" align="stretch" class="mt-4">
                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Дата приема:</strong>
                      <span>{{ formatDate(getAppointmentData?.date) }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Время:</strong>
                      <span>{{ getAppointmentData?.time || '—' }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Организация (ID):</strong>
                      <span>{{ getAppointmentData?.organization_id }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Создан:</strong>
                      <span>{{ formatDate(getAppointmentData?.created_at) }}</span>
                    </div>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="12">
                    <div>
                      <strong>Обновлен:</strong>
                      <span>{{ formatDate(getAppointmentData?.updated_at) }}</span>
                    </div>
                  </el-col>
                </el-row>
              </el-card>

              <el-card class="rounded-xl w-full mb-4">
                <template #header>
                  <h2 class="text-xl font-semibold">Слоты приема</h2>
                </template>
                <el-table
                    :data="getAppointmentData?.slotsDetails"
                    stripe
                    style="width: 100%"
                    empty-text="Нет данных"
                >
                  <el-table-column prop="code" label="Слот" />
                  <el-table-column prop="start" label="Начало" />
                  <el-table-column prop="end" label="Окончание" />
                  <el-table-column prop="minutes_duration" label="Длительность (мин)" />
                  <el-table-column prop="status" label="Статус" />
                  <el-table-column prop="date" label="Дата" />
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane
              v-if="getAppointmentData?.observation"
              label="Осмотр врача"
              name="observation"
          >
            <el-card class="mt-4 rounded-xl card-shadow">
              <template #header>
                <h2 class="text-xl font-semibold">Данные наблюдения</h2>
              </template>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
                <div>
                  <span class="font-medium">ID наблюдения:</span>
                  <span>{{ getAppointmentData.observation.id }}</span>
                </div>

                <!-- Пример: Encounter Class (массив объектов) -->
                <div v-if="getAppointmentData.observation.encounter_class?.length">
                  <span class="font-medium">Класс наблюдения:</span>
                  <ul>
                    <li
                        v-for="(cls, idx) in getAppointmentData.observation.encounter_class"
                        :key="idx"
                    >
                      {{ cls.display }} ({{ cls.code }})
                    </li>
                  </ul>
                </div>

                <!-- Пример: Encounter Types (массив объектов) -->
                <div v-if="getAppointmentData.observation.encounter_types?.length">
                  <span class="font-medium">Тип(ы) наблюдения:</span>
                  <ul>
                    <li
                        v-for="(typ, idx) in getAppointmentData.observation.encounter_types"
                        :key="idx"
                    >
                      {{ typ.display }} ({{ typ.code }})
                    </li>
                  </ul>
                </div>

                <!-- Остальные поля Observation -->
                <div>
                  <span class="font-medium">Примечание (note):</span>
                  <span>{{ getAppointmentData.observation.note || '—' }}</span>
                </div>
                <div>
                  <span class="font-medium">Жалобы (complaints):</span>
                  <span>{{ getAppointmentData.observation.complaints || '—' }}</span>
                </div>
                <div>
                  <span class="font-medium">Осмотр (clinical_exam):</span>
                  <span>{{ getAppointmentData.observation.clinical_exam || '—' }}</span>
                </div>
                <div>
                  <span class="font-medium">Лечение (assigned_treatment):</span>
                  <span>{{ getAppointmentData.observation.assigned_treatment || '—' }}</span>
                </div>
              </div>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="История" name="history">
            <el-card class="mt-4 rounded-xl card-shadow">
              <template #header>
                <h2 class="text-xl font-semibold">История статусов</h2>
              </template>
              <el-table
                  :data="getAppointmentData?.history || []"
                  stripe
                  style="width: 100%"
                  empty-text="Нет истории"
              >
                <el-table-column prop="action" label="Действие" width="150" />

                <el-table-column prop="status" label="Статус" width="150" />
                <el-table-column prop="user" label="Пользователь" />
              </el-table>
            </el-card>
          </el-tab-pane>

        </el-tabs>
      </div>

      <el-drawer
          title="Услуги"
          v-model="createObservationVisible"
          direction="rtl"
          size="40%"
          destroy-on-close
      >
        <FormCreateObservation
            :initialData="selectedData"
            @success="handleEditSuccess"
        />
      </el-drawer>


      <el-drawer
          title="Услуги"
          v-model="updateObservationVisible"
          direction="rtl"
          size="40%"
          destroy-on-close
      >
        <FormUpdateObservation
            :initialData="selectedData"
            @success="handleEditSuccess"
        />
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appointmentStore } from "@/store/appointments";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import FormCreateObservation from "./components/FormCreateObservation.vue";
import FormUpdateObservation from "./components/FormUpdateObservation.vue";
import PatientCard from "@/components/patient/PatientCard.vue";

const route = useRoute();
const router = useRouter();
const appointment = appointmentStore();

const appointmentId = route.params.id;

const loading = ref(false);
const createObservationVisible = ref(false);
const updateObservationVisible = ref(false);
const activeTab = ref("info"); // активная вкладка
const selectedData = ref(null);

const getAppointmentData = computed(() => appointment.getAppointmentData);


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD.MM.YYYY HH:mm");
};

const isWaitlistOrArrived = computed(() => {
  const status = getAppointmentData.value?.status;
  return status === "waitlist" || status === "booked";
});

// Методы
const fetchData = async () => {
  loading.value = true;
  try {
    await appointment.GET_BY_ID(appointmentId);
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка загрузки данных приема");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const startWork = async () => {
  try {
    await appointment.UPDATE_APPOINTMENT_STATUS(appointmentId, { status: "in-progress" });
    ElMessage.success("Прием переведен в режим in-progress");
    await fetchData();
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка обновления статуса приема");
  }
};

const addServices = (value) => {
  createObservationVisible.value = true;
  selectedData.value = value;
};
const changeService = (value) => {
  updateObservationVisible.value = true;
  selectedData.value = value;
  console.log(value, 'wwww')
};

const handleEditSuccess = () => {
  createObservationVisible.value = false;
  fetchData();
};

const goBack = () => {
  router.push("/appointments");
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
</style>