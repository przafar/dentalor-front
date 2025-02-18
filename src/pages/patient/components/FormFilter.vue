<template>
  <div class="filter-container">
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="col-span-4 sm:col-span-2 md:col-span-1">
        <el-input
            v-model="localFilters.value"
            :placeholder="'Поиск'"
            clearable
        ></el-input>
      </div>
    </div>

    <div class="flex">
      <div class="mr-2">
        <el-button type="primary" @click="applyFilters" class="w-full mb-2">
          Поиск
        </el-button>
      </div>
      <div>
        <el-button @click="resetFilters" class="w-full mb-2">
          Очистить фильтр
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, onMounted } from 'vue';
import { ElMessage } from "element-plus";


const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({
      value: null,
    }),
  },
});

const emit = defineEmits(['update:filters']);

const localFilters = ref({ ...props.initialFilters });

onMounted(async () => {
  await fetchSelectOptions();
});

const fetchSelectOptions = async () => {
  const body = {
    page: 0,
    limit: 10,
    search: {
      value: '',
    },
  };
  try {
  } catch (error) {
    console.error(error);
  }
};


const applyFilters = () => {
  emit('update:filters', { ...localFilters.value });
};

const resetFilters = () => {
  localFilters.value = {
    value: null,
  };
  emit('update:filters', { ...localFilters.value });
};
</script>

<style scoped>
.filter-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>
