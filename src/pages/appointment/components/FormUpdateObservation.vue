<template>
  <div>
    <el-form
        ref="observationForm"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="space-y-4"
        @submit.prevent="handleSubmit"
    >

      <el-form-item label="Направления" prop="encounter_class">
        <el-select v-model="selectedEncounterClass" placeholder="Выберите encounter class" disabled>
          <el-option
              v-if="initialEncounterClass"
              :label="initialEncounterClass.display"
              :value="initialEncounterClass.code"
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
            value-key="id"
            collapse-tags
        >
          <el-option v-for="type in getEncounterTypes" :key="type.id" :label="type.display" :value="type" />
        </el-select>
      </el-form-item>



      <el-form-item label="Жалобы и анамнез " prop="complaints">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Опишите жалобы..."
            v-model="formData.complaints"
        />
      </el-form-item>

      <el-form-item label="Клинический осмотр " prop="clinical_exam">
        <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Описание осмотра"
            v-model="formData.clinical_exam"
        />
      </el-form-item>

      <el-form-item label="Назначенное лечение " prop="assigned_treatment">
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
        <el-button type="primary" @click="handleSubmit">Сохранить изменения</el-button>
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
  initialData: { type: Object, required: true }
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

const rules = {
  appointment_id: [{ required: true, message: 'ID приёма обязателен', trigger: 'blur' }],
  encounter_class: [{ required: true, message: 'Выберите encounter class', trigger: 'change' }],
  encounter_types: [{ type: 'array', required: true, message: 'Выберите encounter types', trigger: 'change' }]
}

onMounted(async () => {
  console.log(props, 'props.initialData')
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
      console.error(err)
    }
  }
})

async function handleSubmit() {
  const payload = {
    appointment_id: formData.value.appointment_id,
    encounter_class: formData.value.encounter_class,
    encounter_types: formData.value.encounter_types.map(item =>
        typeof item === 'object' && item.id ? item.id : item
    ),
    diagnoses: formData.value.diagnoses,
    note: formData.value.note || null,
    complaints: formData.value.complaints || null,
    clinical_exam: formData.value.clinical_exam || null,
    assigned_treatment: formData.value.assigned_treatment || null
  }

  try {
    await observation.UPDATE_OBSERVATION(props.initialData.id, payload)
    ElMessage.success('Наблюдение успешно обновлено!')
    emit('success')
  } catch (err) {
    console.error(err)
    ElMessage.error('Ошибка при обновлении Observation')
  }
}
</script>

<style scoped>
</style>