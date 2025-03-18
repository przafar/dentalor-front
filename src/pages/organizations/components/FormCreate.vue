<template>
  <el-form  label-position="top" :model="form" ref="formRef" label-width="120px">
    <el-form-item label="Тип организации" prop="org_type">
      <el-input v-model="form.org_type" placeholder="Введите тип организации" />
    </el-form-item>
    <el-form-item label="Название (RU)" prop="name_ru">
      <el-input v-model="form.name_ru" placeholder="Введите название на русском" />
    </el-form-item>
    <el-form-item label="Название (UZ)" prop="name_uz">
      <el-input v-model="form.name_uz" placeholder="Введите название на узбекском" />
    </el-form-item>
    <el-form-item label="Название (EN)" prop="name_en">
      <el-input v-model="form.name_en" placeholder="Введите название на английском" />
    </el-form-item>
    <el-form-item label="Телефон" prop="phone_number">
      <el-input v-model="form.phone_number" placeholder="Введите номер телефона" />
    </el-form-item>
    <el-form-item label="Адрес" prop="address">
      <el-input v-model="form.address" placeholder="Введите адрес" />
    </el-form-item>
    <el-form-item label="Сайт" prop="url">
      <el-input v-model="form.url" placeholder="Введите URL" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">Создать</el-button>
      <el-button @click="handleReset">Сброс</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { organizationsStore } from "@/store/organizations";
import { ElMessage } from "element-plus";

const formRef = ref(null);
const form = ref({
  org_type: "",
  name_ru: "",
  name_uz: "",
  name_en: "",
  phone_number: "",
  address: "",
  url: "",
});
const loading = ref(false);
const store = organizationsStore();

const emit = defineEmits(["success"]);

const handleSubmit = async () => {
  loading.value = true;
  try {
    await store.CREATE_ORGANIZATION(form.value);
    ElMessage.success("Организация успешно создана");
    emit("success");
    handleReset();
  } catch (error) {
    console.error("Ошибка создания организации:", error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  form.value = {
    org_type: "",
    name_ru: "",
    name_uz: "",
    name_en: "",
    phone_number: "",
    address: "",
    url: "",
  };
};
</script>