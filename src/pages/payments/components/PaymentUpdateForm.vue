<template>
  <el-form
      ref="myUpdateForm"
      :model="updateForm"
      :rules="rules"
      label-width="120px"
      label-position="top"
  >
    <div class="bg-gray-100 p-4 rounded-lg">
      <el-form-item label="Сумма" prop="paid_amount">
        <el-input v-model="updateForm.paid_amount" placeholder="Введите сумму платежа" />
        <div v-if="discountPercent > 0" class="text-sm text-gray-600 mt-1">
          Скидка: {{ discountPercent }}%
        </div>
      </el-form-item>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <el-form-item label="Тип оплаты" prop="payment_type">
        <el-select v-model="updateForm.payment_type" placeholder="Выберите тип оплаты">
          <el-option label="Наличные" value="CASH" />
          <el-option label="Карта" value="CARD" />
        </el-select>
      </el-form-item>
      <el-form-item label="Статус" prop="status">
        <el-select v-model="updateForm.status" placeholder="Выберите статус платежа">
          <el-option label="Оплачен" value="paid" />
          <el-option label="Не оплачен" value="unpaid" />
        </el-select>
      </el-form-item>
    </div>
    <el-form-item label="Дата платежа" prop="payment_date">
      <el-date-picker
          v-model="updateForm.payment_date"
          type="datetime"
          placeholder="Выберите дату платежа"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
      />
    </el-form-item>
    <el-form-item>
      <div class="flex justify-end w-full">
        <el-button type="primary" :loading="submitLoading" @click="submitUpdate">
          Обновить платеж
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import { paymentsStore } from "@/store/paymentsStore";

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
});
const emit = defineEmits([ 'success' ]);

const store = paymentsStore();

const updateForm = reactive({
  paid_amount: '',
  payment_type: '',
  status: '',
  payment_date: ''
});

const rules = {
  paid_amount: [
    {required: true, message: 'Введите сумму платежа', trigger: 'blur'}
  ],
  payment_type: [
    {required: true, message: 'Выберите тип оплаты', trigger: 'change'}
  ],
  status: [
    {required: true, message: 'Выберите статус платежа', trigger: 'change'}
  ],
  payment_date: [
    {required: true, message: 'Выберите дату платежа', trigger: 'change'}
  ]
};

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    updateForm.paid_amount = newVal.amount;
    updateForm.payment_type = newVal.payment_type;
    updateForm.status = 'paid';
    updateForm.payment_date = newVal.payment_date
        ? moment(newVal.payment_date).format("YYYY-MM-DD HH:mm:ss")
        : moment().format("YYYY-MM-DD HH:mm:ss");
  }
}, {immediate: true});

const myUpdateForm = ref(null);
const submitLoading = ref(false);

const discountPercent = computed(() => {
  const original = parseFloat(props.initialData.amount);
  const current = parseFloat(updateForm.paid_amount);
  if (!isNaN(original) && !isNaN(current) && current < original) {
    let discount = ((original - current) / original) * 100;
    return Math.round(discount);
  }
  return 0;
});

const submitUpdate = () => {
  myUpdateForm.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const formattedDate = moment(updateForm.payment_date, "YYYY-MM-DD HH:mm:ss").toISOString();
      await store.UPDATE_PAYMENT(props.initialData.id, {
        ...updateForm,
        payment_date: formattedDate
      });
      emit('success', {...updateForm});
      ElMessage.success('Платеж успешно обновлен');
    } catch (error) {
      ElMessage.error('Ошибка обновления платежа');
      console.error(error);
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style scoped>
.text-sm {
  font-size: 0.875rem;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>