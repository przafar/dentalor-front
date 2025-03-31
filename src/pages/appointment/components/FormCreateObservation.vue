<template>
  <div>
    <el-form
        ref="observationForm"
        :model="formData"
        label-position="top"
        class="space-y-4"
        @submit.prevent="handleSubmit"
    >


      <el-form-item label="Направления" prop="encounter_class">
        <el-select
            v-model="selectedEncounterClass"
            placeholder="Выберите encounter class"
            :disabled="true"
        >
          <el-option
              v-if="initialData?.encounter_class"
              :label="initialData.encounter_class.display"
              :value="initialData.encounter_class.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Тип услуги" prop="encounter_types">
        <el-select
            v-model="formData.encounter_types"
            multiple
            filterable
            placeholder="Выберите тип услуги"
            class="w-full"
        >
          <el-option
              v-for="type in getEncounterTypes"
              :key="type.id"
              :label="type.display"
              :value="type.id"
          />
        </el-select>
      </el-form-item>





      <el-form-item label="Жалобы и анамнез" prop="complaints">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Опишите жалобы..."
            v-model="formData.complaints"
        />
      </el-form-item>

      <el-form-item label="Клинический осмотр" prop="clinical_exam">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Описание осмотра"
            v-model="formData.clinical_exam"
        />
      </el-form-item>

      <el-form-item label="Назначенное лечение" prop="assigned_treatment">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Текст назначения"
            v-model="formData.assigned_treatment"
        />
      </el-form-item>
      <el-form-item label="Примечание " prop="note">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Любая дополнительная информация"
            v-model="formData.note"
        />
      </el-form-item>

      <div class="flex justify-end mt-6">
        <el-button type="primary" @click="handleSubmit">
          Сохранить
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { observationStore } from '@/store/observations'
import { servicesStore } from '@/store/services'


const observation = observationStore()
const services = servicesStore()
const router = useRouter()

const emit = defineEmits(['success'])


const getEncounterTypes = computed(() => services.encounterTypes)

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

const formData = ref({
  appointment_id: null,
  encounter_class: [],
  encounter_types: [],
  diagnoses: [],
  note: '',
  complaints: '',
  clinical_exam: '',
  assigned_treatment: ''
})

const encounterTypes = ref([])

const diagnosesText = ref('')

const selectedEncounterClass = ref('')

onMounted(async () => {
  formData.value.appointment_id = props.initialData.id
  selectedEncounterClass.value = props.initialData.encounter_class?.code || ''
  formData.value.encounter_class = selectedEncounterClass.value
      ? [selectedEncounterClass.value]
      : []

  if (selectedEncounterClass.value) {
    try {
      await services.GET_LIST_OF_ECOUNTER_TYPES(selectedEncounterClass.value)
    } catch (err) {
      console.error('Error fetching encounter types:', err)
    }
  }
})

const diagnosesArray = computed(() => {
  if (!diagnosesText.value || !diagnosesText.value.trim()) {
    return []
  }
  try {
    return JSON.parse(diagnosesText.value)
  } catch (e) {
    return []
  }
})

async function handleSubmit() {
  const payload = {
    appointment_id: formData.value.appointment_id,
    encounter_class: formData.value.encounter_class,
    encounter_types: formData.value.encounter_types,
    diagnoses: diagnosesArray.value,
    note: formData.value.note || null,
    complaints: formData.value.complaints || null,
    clinical_exam: formData.value.clinical_exam || null,
    assigned_treatment: formData.value.assigned_treatment || null
  }

  if (
      !payload.appointment_id ||
      !Array.isArray(payload.encounter_class) ||
      payload.encounter_class.length === 0 ||
      !Array.isArray(payload.encounter_types) ||
      payload.encounter_types.length === 0
  ) {
    ElMessage.error('Нужно указать ID приёма, encounter_class[] и encounter_types[]')
    return
  }

  try {
    const response = await observation.CREATE_OBSERVATION(payload)
    ElMessage.success('Наблюдение (observation) успешно создано!')
    emit('success')
  } catch (err) {

    console.error('Error creating observation:', err)
    ElMessage.error('Ошибка при создании Observation')
  }
}
</script>

<style scoped>
</style>