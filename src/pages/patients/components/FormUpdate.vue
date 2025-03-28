<template>
  <div class="w-full">
    <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-position="top"
    >
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="Фамилия" prop="lastName">
            <el-input v-model="form.lastName" placeholder="Введите фамилию" />
          </el-form-item>
        </el-col>
        <el-col >
          <el-form-item label="Имя" prop="firstName">
            <el-input v-model="form.firstName" placeholder="Введите имя" />
          </el-form-item>
        </el-col>
        <el-col >
          <el-form-item label="Отчество" prop="middleName">
            <el-input v-model="form.middleName" placeholder="Введите отчество" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Дата рождения" prop="birthDate">
            <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="Выберите дату рождения"
                format="DD-MM-YYYY"
                value-format="DD-MM-YYYY"
                class="w-full"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Пол" prop="gender">
            <el-select v-model="form.gender" placeholder="Выберите пол">
              <el-option label="Мужской" value="male"></el-option>
              <el-option label="Женский" value="female"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col>
          <el-form-item label="Номер телефона" prop="phoneNumber">
            <el-input v-model="form.phoneNumber" placeholder="Введите номер телефона" />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="Паспорт" prop="passport">
            <el-input v-model="form.passport" placeholder="Введите серию и номер паспорта" />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="ПИНФЛ" prop="pinfl">
            <el-input v-model="form.pinfl" placeholder="Введите ПИНФЛ" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Кнопка отправки -->
      <div class="mt-6">
        <el-button type="primary" @click="handleSubmit">Сохранить изменения</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { patientStore } from '@/store/patients';

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["success"]);

const store = patientStore();

const form = reactive({
  firstName: props.initialData.first_name || "",
  lastName: props.initialData.last_name || "",
  middleName: props.initialData.middle_name || "",
  phoneNumber: props.initialData.phone_number || "",
  birthDate: props.initialData.birth_date || "",
  gender: props.initialData.gender || "",
  passport: props.initialData.identifier && props.initialData.identifier[0]
      ? props.initialData.identifier[0].value
      : "",
  pinfl: props.initialData.identifier && props.initialData.identifier[1]
      ? props.initialData.identifier[1].value
      : "",
  url: props.initialData.url || ""
});

const formRef = ref(null);

// Правила валидации
const rules = {
  firstName: [{ required: true, message: "Имя обязательно", trigger: "blur" }],
  lastName: [{ required: true, message: "Фамилия обязательна", trigger: "blur" }],
  phoneNumber: [
    { required: true, message: "Номер телефона обязателен", trigger: "blur" },
    {
      pattern: /^(\+)?(\d{1,3})?\s?\d{5,14}$/,
      message: "Неверный номер телефона",
      trigger: "blur"
    }
  ],
  birthDate: [{ required: true, message: "Дата рождения обязательна", trigger: "change" }],
  gender: [{ required: true, message: "Пол обязателен", trigger: "change" }]
};

// Обработчик отправки формы
const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const id = props.initialData.id;
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        phoneNumber: form.phoneNumber,
        birthDate: form.birthDate,
        gender: form.gender,
        url: form.url,
        identifier: [
          {
            type: "PPN",
            value: form.passport,
            display: "Серия и номер паспорта",
            system: "http://fhir.ssv.uz/ValueSet/identifier-type"
          },
          {
            type: "NNUZB",
            value: form.pinfl,
            display: "Идентификационный номер гражданина в Республике Узбекистан (ПИНФЛ)",
            system: "http://fhir.ssv.uz/ValueSet/identifier-type"
          }
        ]
      };

      await store.UPDATE_PATIENT(id, payload);
      emit("success");
      ElMessage.success("Пациент успешно обновлен.");
    } else {
      ElMessage.error("Пожалуйста, исправьте ошибки валидации.");
      return false;
    }
  });
};
</script>

<style scoped>
/* Дополнительные стили можно добавить по необходимости */
</style>