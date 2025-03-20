<template>
  <div class="p-4">
    <el-form :model="filters" label-position="top">
      <div class="grid grid-cols-5 gap-4">
        <el-form-item label="Фамилия" class="col-span-1">
          <el-input v-model="filters.last_name" placeholder="Фамилия" clearable />
        </el-form-item>
        <el-form-item label="Имя" class="col-span-1">
          <el-input v-model="filters.first_name" placeholder="Имя" clearable />
        </el-form-item>
        <el-form-item label="Отчество" class="col-span-1">
          <el-input v-model="filters.middle_name" placeholder="Отчество" clearable />
        </el-form-item>
        <el-form-item label="Дата рождения" class="col-span-1">
          <el-date-picker
              v-model="filters.birth_date"
              type="date"
              placeholder="Выберите дату"
              format="DD-MM-YYYY"
              value-format="YYYY-MM-DD"
              clearable
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Телефон" class="col-span-1">
          <el-input v-model="filters.phone_number" placeholder="Телефон" clearable />
        </el-form-item>
      </div>
      <div class="mt-4 flex justify-start space-x-2">
        <el-button type="primary" @click="onApply">Поиск</el-button>
        <el-button @click="onReset">Сбросить</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const filters = reactive({
  last_name: "",
  first_name: "",
  middle_name: "",
  birth_date: "",
  phone_number: ""
});

const emit = defineEmits(["apply", "reset"]);

function onApply() {
  emit("apply", { ...filters });
}

function onReset() {
  filters.last_name = "";
  filters.first_name = "";
  filters.middle_name = "";
  filters.birth_date = "";
  filters.phone_number = "";
  emit("reset");
}
</script>

<style scoped>
</style>