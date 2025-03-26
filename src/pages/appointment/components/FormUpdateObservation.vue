<template>
  <div>
    <el-form
        ref="observationForm"
        :model="formData"
        label-position="top"
        class="space-y-4"
        @submit.prevent="handleSubmit"
    >
      <el-form-item label="ID приёма" prop="appointment_id">
        <el-input
            v-model="formData.appointment_id"
            disabled
            class="bg-gray-100 cursor-not-allowed"
        />
      </el-form-item>

      <el-form-item label="Encounter Class (код)" prop="encounter_class">
        <el-select
            v-model="selectedEncounterClass"
            placeholder="Выберите encounter class"
            disabled
        >
          <el-option
              v-if="initialEncounterClass"
              :label="initialEncounterClass.display"
              :value="initialEncounterClass.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Encounter Types" prop="encounter_types">
        <el-select
            v-model="formData.encounter_types"
            multiple
            filterable
            placeholder="Выберите encounter types"
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

      <el-form-item label="Примечание (note)" prop="note">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Любая дополнительная информация"
            v-model="formData.note"
        />
      </el-form-item>

      <el-form-item label="Жалобы и анамнез (complaints)" prop="complaints">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Опишите жалобы..."
            v-model="formData.complaints"
        />
      </el-form-item>

      <el-form-item label="Клинический осмотр (clinical_exam)" prop="clinical_exam">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Описание осмотра"
            v-model="formData.clinical_exam"
        />
      </el-form-item>

      <el-form-item label="Назначенное лечение (assigned_treatment)" prop="assigned_treatment">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Текст назначения"
            v-model="formData.assigned_treatment"
        />
      </el-form-item>

      <div class="flex justify-end mt-6">
        <el-button type="primary" @click="handleSubmit">
          Сохранить изменения
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { observationStore } from '@/store/observations'
import { servicesStore } from '@/store/services'

const observation = observationStore()
const services = servicesStore()

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['success'])

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

const initialEncounterClass = computed(() => {
  return props.initialData.encounter_class && props.initialData.encounter_class.length
      ? props.initialData.encounter_class[0]
      : null
})
const selectedEncounterClass = ref('')

const getEncounterTypes = computed(() => services.encounterTypes)

onMounted(async () => {
  console.log('FormUpdateObservation mounted with props:', props.initialData)
  formData.value.appointment_id = props.initialData.appointment_id

  if (initialEncounterClass.value) {
    selectedEncounterClass.value = initialEncounterClass.value.code
    formData.value.encounter_class = [initialEncounterClass.value.code]
  } else {
    selectedEncounterClass.value = ''
    formData.value.encounter_class = []
  }

  formData.value.encounter_types = props.initialData.encounter_types || []

  formData.value.note = props.initialData.note || ''
  formData.value.complaints = props.initialData.complaints || ''
  formData.value.clinical_exam = props.initialData.clinical_exam || ''
  formData.value.assigned_treatment = props.initialData.assigned_treatment || ''

  if (selectedEncounterClass.value) {
    try {
      await services.GET_LIST_OF_ECOUNTER_TYPES(selectedEncounterClass.value)
    } catch (err) {
      console.error('Error fetching encounter types:', err)
    }
  }
})

async function handleSubmit() {
  const payload = {
    appointment_id: formData.value.appointment_id,
    encounter_class: formData.value.encounter_class,
    encounter_types: formData.value.encounter_types,
    diagnoses: formData.value.diagnoses,
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
    await observation.UPDATE_OBSERVATION(props.initialData.id, payload)
    ElMessage.success('Наблюдение успешно обновлено!')
    emit('success')
  } catch (err) {
    console.error('Error updating observation:', err)
    ElMessage.error('Ошибка при обновлении Observation')
  }
}
</script>

<style scoped>
</style>