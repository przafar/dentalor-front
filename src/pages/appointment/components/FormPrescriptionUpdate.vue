<template>
  <div>
    <el-form
        ref="prescriptionForm"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="space-y-4"
        @submit.prevent="handleSubmit"
    >
      <el-form-item label="ID приема" v-if="false">
        <el-input v-model="formData.appointment_id" disabled />
      </el-form-item>

      <el-form-item label="Врач" prop="prescribing_doctor">
        <el-select v-model="formData.prescribing_doctor" filterable placeholder="Выберите специалиста">
          <el-option
              v-for="item in getPractitioners"
              :key="item.id"
              :label="`${item.last_name} ${item.first_name} ${item?.middle_name}`"
              :value="item.id"
          >
            <template #default>
              <div class="flex justify-between items-center">
                <span>{{ item.last_name }} {{ item.first_name }} {{ item?.middle_name }}</span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Лекарства" prop="medications">
        <div class="flex flex-col w-full">
          <div
              v-for="(med, index) in formData.medications"
              :key="index"
              class="mb-4 border p-4 rounded-lg"
          >
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold">Лекарство {{ index + 1 }}</h4>
              <el-button v-if="index >= 1" type="danger" @click="removeMedication(index)">
                <Icon icon="material-symbols:delete-outline-rounded" class="text-[18px] text-white" :ssr="true" />
              </el-button>
            </div>
            <el-form-item :label="`Название`" :prop="`medications.${index}.name`">
              <el-input v-model="med.name" placeholder="Название лекарства" />
            </el-form-item>
            <el-form-item :label="`Дозировка`" :prop="`medications.${index}.dosage`">
              <el-input v-model="med.dosage" placeholder="Дозировка (например, 500mg)" />
            </el-form-item>
            <el-form-item :label="`Длительность`" :prop="`medications.${index}.duration`">
              <el-input v-model="med.duration" placeholder="Длительность (например, 5 дней)" />
            </el-form-item>
            <el-form-item :label="`Частота приема`" :prop="`medications.${index}.frequency`">
              <el-input v-model="med.frequency" placeholder="Частота приема (например, 3 раза в день)" />
            </el-form-item>
          </div>
          <div class="flex justify-end">
            <el-button type="primary" @click="addMedication">
              <Icon icon="material-symbols:pill-outline" class="text-[18px] text-white" :ssr="true" />
              <span class="ml-2">Добавить лекарство</span>
            </el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Примечания" prop="notes">
        <el-input
            type="textarea"
            v-model="formData.notes"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Например, принимать после еды"
        />
      </el-form-item>

      <div class="flex justify-end mt-6">
        <el-button :loading="loaderButton" type="primary" @click="handleSubmit">Сохранить</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from "@iconify/vue"
import { prescriptionStore } from "@/store/prescription"
import { practitionersStore } from '@/store/practitioners';

const props = defineProps({
  initialData: { type: Object, required: true },
  prescriptionData: { type: Object, required: true }
})
const emit = defineEmits(['success'])

const store = prescriptionStore();
const practitioner = practitionersStore()

const prescriptionForm = ref(null)
const loaderButton = ref(false)

const formData = ref({
  prescribing_doctor: '',
  medications: [
    { name: '', dosage: '', duration: '', frequency: '' }
  ],
  notes: ''
})

const rules = {
  prescribing_doctor: [
    { required: true, message: 'Введите имя врача', trigger: 'blur' }
  ],
  medications: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          return callback(new Error('Добавьте хотя бы одно лекарство'))
        }
        for (let i = 0; i < value.length; i++) {
          const med = value[i]
          if (!med.name) {
            return callback(new Error(`Заполните все поля для лекарства ${i + 1}`))
          }
        }
        return callback()
      },
      trigger: 'change'
    }
  ],
  notes: []
}

const getPractitioners = computed(() => practitioner.getPractitioners);

onMounted(async () => {
  await fetchValueSets();
  if (props.prescriptionData) {
    const prescription = props.prescriptionData;
    formData.value.prescribing_doctor = prescription.prescribing_doctor;
    formData.value.medications = prescription.medications;
    formData.value.notes = prescription.notes;
  }
});

const fetchValueSets = async () => {
  await practitioner.GET_LIST_OF_PRACTITIONERS();
};

const addMedication = () => {
  formData.value.medications.push({ name: '', dosage: '', duration: '', frequency: '' })
}

const removeMedication = (index) => {
  formData.value.medications.splice(index, 1)
}

const handleSubmit = async () => {
  prescriptionForm.value.validate(async (valid) => {
    if (valid) {
      loaderButton.value = true;
      const payload = {
        appointment_id: props.initialData.id,
        prescribing_doctor: formData.value.prescribing_doctor,
        medications: formData.value.medications,
        notes: formData.value.notes || ''
      }
      try {
        await store.UPDATE_PRESCRIPTION(props.prescriptionData.id, payload)
        emit('success')
        ElMessage.success('Рецепт успешно создан!')
      } catch (error) {
        ElMessage.error('Ошибка при обновлении рецепта!')
      } finally {
        loaderButton.value = false;
      }
    } else {
      ElMessage.error('Пожалуйста, заполните обязательные поля корректно.')
      return false
    }
  })
}
</script>

<style scoped>
</style>