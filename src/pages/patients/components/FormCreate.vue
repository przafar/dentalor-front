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
            <el-autocomplete
                v-model="form.lastName"
                :fetch-suggestions="querySearchLastName"
                placeholder="Введите фамилию"
            ></el-autocomplete>
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="Имя" prop="firstName">
            <el-autocomplete
                v-model="form.firstName"
                :fetch-suggestions="querySearchFirstName"
                placeholder="Введите имя"
            ></el-autocomplete>
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="Отчество" prop="middleName">
            <el-autocomplete
                v-model="form.middleName"
                :fetch-suggestions="querySearchMiddleName"
                placeholder="Введите отчество"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
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

      <!-- Остальные элементы формы -->
      <el-row :gutter="20">
        <el-col>
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
import { reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { patientStore } from "@/store/patients";
import { autoCompleteStore } from "@/store/autoComplete";
import { vMaska } from "maska";
import moment from "moment";

const emit = defineEmits(["success"]);
const store = patientStore();
const autoComplete = autoCompleteStore();

const form = reactive({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  birthDate: "",
  gender: "",
  middleName: "",
  passport: "",
  pinfl: ""
});

const formRef = ref(null);

const state = reactive({
  birth_date: "",
  input_date: "",
  datePickerVisible: false
});

watch(
    () => state.birth_date,
    (newVal) => {
      form.birthDate = newVal;
    }
);

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

const phoneInput = ref("+998");

const getRawPhone = (formatted) => {
  return formatted.replace(/\D/g, "");
};

const rules = {
  firstName: [
    {required: true, message: "Имя обязательно", trigger: "blur"}
  ],
  lastName: [
    {required: true, message: "Фамилия обязательна", trigger: "blur"}
  ],
  phoneInput: [
    {required: false, message: "Номер телефона обязателен", trigger: "blur"}
  ],
  birthDate: [
    {required: true, message: "Дата рождения обязательна", trigger: "change"}
  ],
  gender: [
    {required: true, message: "Пол обязателен", trigger: "change"}
  ]
};


const querySearchLastName = async (queryString, cb) => {
  if (queryString.trim().length < 3) {
    return cb([]);
  }
  try {
    const response = await autoComplete.GET_LAST_NAMES({ query: queryString });
    const suggestions = response.data.map(item => ({ value: item.last_name }));
    cb(suggestions);
  } catch (error) {
    cb([]);
  }
};

const querySearchFirstName = async (queryString, cb) => {
  if (queryString.trim().length < 3) {
    return cb([]);
  }
  try {
    const response = await autoComplete.GET_FIRST_NAMES({ query: queryString });
    const suggestions = response.data.map(item => ({ value: item.first_name }));
    cb(suggestions);
  } catch (error) {
    cb([]);
  }
};

const querySearchMiddleName = async (queryString, cb) => {
  if (queryString.trim().length < 3) {
    return cb([]);
  }
  try {
    const response = await autoComplete.GET_MIDDLE_NAMES({ query: queryString });
    const suggestions = response.data.map(item => ({ value: item.middle_name }));
    cb(suggestions);
  } catch (error) {
    cb([]);
  }
};

const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      form.phoneNumber = getRawPhone(phoneInput.value);
      const payload = {
        firstName: form.firstName.toUpperCase(),
        lastName: form.lastName.toUpperCase(),
        phoneNumber: form.phoneNumber,
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

      try {
        const res = await store.CREATE_PATIENT(payload);
        if (res && res.status && res.status !== 201) {
          throw res;
        }
        emit("success");
        ElMessage.success("Пациент успешно создан.");
      } catch (error) {

        const errMsg =
            (error.response && error.response.data && error.response.data.error) ||
            "Ошибка создания пациента.";
        ElMessage.error(errMsg);
      }
    } else {
      ElMessage.error("Пожалуйста, исправьте ошибки валидации.");
      return false;
    }
  });
};
</script>

<style scoped>
/* Ваши стили */
</style>