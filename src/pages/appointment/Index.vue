<template>
  <div>
    <div class="pt-2 border-b border-[#eceeef]">
      <div class="relative rounded-lg pb-2 pl-4">
        <el-page-header @back="$router.push('/')" class="flex items-center">
          <template #content>
            <h1 class="text-md font-semibold text-gray-800">Запись на приём</h1>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="p-4">
      <el-radio-group v-model="viewMode" size="medium">
        <el-radio-button label="calendar">Календарь</el-radio-button>
        <el-radio-button label="table">Таблица</el-radio-button>
      </el-radio-group>
    </div>

    <div class="p-4">
      <div v-if="viewMode === 'calendar'" style="height: 600px;">
        <FullCalendar :options="calendarOptions" />
      </div>
      <div v-else>
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

const appointment = appointmentStore();
const router = useRouter();
const loading = ref(false);

const viewMode = ref("calendar");

const getAppointmentData = computed(() => appointment.getAppointment);

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => getAppointmentData.value?.pagination?.total || 0);

onMounted(async () => {
  await fetchData();
  console.log("getAppointmentData:", getAppointmentData.value);
});

const fetchData = async () => {
  loading.value = true;
  try {
    await appointment.GET_ALL({ page: 1, per_page: 25 });
  } catch (error) {
    console.error(error);
    ElMessage.error("Ошибка загрузки данных приёмов");
  } finally {
    loading.value = false;
  }
};

function generateFreeSlots(workingHoursStr, date) {
  const [startStr, endStr] = workingHoursStr.split("-");
  if (!startStr || !endStr) {
    throw new Error("Invalid working hours format");
  }
  const startTime = moment(`${date} ${startStr}`, "YYYY-MM-DD H:mm");
  const endTime = moment(`${date} ${endStr}`, "YYYY-MM-DD H:mm");
  if (!startTime.isValid() || !endTime.isValid()) {
    throw new Error("Invalid start or end time");
  }
  const slots = [];
  let slotId = 1;
  let currentTime = moment(startTime);
  while (currentTime.isBefore(endTime)) {
    const slotStart = moment(currentTime);
    const slotEnd = moment(currentTime).add(15, "minutes");
    if (slotEnd.isAfter(endTime)) break;
    slots.push({
      id: slotId++,
      start: slotStart.format("HH:mm"),
      end: slotEnd.format("HH:mm"),
      minutes_duration: 15,
      code: `${slotStart.format("HH:mm")}-${slotEnd.format("HH:mm")}`,
      status: "free",
      date: date
    });
    currentTime = slotEnd;
  }
  return slots;
}

const calendarEvents = computed(() => {
  const appointments = getAppointmentData.value.data || [];
  let events = [];
  appointments.forEach((appointment) => {
    if (appointment.slotsDetails && appointment.slotsDetails.length > 0) {
      const eventColor = appointment.status === "booked" ? "#378006" : "#ff0000";
      appointment.slotsDetails.forEach((slot) => {
        if (slot.date && slot.start && slot.end) {
          const startDateTime = moment(`${slot.date} ${slot.start}`, "YYYY-MM-DD HH:mm").toISOString();
          const endDateTime = moment(`${slot.date} ${slot.end}`, "YYYY-MM-DD HH:mm").toISOString();
          const title = `${appointment.patient.full_name} (${appointment.reason_text || "Прием"})`;
          events.push({
            info: appointment,
            title,
            start: startDateTime,
            end: endDateTime,
            color: eventColor,
            extendedProps: {
              appointmentId: appointment.id,
              slotId: slot.id,
              slotStatus: slot.status,
            },
          });
        }
      });
    }
  });
  console.log("calendarEvents:", events);
  return events;
});

const calendarOptions = computed(() => ({
  locale: ruLocale,
  plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ],
  nowIndicator: true,
  initialView: "timeGridDay",
  defaultDate: "2025-02-10",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  slotDuration: "00:15:00",
  slotLabelInterval: "00:15:00",
  eventColor: "#378006",
  eventTextColor: "#ffffff",
  events: calendarEvents.value,
  slotMinTime: "08:00:00",
  slotMaxTime: "20:00:00",
  eventClick: (info) => {
    const appointmentId = info.event.extendedProps.appointmentId;
    if (!appointmentId) {
      alert("ID записи отсутствует!");
      return;
    }
    router.push(`/appointments/${ appointmentId }`);
  },
}));

const formatDate = (dateString) => {
  return moment(dateString).format("DD-MM-YYYY");
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  await appointment.GET_ALL({
    page: currentPage.value,
    per_page: pageSize.value
  });
};

const handlePageSizeChange = async (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  await appointment.GET_ALL({
    page: currentPage.value,
    per_page: pageSize.value
  });
};

const editAppointment = (appointment) => {
  router.push(`/appointments/${ appointment.id }`);
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