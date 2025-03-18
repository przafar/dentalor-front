<template>
  <el-form
      ref="myForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
  >
    <!-- Поле для выбора услуги (обязательно) -->
    <el-form-item label="Услуга" prop="encounter_class" required>
      <el-select v-model="form.encounter_class" placeholder="Выберите услугу">
        <el-option
            v-for="item in getServicesData"
            :key="item.code"
            :label="item.display"
            :value="item.code"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Специалист" prop="practitioner_role" required>
      <el-select v-model="form.practitioner_role" @change="handleCheckboxChange" placeholder="Выберите специалиста">
        <el-option
            v-for="item in getPractitionerRoles"
            :key="item.id"
            :label="`${item.practitioner.last_name} ${item.practitioner.first_name}`"
            :value="item.id"
        >
          <template #default>
            <div class="flex justify-between items-center">
              <span>{{ item.practitioner.last_name }} {{ item.practitioner.first_name }}</span>
              <span class="text-gray-500 text-sm">{{ item.specialty }}</span>
            </div>
          </template>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="Дата приема" prop="date" required>
      <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Выберите дату"
          format="DD-MM-YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @change="handleCheckboxChange"
      />
    </el-form-item>

    <el-form-item label="Причина приема" prop="reason_text">
      <el-input
          type="textarea"
          v-model="form.reason_text"
          placeholder="Введите причину приема"
      />
    </el-form-item>

    <el-form-item>
      <el-checkbox v-model="form.withDate" @change="handleCheckboxChange">Бронировать</el-checkbox>
    </el-form-item>

    <div v-if="form.withDate && form.practitioner_role && form.date">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      </div>

      <!-- Сетка доступных слотов с возможностью множественного выбора -->
      <div class="slots-container" v-if="freeSlots && freeSlots.length">
        <p class="mb-2 font-medium">Доступные слоты (выберите один или несколько):</p>
        <div class="slots-grid">
          <div
              v-for="slot in freeSlots"
              :key="slot.id"
              :class="['slot', { booked: slot.status === 'booked', selected: isSelected(slot) }]"
              @click="handleSlotClick(slot)"
          >
            <span>{{ slot.start }} - {{ slot.end }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка отправки формы -->
    <div class="flex justify-end">
      <el-form-item class="mt-4">
        <el-button type="primary" @click="submitForm">Создать приём</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { servicesStore } from '@/store/services';
import { appointmentStore } from '@/store/appointments';
import { practitionerRoleStore } from '@/store/practitionerRoles';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const serviceStore = servicesStore();
const appointment = appointmentStore();
const practitionerRole = practitionerRoleStore();
const route = useRoute();

const emit = defineEmits(["submit"]);

const getServicesData = computed(() => serviceStore.getEncounterClasses);
const getPractitionerRoles = computed(() => practitionerRole.getPractitionerRoles);

const freeSlots = ref([]);

const patientId = route.params.id;

const form = ref({
  time: null,
  date: null,
  practitioner_role: null,
  encounter_class: '',
  reason_text: '',
  patient_id: patientId,
  status: 'booked',
  withDate: false,
  slots: []
});

const rules = {
  encounter_class: [
    { required: true, message: 'Пожалуйста, выберите услугу', trigger: 'change' }
  ],
  practitioner_role: [
    { required: true, message: 'Пожалуйста, выберите специалиста', trigger: 'change' }
  ],
  date: [
    {
      validator: (rule, value, callback) => {
        if (form.value.withDate && !value) {
          callback(new Error('Пожалуйста, выберите дату приема'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  time: [
    {
      validator: (rule, value, callback) => {
        if (form.value.withDate && !value) {
          callback(new Error('Пожалуйста, выберите время приема'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const myForm = ref(null);

onMounted(async () => {
  await fetchValueSets();
});

const fetchValueSets = async () => {
  await serviceStore.GET_LIST_OF_ECOUNTER_CLASSES();
  await practitionerRole.GET_ALL();
};


const handleCheckboxChange = async () => {
  if(form.value.practitioner_role && form.value.date && form.value.withDate) {
    const params = {
      date: form.value.date,
      practitioner_role_id: form.value.practitioner_role
    };
    try {
      const response = await appointment.GET_SLOTS(params);
      freeSlots.value = response.data.slots;
    } catch (error) {
      console.error("Ошибка получения слотов", error);
    }
  }
}

const isSelected = (slot) => {
  return form.value.slots.includes(slot.id);
};

const handleSlotClick = (slot) => {
  if (slot.status === "booked") return;
  const index = form.value.slots.indexOf(slot.id);
  if (index === -1) {
    // Добавляем слот в массив выбранных
    form.value.slots.push(slot.id);
  } else {
    form.value.slots.splice(index, 1);
  }
  if (form.value.slots.length > 0) {
    const firstSelected = freeSlots.value.find(s => s.id === form.value.slots[0]);
    if (firstSelected) {
      form.value.time = firstSelected.start;
      form.value.date = firstSelected.date;
    }
  } else {
    form.value.time = null;
    form.value.date = null;
  }
};

const submitForm = () => {
  myForm.value.validate(async (valid) => {
    if (!valid) return;
    if (form.value.withDate && (!form.value.slots || form.value.slots.length === 0)) {
      const firstSlot = freeSlots.value[0];
      if (firstSlot) {
        form.value.time = firstSlot.start;
        form.value.date = firstSlot.date;
        form.value.slots = [firstSlot.id];
      }
    }
    const appointmentPayload = {
      date: form.value.date,
      practitioner_role: form.value.practitioner_role,
      encounter_class: form.value.encounter_class,
      reason_text: form.value.reason_text,
      patient_id: patientId,
      status: form.value.withDate ? 'booked' : 'draft',
      slots: form.value.slots
    };
    try {
      await appointment.CREATE_APPOINTMENT(appointmentPayload);
      ElMessage.success('Прием успешно создан');
      emit("submit");
    } catch (error) {
      ElMessage.error('Ошибка создания приема');
      console.error(error);
    }
  });
};
</script>

<style scoped>
.slots-container {
  margin-top: 20px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.slot {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.slot.booked {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.slot.selected {
  background-color: #386df0;
  color: white;
}
</style>