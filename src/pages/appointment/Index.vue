<template>
  <div>
    <!-- Заголовок страницы -->
    <div class="pt-2 border-b border-[#eceeef]">
      <div class="relative rounded-lg pb-2 pl-4">
        <el-page-header @back="$router.push('/')" class="flex items-center">
          <template #content>
            <h1 class="text-md font-semibold text-gray-800">Запись на приём</h1>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="flex flex-col p-4">
      <!-- Задаём минимальную высоту контейнера для календаря -->
      <div style="height: 600px;">
        <!-- Для отладки можно вывести массив событий (например, через JSON.stringify) -->
        <!-- <pre>{{ JSON.stringify(calendarEvents, null, 2) }}</pre> -->
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { appointmentStore } from "@/store/appointments";
import { ElMessage } from "element-plus";
import moment from "moment";

// Импорт FullCalendar и плагинов
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import { useRouter } from "vue-router";

const appointment = appointmentStore();

const loading = ref(false);
const router = useRouter();

// Получаем данные о приёмах из store (убедитесь, что appointment.getAppointment – реактивное свойство)
const getAppointmentData = computed(() => appointment.getAppointment);

onMounted(async () => {
  await fetchData();
  console.log("getAppointmentData:", getAppointmentData.value); // для отладки
});

// Функция загрузки данных
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

// Формируем массив событий для FullCalendar на основе slotsDetails
// Если у приёма отсутствуют поля start/end или slotsDetails пустой – событие не создаётся
// Также в свойство "color" записываем разный цвет в зависимости от статуса приёма:
//   - booked – зелёный (#378006)
//   - draft  – красный (#ff0000)
const calendarEvents = computed(() => {
  const appointments = getAppointmentData.value.data || [];
  let events = [];
  appointments.forEach((appointment) => {
    // Если slotsDetails существует и содержит хотя бы один элемент:
    if (appointment.slotsDetails && appointment.slotsDetails.length > 0) {
      // Определяем цвет события в зависимости от статуса приёма
      const eventColor = appointment.status === "booked" ? "#378006" : "#ff0000";
      appointment.slotsDetails.forEach((slot) => {
        // Проверяем, что есть необходимые поля
        if (slot.date && slot.start && slot.end) {
          const startDateTime = moment(`${slot.date} ${slot.start}`, "YYYY-MM-DD HH:mm").toISOString();
          const endDateTime = moment(`${slot.date} ${slot.end}`, "YYYY-MM-DD HH:mm").toISOString();
          // Формируем заголовок – например, имя пациента и причина приёма (если указана)
          const title = `${appointment.patient.full_name} (${appointment.reason_text || "Прием"})`;
          events.push({
            info: appointment,
            title,
            start: startDateTime,
            end: endDateTime,
            color: eventColor, // задаём индивидуальный цвет события
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
  console.log("calendarEvents:", events); // для отладки
  return events;
});

// Опции FullCalendar. Они определяются как computed, чтобы при изменении данных (calendarEvents) календарь обновлялся.
const calendarOptions = computed(() => ({
  locale: ruLocale, // Русская локаль
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  nowIndicator: true,
  initialView: "timeGridDay", // Отображение дня с временной сеткой
  defaultDate: "2025-02-10",   // Отладочная дата (события для 10 февраля 2025)
  headerToolbar: {
    left: "today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  slotDuration: "00:15:00",         // Интервал слотов 15 минут
  slotLabelInterval: "00:15:00",
  // Если событие содержит собственное свойство color – оно будет использовано,
  // поэтому глобальные eventColor/eventTextColor можно не задавать или задать как fallback.
  eventColor: "#378006",          // Фоновый цвет по умолчанию (если не задано в событии)
  eventTextColor: "#ffffff",      // Цвет текста по умолчанию
  events: calendarEvents.value,   // Массив событий, сформированный выше
  slotMinTime: "08:00:00",         // Отображение времени с 08:00
  slotMaxTime: "20:00:00",         // До 20:00
  // Обработчик клика на событие
  eventClick: (info) => {
    const appointmentId = info.event.extendedProps.info.id;
    if (!appointmentId) {
      alert("ID записи отсутствует!");
      return;
    }

    router.push(`/appointments/${appointmentId}`);
  },
}));
</script>

<style scoped>
/* Можно добавить свои стили, если необходимо */
</style>