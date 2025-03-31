<template>
  <div class="content_with_patient flex-1">
    <PatientCard :info="getAppointmentData?.patient" />
    <div class="w-full">
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
        <div class="flex justify-between items-center">
          <div class=" flex space-x-4">
            <template v-if="isWaitlistOrArrived">
              <el-button type="primary" @click="startWork">Начать работу</el-button>
            </template>
            <template v-else-if="getAppointmentData?.observation && getAppointmentData?.status === 'in-progress'">
              <el-dropdown @command="handleCommand" trigger="click">
                <el-button type="primary">
                  <Icon icon="line-md:list-3-filled" class="text-[16px] " :ssr="true" />
                  <span class="ml-2">Действие</span>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="change">
                      <Icon icon="material-symbols:medical-services-outline" class="text-[20px] text-green-600" :ssr="true" />
                      <span class="text-green-600 font-medium ml-2">Изменить услугу</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="send">
                      <Icon icon="material-symbols:send-outline-rounded" class="text-[20px] text-blue-600" :ssr="true" />
                      <span class="text-blue-600 font-medium ml-2">Отправить для анализа</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="complete">
                      <Icon icon="material-symbols:stop-circle-outline-rounded" class="text-[20px] text-red-600" :ssr="true" />
                      <span class="text-red-600 font-medium ml-2">Завершить прием</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else-if="getAppointmentData?.status === 'completed'">
              <el-button type="success" >
                Распечатать
              </el-button>
            </template>
            <template v-else-if="getAppointmentData?.status === 'in-progress'">
              <el-button type="success" @click="addServices(getAppointmentData)">
                Добавить услуги
              </el-button>
            </template>
          </div>
          <div>
            <div>
              <span>Статус:</span>
              <el-tag class="ml-2" :type="getStatusTag(getAppointmentData?.status).type">
                {{ getStatusTag(getAppointmentData?.status).text }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="mt-4 w-full">
          <el-tab-pane label="Информация о приёме" name="info" class="w-full">
            <div class="w-full">
              <el-card class="rounded-xl w-full mb-2">
                <template #header>
                  <h2 class="text-xl font-semibold">Информация о приёме</h2>
                </template>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="ID приема">
                    {{ getAppointmentData?.id }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Статус">
                    <el-tag :type="getStatusTag(getAppointmentData?.status).type">
                      {{ getStatusTag(getAppointmentData?.status).text }}
                    </el-tag>
                  </el-descriptions-item>

                  <el-descriptions-item label="Класс встречи">
                    {{ getAppointmentData?.encounter_class?.display || '—' }}
                  </el-descriptions-item>

                  <el-descriptions-item label="Дата приема">
                    {{ formatDate(getAppointmentData?.date) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Причина">
                    {{ getAppointmentData?.reason_text || '—' }}
                  </el-descriptions-item>


                  <el-descriptions-item label="Обновлен">
                    {{ formatDate(getAppointmentData?.updated_at) }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>

              <el-card class="mt-4 rounded-xl card-shadow">
                <template #header>
                  <h2 class="text-xl font-semibold">Данные наблюдения</h2>
                </template>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="ID наблюдения">
                    {{ getAppointmentData.observation?.id }}
                  </el-descriptions-item>
                  <el-descriptions-item
                      label="Класс наблюдения"
                      v-if="getAppointmentData.observation?.encounter_class?.length"
                  >
                    <ul>
                      <li
                          v-for="(cls, idx) in getAppointmentData.observation.encounter_class"
                          :key="idx"
                      >
                        {{ cls.display }} ({{ cls.code }})
                      </li>
                    </ul>
                  </el-descriptions-item>
                  <el-descriptions-item
                      label="Тип(ы) наблюдения"
                      v-if="getAppointmentData.observation?.encounter_types?.length"
                  >
                    <ul>
                      <li
                          v-for="(typ, idx) in getAppointmentData.observation.encounter_types"
                          :key="idx"
                      >
                        {{ typ.display }} ({{ typ.code }})
                      </li>
                    </ul>
                  </el-descriptions-item>
                  <el-descriptions-item label="Примечание (note)">
                    {{ getAppointmentData.observation?.note || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Жалобы (complaints)">
                    {{ getAppointmentData.observation?.complaints || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Осмотр (clinical_exam)">
                    {{ getAppointmentData.observation?.clinical_exam || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Лечение (assigned_treatment)">
                    {{ getAppointmentData.observation?.assigned_treatment || '—' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane
              v-if="getAppointmentData?.observation"
              label="Детальная информация о приеме"
              name="observation"
          >
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

      <!-- Drawer для создания наблюдения -->
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

      <!-- Drawer для редактирования наблюдения -->
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

      <!-- Dialog для завершения приема -->
      <el-dialog
          title="Завершить прием"
          v-model="completeObservationVisible"
          width="35%"
      >
        <span>Вы уверены, что хотите завершить прием?</span>
        <div slot="footer" class="dialog-footer mt-4 flex justify-end">
          <el-button type="primary" @click="confirmCompleteObservation">Подтвердить</el-button>
          <el-button @click="completeObservationVisible = false">Отмена</el-button>
        </div>
      </el-dialog>
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
import { ArrowDown } from "@element-plus/icons-vue";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();
const appointment = appointmentStore();

const appointmentId = route.params.id;

const loading = ref(false);
const createObservationVisible = ref(false);
const updateObservationVisible = ref(false);
const completeObservationVisible = ref(false);
const activeTab = ref("info");
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
  console.log(value, "changeService");
};

const handleEditSuccess = () => {
  createObservationVisible.value = false;
  updateObservationVisible.value = false;
  fetchData();
};

const sendForAnalysis = (value) => {
  console.log(value, "sendForAnalysis");
};

const completeObservation = (value) => {
  selectedData.value = value;
  completeObservationVisible.value = true;
};

const confirmCompleteObservation = async () => {
  try {
    await appointment.COMPLETE_APPOINTMENT(appointmentId);
    ElMessage.success("Прием успешно завершен");
    completeObservationVisible.value = false;
    await fetchData();
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка завершения приема");
  }
};

const handleCommand = (command) => {
  const obs = getAppointmentData.value?.observation;
  if (!obs) return;
  switch (command) {
    case "change":
      changeService(obs);
      break;
    case "send":
      sendForAnalysis(obs);
      break;
    case "complete":
      completeObservation(obs);
      break;
  }
};

const goBack = () => {
  router.push("/appointments");
};

const getStatusTag = (status) => {
  switch (status) {
    case "waitlist":
      return {text: "В ожидании", type: "warning"};
    case "booked":
      return {text: "Забронировано", type: "info"};
    case "arrived":
      return {text: "Прибыл", type: "success"};
    case "in-progress":
      return {text: "В процессе", type: "primary"};
    case "completed":
      return {text: "Выполнено", type: "success"};
    case "cancelled":
      return {text: "Отменено", type: "danger"};
    default:
      return {text: status, type: "info"};
  }
};
</script>

<style scoped>
</style>