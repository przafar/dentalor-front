<template>
  <div >
    <h2 class="text-xl font-semibold mb-4"></h2>
    <el-form :model="form" ref="analysisForm" label-width="120px" label-position="top">
      <el-form-item label="Анализы" prop="analysesTypes">
        <el-select
            v-model="form.analysesTypes"
            multiple
            filterable
            placeholder="Выберите анализы"
            class="w-full"
            value-key="id"
        >
          <el-option
              v-for="analysis in analysisData"
              :key="analysis.id"
              :label="analysis.display"
              :value="analysis.id"
          />
        </el-select>
      </el-form-item>
      <div class="flex justify-end">

          <el-button type="primary" @click="submitForm">Создать запрос</el-button>
        </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { servicesStore } from "@/store/services";


const props = defineProps({
  initialData: { type: Object, required: true }
})
const emit = defineEmits(['success'])

const services = servicesStore();
const analysisData = computed(() => services.getAnalysisTypes);

const form = ref({
  appointment_id: 123,
  patient_id: 456,
  analysesTypes: []
});

const analysisForm = ref(null);

const submitForm = () => {
  analysisForm.value.validate((valid) => {
    if (valid) {
      const payload = {
        appointment_id: props.initialData.id,
        patient_id: props.initialData.patient.id,
        analysesTypes: form.value.analysesTypes
      }
      console.log("Payload:", payload);
    } else {
      console.log("Ошибка валидации!");
      return false;
    }
  });
};
</script>

<style scoped>
</style>