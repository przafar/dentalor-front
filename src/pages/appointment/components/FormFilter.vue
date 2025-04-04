<template>
  <div class="grid grid-cols-4 gap-4">
<!--    <div class="col-span-1">-->
<!--      <el-select v-model="filter.encounter_class" placeholder="Выберите услугу">-->
<!--        <el-option-->
<!--            v-for="item in getServicesData"-->
<!--            :key="item.code"-->
<!--            :label="item.display"-->
<!--            :value="item.code"-->
<!--        />-->
<!--      </el-select>-->
<!--    </div>-->
    <div class="col-span-1">
      <el-input
          v-model="filter.tech_id"
          type="text"
          placeholder="TECH ID"
          style="width: 100%"
      />
    </div>
    <div class="col-span-1">
      <el-input
          v-model="filter.last_name"
          type="text"
          placeholder="Фамилия"
          style="width: 100%"
      />
    </div>
    <div class="col-span-1">
      <el-input
          v-model="filter.first_name"
          type="text"
          placeholder="Имя"
          style="width: 100%"
      />
    </div>
    <div class="col-span-1">
      <el-input
          v-model="filter.middle_name"
          type="text"
          placeholder="Отчество"
          style="width: 100%"
      />
    </div>
    <div class="col-span-1">
      <el-input
          v-model="filter.phone"
          type="text"
          placeholder="Номер телефона"
          style="width: 100%"
      />
    </div>
    <div class="col-span-4">
      <el-button type="primary" @click="handleSearch">
        Поиск
      </el-button>
      <el-button @click="clearFilter">
        Очистить фильтр
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch, defineProps, defineEmits } from 'vue';
import { servicesStore } from '@/store/services';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'search', filter: any): void;
}>();

const filter = reactive({
  // encounter_class: null,
  tech_id: '',
  last_name: '',
  first_name: '',
  middle_name: '',
  phone: ''
});

const services = servicesStore();
const getServicesData = computed(() => services.getEncounterClasses);

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  await services.GET_LIST_OF_ECOUNTER_CLASSES();
};

watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        Object.assign(filter, newVal);
      }
    },
    { immediate: true }
);

const handleSearch = () => {
  emit('update:modelValue', { ...filter });
  emit('search', { ...filter });
};

const clearFilter = () => {
  filter.tech_id = '';
  filter.last_name = '';
  filter.first_name = '';
  filter.middle_name = '';
  filter.phone = '';
  emit('update:modelValue', { ...filter });
  emit('search', { ...filter });
};
</script>

<style scoped>
</style>