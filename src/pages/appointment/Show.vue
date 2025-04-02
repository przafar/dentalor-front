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
                    <el-dropdown-item :disabled="getAppointmentData.prescriptions && getAppointmentData.prescriptions.length" command="reciept">
                      <Icon icon="material-symbols:lab-profile-outline-rounded" class="text-[20px] text-blue-600" :ssr="true" />
                      <span class="text-blue-600 font-medium ml-2">Добавить рецепт</span>
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
              <el-button @click="returnAppointment" type="info" >
                <Icon icon="material-symbols:rotate-left-rounded" class="text-[20px] text-white" :ssr="true" />
              </el-button>
              <el-button @click="generatePdfForm" type="success" >
                <Icon icon="material-symbols:print-outline-rounded" class="text-[20px] text-white" :ssr="true" />
                <span class="ml-2">Распечатать</span>
              </el-button>
            </template>
            <template v-else-if="getAppointmentData?.status === 'in-progress'">
              <el-button type="success" @click="addServices(getAppointmentData)">
                <Icon icon="material-symbols:medical-services-outline" class="text-[20px] text-white" :ssr="true" />
                <span class="ml-2">Добавить услуги</span>
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
                        -{{ typ.display }} ({{ typ.code }})
                      </li>
                    </ul>
                  </el-descriptions-item>
                  <el-descriptions-item label="Примечание ">
                    {{ getAppointmentData.observation?.note || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Жалобы ">
                    {{ getAppointmentData.observation?.complaints || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Осмотр ">
                    {{ getAppointmentData.observation?.clinical_exam || '—' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Лечение">
                    {{ getAppointmentData.observation?.assigned_treatment || '—' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>


              <el-card class="mt-4 rounded-xl card-shadow" v-if="getAppointmentData.prescriptions && getAppointmentData.prescriptions.length"  v-for="(prescription, pIdx) in getAppointmentData.prescriptions" :key="prescription.id" >
                <template #header>
                  <div class="flex justify-between">
                    <h2 class="text-xl font-semibold">Данные рецепта</h2>
                    <el-button @click="updatePrescription(prescription)" v-if="!getAppointmentData?.status === 'completed'" type="primary">
                      <Icon icon="material-symbols:edit-outline-rounded" class="text-[18px] text-white" :ssr="true" />
                      <span class="ml-2">
                        Редактировать
                      </span>
                    </el-button>
                  </div>
                </template>
                <div>
                  <el-descriptions :column="1" border>


                    <el-descriptions-item label="Врач">
                      {{ prescription.practitioner.last_name }} {{ prescription.practitioner.first_name }} {{ prescription.practitioner.middle_name }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Дата рецепта">
                      {{ prescription.prescription_date }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Лекарства">
                      <ul class="list-disc pl-4">
                        <li v-for="(med, index) in prescription.medications" :key="index">
                          <span class="font-medium">{{ med.name }}</span> – дозировка: {{ med.dosage }}, длительность: {{ med.duration }}, частота: {{ med.frequency }}
                        </li>
                      </ul>
                    </el-descriptions-item>
                    <el-descriptions-item label="Примечание">
                      {{ prescription.notes || '—' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Статус печати">
                      {{ prescription.printed_status ? 'Печатан' : 'Не печатан' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
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
          size="45%"
          destroy-on-close
      >
        <FormUpdateObservation
            :initialData="selectedData"
            @success="handleEditSuccess"
        />
      </el-drawer>

      <el-drawer
          title="Рецепт"
          v-model="createPrescriptionVisible"
          direction="rtl"
          size="40%"
          destroy-on-close
      >
        <FormPrescriptionCreate
            :initialData="selectedData"
            @success="handleEditSuccess"
        />
      </el-drawer>
      <el-drawer
          title="Изменить рецепт"
          v-model="updatePrescriptionVisible"
          direction="rtl"
          size="40%"
          destroy-on-close
      >
        <FormPrescriptionUpdate
            :initialData="selectedData"
            :prescriptionData="selectedPrescription"
            @success="handleEditSuccess"
        />
      </el-drawer>
      <el-drawer
          title="Документ"
          v-model="documentPdfVisible"
          direction="rtl"
          size="65%"
          destroy-on-close
      >
        <DocumentPdfForm
            :initialData="selectedData"
            @success="handleEditSuccess"
        />
      </el-drawer>

      <el-dialog
          title="Создание запроса на анализ"
          v-model="analysisVisible"
          width="45%"
      >
        <AnalysisFormCreate :initialData="selectedData" @success="handleEditSuccess" />
      </el-dialog>

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

      <el-dialog
          title="Подтверждение"
          v-model="confirmReturnVisible"
          width="30%"
      >
        <span>Вы уверены, что хотите вернуть прием в режим (in-progress)?</span>
        <span slot="footer" class="dialog-footer">
        <div class="mt-4">
          <el-button @click="confirmReturnVisible = false">Отмена</el-button>
          <el-button type="primary" @click="confirmReturnAppointment">Подтвердить</el-button>
        </div>
      </span>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appointmentStore } from "@/store/appointments";
import { servicesStore } from '@/store/services'
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import FormCreateObservation from "./components/FormCreateObservation.vue";
import FormUpdateObservation from "./components/FormUpdateObservation.vue";
import FormPrescriptionCreate from "./components/FormPrescriptionCreate.vue";
import FormPrescriptionUpdate from "./components/FormPrescriptionUpdate.vue"
import AnalysisFormCreate from "./dialogs/AnalysisFormCreate.vue";
import DocumentPdfForm from "./dialogs/DocumentPdfForm.vue";
import PatientCard from "@/components/patient/PatientCard.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { Icon } from "@iconify/vue";


const route = useRoute();
const router = useRouter();
const appointment = appointmentStore();
const services = servicesStore();

const appointmentId = route.params.id;

const loading = ref(false);
const createObservationVisible = ref(false);
const updateObservationVisible = ref(false);
const completeObservationVisible = ref(false);
const createPrescriptionVisible = ref(false);
const updatePrescriptionVisible = ref(false);
const confirmReturnVisible = ref(false)
const analysisVisible = ref(false);
const documentPdfVisible = ref(false)
const activeTab = ref("info");
const selectedData = ref(null);
const selectedPrescription = ref(null)

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

const returnAppointment = () => {
  confirmReturnVisible.value = true
}
const confirmReturnAppointment = async () => {
  try {
    await appointment.UPDATE_APPOINTMENT_STATUS(appointmentId, { status: "in-progress" })
    ElMessage.success("Прием переведен в режим in-progress")
    await fetchData();
  } catch (error) {
    console.error(error)
    ElMessage.error("Ошибка обновления статуса приема")
  } finally {
    confirmReturnVisible.value = false
  }
}

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
  updatePrescriptionVisible.value = false;
  createPrescriptionVisible.value = false;
  fetchData();
};

const sendForAnalysis = async (value) => {
  selectedData.value = getAppointmentData.value;
  analysisVisible.value = true;
  await services.GET_ANALYSIS_TYPES();
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
const createReciept = (value) => {
  createPrescriptionVisible.value = true;
  selectedData.value = getAppointmentData.value;
}
const updatePrescription = (value) => {
  updatePrescriptionVisible.value = true;
  selectedPrescription.value = value;
  selectedData.value = getAppointmentData.value;
}
const generatePdfForm = () => {
  documentPdfVisible.value = true;
  selectedData.value = getAppointmentData.value;
}


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
    case "reciept":
      createReciept(obs);
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