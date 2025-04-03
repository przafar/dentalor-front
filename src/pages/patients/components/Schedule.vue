<template>
  <div class="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 h-[630px]">

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Текущая запись</h2>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <button
              class="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
              @click="prevDay"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-gray-800 font-medium min-w-[90px] text-center">
            {{ currentDateFormatted }}
          </span>
          <button
              class="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
              @click="nextDay"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
            class="bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 transition-colors"
            @click="openFullScreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" />
          </svg>
        </button>
      </div>
    </div>

    <FullCalendar class="h-[500px]" ref="calendarRef" :options="calendarOptions" />

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

    <el-dialog
        v-model="isFullScreenDialogVisible"
        :fullscreen="true"
        custom-class="full-screen-dialog"
        :close-on-click-modal="false"
        :show-close="true"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <span class="text-xl font-semibold">Полноэкранный календарь</span>
          <button class="text-gray-600 hover:text-gray-800" @click="closeFullScreen">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </template>
      <FullCalendar :options="calendarOptions" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'

const router = useRouter()

const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

const currentDate = ref(moment())
const currentDateFormatted = computed(() => currentDate.value.format('DD/MM/YYYY'))
const calendarRef = ref(null)

onMounted(() => {
  gotoCurrentDate()
})

function gotoCurrentDate() {
  const dateStr = currentDate.value.format('YYYY-MM-DD')
  if (calendarRef.value) {
    calendarRef.value.getApi().gotoDate(dateStr)
  }
}

function prevDay() {
  currentDate.value = currentDate.value.clone().subtract(1, 'day')
  gotoCurrentDate()
}

function nextDay() {
  currentDate.value = currentDate.value.clone().add(1, 'day')
  gotoCurrentDate()
}


const statusColors = {
  waitlist: '#A0AEC0',
  booked: '#3182CE',
  arrived: '#63B3ED',
  'in-progress': '#ED8936',
  completed: '#48BB78',
  cancelled: '#F56565',
}

const calendarEvents = computed(() => {
  if (!props.info || !props.info.data) return []
  return props.info.data
      .filter(app => ['waitlist', 'booked', 'in-progress', 'completed', 'arrived', 'cancelled'].includes(app.status))
      .map(app => {
        const timePart = app.time || '09:00:00'
        const startDate = moment(app.date).format('YYYY-MM-DD') + 'T' + timePart
        const endDate = moment(startDate).add(15, 'minutes').toISOString()
        const color = statusColors[app.status] || '#999' // цвет по умолчанию
        return {
          id: app.id,
          title: `${app.encounter_class?.display} ${app.practitioner.last_name} ${app.practitioner.first_name}`,
          start: startDate,
          end: endDate,
          backgroundColor: color,
          borderColor: color,
          textColor: '#fff'
        }
      })
})

/**
 * При клике на событие — переходим на /appointments/{id}
 */
function handleEventClick(info) {
  const appointmentId = info.event.id
  router.push(`/appointments/${appointmentId}`)
}

/**
 * Настройки календаря
 */
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
    console.log(`Клик по дате: ${info.dateStr}`)
  },
  eventClick: handleEventClick,
  eventDrop(info) {
    console.log(`Событие "${info.event.title}" перенесено на ${info.event.start}`)
  },
  eventResize(info) {
    console.log(`Событие "${info.event.title}" растянуто до ${info.event.end}`)
  }
}))

const isFullScreenDialogVisible = ref(false)
function openFullScreen() {
  isFullScreenDialogVisible.value = true
}
function closeFullScreen() {
  isFullScreenDialogVisible.value = false
}

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

watch(() => props.info, () => {

}, { deep: true })
</script>

<style >
.full-screen-dialog ::v-deep .el-dialog {
  margin: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
}
.full-screen-dialog ::v-deep .el-dialog__header,
.full-screen-dialog ::v-deep .el-dialog__footer {
  padding: 1rem;
}
.full-screen-dialog ::v-deep .el-dialog__body {
  padding: 1rem;
  height: calc(100vh - 140px);
  overflow: auto;
}

.fc-timeGrid-event.fc-event {
  background-color: #e8faff !important;
  border: none !important;
  border-radius: 6px !important;
  color: #333 !important;
  margin: 2px 0 !important;
}

.fc-timeGrid-event.fc-event:hover {
  background-color: #d2f5ff !important;
}

.fc .fc-timegrid-now-indicator-line,
.fc .fc-timegrid-now-indicator-arrow {
  background-color: #ff4d4d !important;
}

.fc .fc-timegrid-col-frame {
  border-right: 1px solid #f0f0f0 !important;
}

.fc .fc-timegrid-axis-cushion {
  font-size: 0.9rem !important;
  color: #777 !important;
}

.fc-timegrid-slot.fc-timegrid-slot-lane:nth-child(2n) {
  background-color: #fdfefe !important;
}

.fc .fc-header-toolbar {
  display: none !important;
}
.fc .fc-timegrid-slot-lane {
  background-color: #b5c7ee !important;
}

/* Цвет для каждой второй строки (зебра) */
.fc-timegrid-slot.fc-timegrid-slot-lane:nth-child(2n) {
  background-color: rgba(248, 249, 250, 1) !important;
}
</style>