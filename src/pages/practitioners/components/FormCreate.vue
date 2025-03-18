<template>
  <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="120px"
      label-position="top"
  >
    <el-form-item label="Идентификатор" prop="identifier">
      <el-input v-model="form.identifier" placeholder="Введите идентификатор" />
    </el-form-item>
    <el-form-item label="Фамилия" prop="last_name">
      <el-input v-model="form.last_name" placeholder="Введите фамилию" />
    </el-form-item>
    <el-form-item label="Имя" prop="first_name">
      <el-input v-model="form.first_name" placeholder="Введите имя" />
    </el-form-item>
    <el-form-item label="Отчество" prop="middle_name">
      <el-input v-model="form.middle_name" placeholder="Введите отчество" />
    </el-form-item>
    <el-form-item label="Пол" prop="gender">
      <el-select v-model="form.gender" placeholder="Выберите пол">
        <el-option label="Мужской" value="male"></el-option>
        <el-option label="Женский" value="female"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Адрес" prop="address">
      <el-input v-model="form.address" placeholder="Введите адрес" />
    </el-form-item>
    <el-form-item label="Телефон" prop="phone_number">
      <el-input v-model="form.phone_number" placeholder="Введите номер телефона" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        Создать
      </el-button>
      <el-button @click="handleReset">Сброс</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { practitionersStore } from "@/store/practitioners";

import { ElMessage } from "element-plus";

const formRef = ref(null);
const form = ref({
  identifier: "",
  last_name: "",
  first_name: "",
  middle_name: "",
  gender: "",
  address: "",
  phone_number: ""
});

const rules = {
  last_name: [
    { required: true, message: "Введите фамилию", trigger: "blur" }
  ],
  first_name: [
    { required: true, message: "Введите имя", trigger: "blur" }
  ],
  gender: [
    { required: true, message: "Выберите пол", trigger: "change" }
  ],

  phone_number: [
    { required: true, message: "Введите номер телефона", trigger: "blur" }
  ]
};

const loading = ref(false);
const store = practitionersStore();

const emit = defineEmits(["success"]);

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User data not found in localStorage");
      }
      const userData = JSON.parse(storedUser);
      const organization_id = userData.organization?.id;
      if (!organization_id) {
        throw new Error("Organization ID не найден в localStorage");
      }
      // Формируем тело запроса, добавляя organization_id
      const body = { ...form.value, organization_id };
      await store.CREATE_PRACTITIONER(body);
      ElMessage.success("Практикующий успешно создан");
      emit("success");
      handleReset();
    } catch (error) {
      console.error("Ошибка создания практикующего:", error);
    } finally {
      loading.value = false;
    }
  });
};

const handleReset = () => {
  if (formRef.value) formRef.value.resetFields();
};
</script>