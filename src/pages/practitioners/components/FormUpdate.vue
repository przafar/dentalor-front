<template>
  <el-form label-position="top"  :model="form" :rules="rules" ref="formRef" label-width="120px">
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
        <el-option label="Мужской" value="male" />
        <el-option label="Женский" value="female" />
        <el-option label="Не указан" value="not_specified" />
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
        Обновить
      </el-button>
      <el-button @click="handleReset">Сброс</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from "vue";
import { practitionersStore } from "@/store/practitioners";
import { ElMessage } from "element-plus";

const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["success"]);

const formRef = ref(null);
const form = ref({
  id: null,
  identifier: "",
  last_name: "",
  first_name: "",
  middle_name: "",
  gender: "",
  address: "",
  phone_number: "",
});

const rules = {
  identifier: [{ required: true, message: "Введите идентификатор", trigger: "blur" }],
  last_name: [{ required: true, message: "Введите фамилию", trigger: "blur" }],
  first_name: [{ required: true, message: "Введите имя", trigger: "blur" }],
  middle_name: [{ required: true, message: "Введите отчество", trigger: "blur" }],
  gender: [{ required: true, message: "Выберите пол", trigger: "change" }],
  address: [{ required: true, message: "Введите адрес", trigger: "blur" }],
  phone_number: [{ required: true, message: "Введите номер телефона", trigger: "blur" }],
};

const loading = ref(false);
const store = practitionersStore();

// При изменении props.initialData заполняем форму
watch(
    () => props.initialData,
    (newData) => {
      if (newData) {
        form.value = { ...newData };
      }
    },
    { immediate: true }
);

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      // Получаем organization_id из localStorage
      const organization_id = localStorage.getItem("organization_id");
      if (!organization_id) {
        throw new Error("Organization ID не найден в localStorage");
      }
      // Формируем тело запроса, добавляя organization_id
      const body = { ...form.value, organization_id };
      await store.UPDATE_PRACTITIONER(form.value.id, body);
      ElMessage.success("Практикующий успешно обновлён");
      emit("success");
    } catch (error) {
      console.error("Ошибка обновления практикующего:", error);
    } finally {
      loading.value = false;
    }
  });
};

const handleReset = () => {
  if (props.initialData) {
    form.value = { ...props.initialData };
    formRef.value.clearValidate();
  }
};
</script>