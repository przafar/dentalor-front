<template>
  <div>
    <div v-if="pdfUrl">
      <iframe :src="pdfUrl" width="100%" height="700px"></iframe>
      <div class="flex justify-end mt-4">
        <a :href="pdfUrl" :download="`${initialData.patient.tech_id}.pdf`">
          <el-button type="primary">
            <Icon icon="material-symbols:file-save-outline-rounded" class="text-[20px] text-white" :ssr="true" />
            <span class="ml-2">Скачать PDF</span>
          </el-button>
        </a>
      </div>
    </div>
    <div v-else>
      <div v-loading="true"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { prescriptionStore } from "@/store/prescription"
import { Icon } from "@iconify/vue";

const props = defineProps({
  initialData: {type: Object, required: true}
})
const emit = defineEmits([ 'success' ])
const store = prescriptionStore()

const pdfUrl = ref('')

const fetchPDF = async () => {
  const response = await store.GET_PDF_DOCUMENT(props.initialData?.prescriptions[0]?.id)
  console.log(response, 'ressss')
  if (response && response.data) {
    pdfUrl.value = URL.createObjectURL(response.data)
  }
}

onMounted(async () => {
  await fetchPDF()
})
</script>