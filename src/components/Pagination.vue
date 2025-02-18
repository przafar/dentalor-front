<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="pageSizeModel"
          v-model:current-page="currentPageModel"
          @current-change="handlePageChange"
      />
    </div>
    <div class="flex flex-row items-center">
      <span>Показать</span>
      <el-select
          v-model="pageSizeModel"
          @change="handlePageSizeChange"
          placeholder=""
          class="mx-3"
          style="width: 70px"
      >
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <span>из {{ totalItems }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(["page-changed", "size-changed"]);


const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit("page-changed", val)
});


const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit("size-changed", val)
});

const handlePageChange = (newPage) => {
  emit("page-changed", newPage);
};

const handlePageSizeChange = (newSize) => {
  emit("size-changed", newSize);
};

const options = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" }
];
</script>

<style scoped>
.pagination-container {
  text-align: right;
  margin-top: 16px;
}
</style>