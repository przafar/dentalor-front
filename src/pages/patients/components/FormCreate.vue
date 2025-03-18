<template>
  <div class="w-full">
    <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-position="top"
        class="w-full"
    >
      <el-row :gutter="20">
        <el-col>
          <el-form-item label="Фамилия" prop="lastName">
            <el-input v-model="form.lastName" placeholder="Введите фамилию" />
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="Имя" prop="firstName">
            <el-input v-model="form.firstName" placeholder="Введите имя" />
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="Отчество" prop="middleName">
            <el-input v-model="form.middleName" placeholder="Введите отчество" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <!-- Кастомный ввод даты рождения -->
          <el-form-item label="Дата рождения" prop="birthDate">
            <el-input
                v-model="state.input_date"
                placeholder="31-12-2024 (kun-oy-yil)"
                maxlength="10"
                @input="handleManualInput"
                @blur="formatBirthDate"
                @focus="openDatePicker"
            >
              <template #suffix>
                <el-icon @click="openDatePicker">
                  <calendar />
                </el-icon>
              </template>
            </el-input>
            <!-- Скрытый date-picker для выбора даты -->
            <el-date-picker
                ref="datePickerRef"
                v-model:visible="state.datePickerVisible"
                v-model="state.birth_date"
                type="date"
                format="DD-MM-YYYY"
                value-format="DD-MM-YYYY"
                @change="syncInput"
                style="visibility: hidden; position: absolute"
            ></el-date-picker>
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
          <!-- Поле номера телефона с v-maska -->
          <el-form-item label="Номер телефона" prop="phoneInput">
            <el-input
                v-model="phoneInput"
                v-maska
                unmasked-value
                data-maska="+998 (##) ###-##-##"
            />
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="Паспорт" prop="passport">
            <el-input v-model="form.passport" placeholder="Введите паспорт" />
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="ПИНФЛ" prop="pinfl">
            <el-input v-model="form.pinfl" placeholder="Введите ПИНФЛ" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="mt-6">
        <el-button type="primary" @click="handleSubmit">
          Создать пациента
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { patientStore } from "@/store/patients";
import { vMaska } from 'maska';
import moment from "moment";

const emit = defineEmits(["success"]);
const store = patientStore();

// Основная модель формы для отправки данных
const form = reactive({
  firstName: "",
  lastName: "",
  phoneNumber: "", // сюда запишется «сырой» номер (только цифры)
  birthDate: "",   // синхронизируется с state.birth_date
  gender: "",
  middleName: "",
  passport: "",
  pinfl: ""
});

const formRef = ref(null);

// Локальное состояние для кастомного ввода даты
const state = reactive({
  birth_date: "",         // выбранная дата в формате DD-MM-YYYY
  input_date: "",         // текстовое представление даты
  datePickerVisible: false // управление видимостью date-picker
});

// Синхронизация выбранной даты с моделью формы
watch(
    () => state.birth_date,
    (newVal) => {
      form.birthDate = newVal;
    }
);

// Функции для работы с датой рождения
const openDatePicker = () => {
  state.datePickerVisible = true;
};

const syncInput = () => {
  if (state.birth_date) {
    state.input_date = moment(state.birth_date, "DD-MM-YYYY").format("DD-MM-YYYY");
  }
};

const handleManualInput = () => {
  let digits = state.input_date.replace(/\D/g, "");
  if (digits.length === 8) {
    state.input_date = `${ digits.slice(0, 2) }-${ digits.slice(2, 4) }-${ digits.slice(4, 8) }`;
    state.birth_date = state.input_date;
  }
};

const formatBirthDate = () => {
  if (moment(state.input_date, "DD-MM-YYYY", true).isValid()) {
    state.birth_date = moment(state.input_date, "DD-MM-YYYY").format("DD-MM-YYYY");
  } else {
    state.birth_date = "";
  }
};

// --- Логика для номера телефона с v-maska ---
// Здесь phoneInput хранит отформатированное значение, которое видит пользователь.
// При вводе используется директива v-maska для форматирования.
const phoneInput = ref("+998");

// Функция для получения "сырого" номера (только цифры)
const getRawPhone = (formatted) => {
  return formatted.replace(/\D/g, "");
};
// --- Конец логики для номера телефона ---

const rules = {
  firstName: [
    {required: true, message: "Имя обязательно", trigger: "blur"}
  ],
  lastName: [
    {required: true, message: "Фамилия обязательна", trigger: "blur"}
  ],
  phoneInput: [
    {required: false, message: "Номер телефона обязателен", trigger: "blur"},
  ],
  birthDate: [
    {required: true, message: "Дата рождения обязательна", trigger: "change"}
  ],
  gender: [
    {required: true, message: "Пол обязателен", trigger: "change"}
  ]
};

const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // Из форматированного значения получаем "сырой" номер (только цифры)
      form.phoneNumber = getRawPhone(phoneInput.value);

      const payload = {
        firstName: form.firstName.toUpperCase(),
        lastName: form.lastName.toUpperCase(),
        phoneNumber: form.phoneNumber, // Например, "998977584224"
        birthDate: form.birthDate,
        gender: form.gender,
        middleName: form.middleName.toUpperCase(),
        url: "",
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
      await store.CREATE_PATIENT(payload);
      emit("success");
      ElMessage.success("Пациент успешно создан.");
    } else {
      ElMessage.error("Пожалуйста, исправьте ошибки валидации.");
      return false;
    }
  });
};
</script>

<style scoped>
/* Добавьте при необходимости ваши стили */
</style>