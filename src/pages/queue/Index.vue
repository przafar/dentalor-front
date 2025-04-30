<template>
  <div ref="fsContainer" class="queue-page">
    <header class="header">
      <div class="date-time">
        <div class="date">{{ today }}</div>
        <div class="time">{{ currentTime }}</div>
      </div>
      <div>
        <img class="h-12 w-full logo" :src="fullAdImageUrl(settings.logo_url)" alt="Logo">
      </div>
    </header>

    <div class="widgets mt-4">
      <div class="widget weather-widget">
        <div class="widget-title">

          Погода
        </div>
        <div class="widget-content">
          <Transition name="slide" mode="out-in">
            <div v-if="showWeekly" class="weekly-forecast flex justify-between">
              <div v-for="(d, i) in forecastDays" :key="i" class="day-item text-center">
                <div class="flex items-center">
                  <div class="day-name">{{ formatDay(d.date) }}</div>
                  <Icon :icon="getIcon(d.code)" :style="{ color: getColor(d.code) }" class="text-xl mx-auto" :ssr="true" />
                </div>
                <div class="temp-range">
                  <span>{{ d.min }}°</span>
                  <span class="mx-[2px]">/</span>
                  <span>{{ d.max }}°</span>
                </div>
              </div>
            </div>
            <div v-else class="today-details">
              <div class="flex">
                <div class="text-xl font-semibold mb-1">Сегодня: {{ weather.temp }} °C, {{ weather.description }}</div>
                <Icon :icon="weatherIcon" :style="{ color: weatherColor }" class="text-[28px] ml-2 inline-block" :ssr="true" />
              </div>
              <div class="text-lg font-semibold">Ветер: {{ weather.windspeed }} км/ч</div>
  <!--            <div>Ночное/дневное: {{ weather.is_day ? 'день' : 'ночь' }}</div>-->
              <div class="text-lg font-semibold mb-1">Восход/закат: {{ sun.sunrise }} / {{ sun.sunset }}</div>
            </div>
          </Transition>
        </div>
      </div>
      <!-- <div class="widget ad-widget">
        <div>
          <img class="w-full h-32 object-cover" :src="fullAdImageUrl(settings.ad_image_url)" alt="Реклама">
        </div>
      </div> -->
      <div class="widget news-widget">
        <div class="widget-title">Новости</div>
        <div class="widget-content">{{ settings.news_text }}</div>
      </div>
    </div>

    <div class="columns">
      <section class="current-ticket">
        <div class="label">Следующий</div>
        <div v-if="current" class="ticket">
          <div class="ticket-number">{{ current.position }}</div>
          <div class="ticket-time">{{ current.encounter_class.display }}</div>
          <div class="ticket-time">{{ current.time }}</div>
          <div class="ticket-name">{{ current.patient.full_name }}</div>
        </div>
        <div v-else class="no-ticket">Очередь пуста</div>
      </section>

      <section class="upcoming-list">
        <div class="label">Ожидают</div>
        <ul>
          <li
              v-for="item in upcoming"
              :key="item.appointment_id"
              class="upcoming-item"
          >
            <div class="position">{{ item.position }}</div>
            <div class="info">
              <div class="time">{{ item.time }}</div>
              <div class="name">{{ item.patient.full_name }}</div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <div class="bottom-ticker">
      <div class="ticker-content">{{ settings.bottom_news_text }}</div>
    </div>

    <el-dialog
        custom-class="call-dialog"
        v-model="showDialog"
        :show-close="false"
        width="50%"
        @close="showDialog = false"
    >
      <div class="dialog-content">
        <div class="dialog-number">{{ calledDialog.position }}</div>
        <div class="dialog-name">{{ calledDialog.patient.full_name }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, watch } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Icon } from '@iconify/vue';
import { useQueueStore } from '@/store/queueStore';
import { settingsStore } from '@/store/settingsStore';
import config from '@/config';

const setStore = settingsStore();

dayjs.locale('ru');

const queueStore = useQueueStore();
const roleId = 4;
const dateParam = dayjs().format('YYYY-MM-DD');
const settings = reactive({
  logo_url: '',
  news_text: '',
  ad_image_url: '',
  bottom_news_text: ''
});

const weather = reactive({
  temp: null,
  code: null,
  description: '',
  windspeed: null,
  winddirection: null,
  is_day: null
});

const sun = reactive({
  sunrise: '',
  sunset: ''
});

const forecastDays = ref([]);

const showWeekly = ref(true);
let toggleTimer;
const iconMap = {
  0: 'mdi:weather-sunny',    1: 'mdi:weather-partly-cloudy',
  2: 'mdi:weather-cloudy',   3: 'mdi:weather-cloudy',
  45: 'mdi:weather-fog',     48: 'mdi:weather-fog',
  51: 'mdi:weather-rainy',   53: 'mdi:weather-rainy',
  55: 'mdi:weather-pouring', 61: 'mdi:weather-pouring',
  63: 'mdi:weather-pouring', 65: 'mdi:weather-pouring',
  80: 'mdi:weather-lightning-rainy', 81: 'mdi:weather-lightning-rainy',
  82: 'mdi:weather-lightning-rainy', 95: 'mdi:weather-lightning',
  99: 'mdi:weather-lightning'
};
const colorMap = {
  'mdi:weather-sunny': '#FFC107',
  'mdi:weather-partly-cloudy': '#90A4AE',
  'mdi:weather-cloudy': '#607D8B',
  'mdi:weather-fog': '#B0BEC5',
  'mdi:weather-rainy': '#2196F3',
  'mdi:weather-pouring': '#1565C0',
  'mdi:weather-lightning-rainy': '#3949AB',
  'mdi:weather-lightning': '#FF5722'
};

function getIcon(code) {
  return iconMap[code] || 'mdi:weather-sunny';
}
function getColor(code) {
  return colorMap[getIcon(code)] || '#000000';
}

async function fetchWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=41.375&longitude=69.25&current_weather=true&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FTashkent`;
    const resp = await fetch(url);
    const data = await resp.json();

    const cw = data.current_weather;
    weather.temp = cw.temperature;
    weather.code = cw.weathercode;
    weather.windspeed = cw.windspeed;
    weather.winddirection = cw.winddirection;
    weather.is_day = cw.is_day;

    sun.sunrise = dayjs(data.daily.sunrise[0]).format('HH:mm');
    sun.sunset = dayjs(data.daily.sunset[0]).format('HH:mm');

    forecastDays.value = data.daily.time.map((dateStr, i) => ({
      date: dateStr,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      code: data.daily.weathercode[i]
    }));
  } catch (e) {
    console.error('Ошибка API погоды', e);
  }
}
const now = ref(dayjs());
let timer;
let weatherTimer;

onMounted(async () => {
  timer = setInterval(() => (now.value = dayjs()), 1000);
  await fetchWeather();
  weatherTimer = setInterval(fetchWeather, 600000);



  queueStore.subscribeQueue(roleId, dateParam);
  queueStore.subscribeNotifications();
  toggleTimer = setInterval(() => {
    showWeekly.value = !showWeekly.value;
  }, 10000);

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const organizationId = user.organization.id;
    const resp = await setStore.GET_SETTINGS(organizationId);
    Object.assign(settings, resp.data);
  } catch (err) {
    console.error('Ошибка загрузки настроек', err);
  }

  enterFullScreen();
});

onBeforeUnmount(() => {
  clearInterval(timer);
  clearInterval(weatherTimer);
  queueStore.unsubscribeQueue();
  queueStore.unsubscribeNotifications();
});

const today = computed(() => now.value.format('DD.MM.YYYY'));
const currentTime = computed(() => now.value.format('HH:mm:ss'));
const current = computed(() => queueStore.current);
const upcoming = computed(() => queueStore.upcoming);
const showDialog = ref(false);
const calledDialog = ref({ position: '', time: '', patient: { full_name: '' } });
const formatDay = dateStr => dayjs(dateStr).format('dd');

const weatherIcon = computed(() => getIcon(weather.code));
const weatherColor = computed(() => getColor(weather.code));

watch(
    () => queueStore.notifications.length,
    (newLen, oldLen) => {
      if (newLen > oldLen) {
        const called = queueStore.notifications[newLen - 1];
        const pos = queueStore.queue.findIndex(a => a.appointment_id === called.id) + 1;
        calledDialog.value = { position: pos, time: called.time, patient: called.patient };
        showDialog.value = true;
        setTimeout(() => (showDialog.value = false), 5000);
      }
    }
);

const fsContainer = ref(null);
const isFullScreen = ref(false);

function enterFullScreen() {
  const el = fsContainer.value;
  el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.msRequestFullscreen?.();
  isFullScreen.value = true;
}

function toggleFullScreen() {
  isFullScreen.value ? exitFullScreen() : enterFullScreen();
}

function exitFullScreen() {
  document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
  isFullScreen.value = false;
}

document.addEventListener('fullscreenchange', () => {
  isFullScreen.value = !!document.fullscreenElement;
});


const fullAdImageUrl = val =>
    val ? `${config.API_BASE_URL_IMAGE}${val}` : '';
</script>

<style >


</style>
