<template>
  <div>
    <div class="flex justify-between px-4 mt-4">
      <div>
        <h4 class="text-2xl font-bold text-gray-700">Запись на приём</h4>
      </div>
      <div>
        <el-radio-group v-model="viewMode" size="medium">
          <el-radio-button label="calendar">Календарь</el-radio-button>
          <el-radio-button label="table">Таблица</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="p-4">
      <FormFilter v-model="searchValue" @search="onSearch" />

      <div v-if="viewMode === 'calendar'" class="border shadow-lg rounded-lg p-4 mt-4 mb-5" style="height: 100%">
        <div class="flex items-center justify-end gap-2 mb-4">
          <el-button @click="prevDay">
            <Icon icon="material-symbols:chevron-left-rounded" class="text-[28px]" :ssr="true" />
          </el-button>
          <span class="text-gray-800 font-medium text-center">
            <el-date-picker
                v-model="currentDateFormatted"
                type="date"
                placeholder="Pick a day"
                value-format="DD-MM-YYYY"
                format="DD-MM-YYYY"
                disabled
            />
          </span>
          <el-button @click="nextDay">
            <Icon icon="material-symbols:chevron-right-rounded" class="text-[28px]" :ssr="true" />
          </el-button>
        </div>
        <FullCalendar
            style="min-height: 450px; max-height: 600px"
            ref="calendarRef"
            :options="calendarOptions"
        />
        <div class="mt-4">
          <div class="flex flex-wrap gap-2">
            <div
                v-for="(color, status) in statusColors"
                :key="status"
                class="flex items-center gap-2"
            >
              <div
                  :style="{ backgroundColor: color }"
                  class="w-4 h-4 rounded border border-gray-300"
              ></div>
              <span class="text-gray-700 capitalize text-sm">
                {{ getStatusTag(status)?.text }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <el-table class="mt-4" :data="getAppointmentData.data" style="width: 100%" stripe>
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { appointmentStore } from "@/store/appointments";
import { ElMessage } from "element-plus";
import moment from "moment";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

import Pagination from "@/components/Pagination.vue";
import FormFilter from "./components/FormFilter.vue";
import { Icon } from "@iconify/vue";

const appointment = appointmentStore();
const router = useRouter();
const loading = ref(false);
const viewMode = ref("calendar");
const searchValue = ref({}); // Объект фильтра

const getAppointmentData = computed(() => appointment.getAppointment);
const currentDate = ref(moment());
const currentDateFormatted = computed(() => currentDate.value.format("DD-MM-YYYY"));
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => getAppointmentData.value?.pagination?.total || 0);
const calendarRef = ref(null);

onMounted(async () => {
  await fetchData();
  console.log("getAppointmentData:", getAppointmentData.value);
});

const onSearch = (filter) => {
  console.log("onSearch filter:", filter);
  searchValue.value = filter;
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    await appointment.GET_ALL({
      page: 1,
      per_page: 25,
      date: currentDate.value.format("YYYY-MM-DD"),
      ...searchValue.value
    });
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка загрузки данных приёмов");
  } finally {
    loading.value = false;
  }
};

function gotoCurrentDate() {
  fetchData();
  if (calendarRef.value) {
    calendarRef.value.getApi().gotoDate(currentDate.value.format("YYYY-MM-DD"));
  }
}

const statusColors = {
  waitlist: '#A0AEC0',
  booked: '#3182CE',
  arrived: '#63B3ED',
  'in-progress': '#ED8936',
  completed: '#48BB78',
  cancelled: '#F56565'
};

const calendarEvents = computed(() => {
  const data = getAppointmentData.value.data || [];
  return data
      .filter(app => ['waitlist', 'booked', 'in-progress', 'completed', 'arrived', 'cancelled'].includes(app.status))
      .map(app => {
        const timePart = app.time || '09:00:00';
        const startDate = moment(app.date).format('YYYY-MM-DD') + 'T' + timePart;
        const endDate = moment(startDate).add(15, 'minutes').toISOString();
        const color = statusColors[app.status] || '#999';
        return {
          id: app.id,
          title: `${app.encounter_class?.display || ''} ${app.practitioner?.last_name || ''} ${app.practitioner?.first_name || ''}`,
          start: startDate,
          end: endDate,
          backgroundColor: color,
          borderColor: color,
          textColor: '#fff'
        };
      });
});

function handleEventClick(info) {
  const appointmentId = info.event.id;
  router.push(`/appointments/${appointmentId}`);
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridDay',
  locales: [ruLocale],
  locale: 'ru',
  headerToolbar: false,
  events: calendarEvents.value,
  slotDuration: "00:15:00",
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  allDaySlot: false,
  nowIndicator: true,
  editable: true,
  dateClick(info) {
    console.log(`Клик по дате: ${info.dateStr}`);
  },
  eventClick: handleEventClick,
  eventDrop(info) {
    console.log(`Событие "${info.event.title}" перенесено на ${info.event.start}`);
  },
  eventResize(info) {
    console.log(`Событие "${info.event.title}" растянуто до ${info.event.end}`);
  }
}));

const formatDate = (dateString) => {
  return moment(dateString).format("DD-MM-YYYY");
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  await appointment.GET_ALL({
    page: currentPage.value,
    per_page: pageSize.value,
    ...searchValue.value
  });
};

const handlePageSizeChange = async (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  await appointment.GET_ALL({
    page: currentPage.value,
    per_page: pageSize.value,
    ...searchValue.value
  });
};

const editAppointment = (appointment) => {
  router.push(`/appointments/${appointment.id}`);
};

function prevDay() {
  currentDate.value = currentDate.value.clone().subtract(1, 'day');
  gotoCurrentDate();
}

function nextDay() {
  currentDate.value = currentDate.value.clone().add(1, 'day');
  gotoCurrentDate();
}

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

watch(getAppointmentData, (newVal) => {
});
</script>

<style scoped>
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
</style>