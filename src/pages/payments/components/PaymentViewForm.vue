<template>
  <div >
    <!-- Основные данные платежа -->
    <el-descriptions title="Детали платежа" border column="1">
      <el-descriptions-item label="ID">
        {{ payment.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Сумма">
        {{ payment.amount }}
      </el-descriptions-item>
      <el-descriptions-item label="Set Amount">
        {{ payment.set_amount || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Paid Amount">
        {{ payment.paid_amount || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Дата платежа">
        {{ formatDate(payment.payment_date) }}
      </el-descriptions-item>
      <el-descriptions-item label="Тип оплаты">
        <el-tag :type="payment.payment_type === 'CASH' ? 'success' : 'info'">
          {{ payment.payment_type === 'CASH' ? 'Наличные' : 'Карта' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Статус">
        <el-tag :type="payment.status === 'paid' ? 'success' : 'danger'">
          {{ payment.status === 'paid' ? 'Оплачен' : 'Не оплачен' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Payer ID">
        {{ payment.payer_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Operator ID">
        {{ payment.operator_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Appointment ID">
        {{ payment.appointment_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Paid Service ID">
        {{ payment.paid_service_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Organization ID">
        {{ payment.organization_id }}
      </el-descriptions-item>
      <el-descriptions-item label="Created At">
        {{ formatDate(payment.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Updated At">
        {{ formatDate(payment.updated_at) }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- Данные встречи -->
    <el-descriptions
        v-if="payment.appointment"
        title="Детали встречи"
        border
        column="1"
        class="mt-6"
    >
      <el-descriptions-item label="ID">
        {{ payment.appointment.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Класс встречи">
        {{ payment.appointment.encounter_class }}
      </el-descriptions-item>
      <el-descriptions-item label="Тип встречи">
        {{ payment.appointment.encounter_type }}
      </el-descriptions-item>
      <el-descriptions-item label="Причина">
        {{ payment.appointment.reason_text || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Patient ID">
        {{ payment.appointment.patient_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Статус">
        {{ payment.appointment.status }}
      </el-descriptions-item>
      <el-descriptions-item label="Created At">
        {{ formatDate(payment.appointment.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Updated At">
        {{ formatDate(payment.appointment.updated_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Прочее">
        <div class="space-y-1">
          <div><strong>Created By:</strong> {{ payment.appointment.created_by || '-' }}</div>
          <div><strong>Updated By:</strong> {{ payment.appointment.updated_by || '-' }}</div>
          <div><strong>Time:</strong> {{ payment.appointment.time || '-' }}</div>
          <div><strong>Date:</strong> {{ payment.appointment.date || '-' }}</div>
          <div><strong>Practitioner Role:</strong> {{ payment.appointment.practitioner_role || '-' }}</div>
          <div>
            <strong>Slots:</strong>
            <span v-if="payment.appointment.slots && payment.appointment.slots.length">
              {{ payment.appointment.slots.join(', ') }}
            </span>
            <span v-else>-</span>
          </div>
          <div><strong>Observation ID:</strong> {{ payment.appointment.observation_id || '-' }}</div>
          <div><strong>Prescription ID:</strong> {{ payment.appointment.prescription_id || '-' }}</div>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="История">
        <span v-if="payment.appointment.history">
          {{ JSON.stringify(payment.appointment.history, null, 2) }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>

    <!-- Данные пациента -->
    <el-descriptions
        v-if="payment.patient"
        title="Детали пациента"
        border
        column="1"
        class="mt-6"
    >
      <el-descriptions-item label="ID">
        {{ payment.patient.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Ф.И.О">
        {{ payment.patient.last_name }} {{ payment.patient.first_name }} {{ payment.patient.middle_name }}
      </el-descriptions-item>
      <el-descriptions-item label="Телефон">
        {{ payment.patient.phone_number || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Дата рождения">
        {{ formatDate(payment.patient.birth_date) }}
      </el-descriptions-item>
      <el-descriptions-item label="Пол">
        {{ payment.patient.gender || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Organization ID">
        {{ payment.patient.organization_id }}
      </el-descriptions-item>
      <el-descriptions-item label="Tech ID">
        {{ payment.patient.tech_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Created At">
        {{ formatDate(payment.patient.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Updated At">
        {{ formatDate(payment.patient.updated_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Identifier">
        <span v-if="payment.patient.identifier && payment.patient.identifier.length">
          <span v-for="(idObj, index) in payment.patient.identifier" :key="index">
            {{ idObj.display }}: {{ idObj.value }}<span v-if="index < payment.patient.identifier.length - 1">, </span>
          </span>
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>

    <!-- Данные наблюдения -->
    <el-descriptions
        v-if="payment.observation"
        title="Детали наблюдения"
        border
        column="1"
        class="mt-6"
    >
      <el-descriptions-item label="ID">
        {{ payment.observation.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Appointment ID">
        {{ payment.observation.appointment_id }}
      </el-descriptions-item>
      <el-descriptions-item label="Класс встречи">
        <span v-if="payment.observation.encounter_class && payment.observation.encounter_class.length">
          {{ payment.observation.encounter_class.join(', ') }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="Тип встречи">
        <span v-if="payment.observation.encounter_types && payment.observation.encounter_types.length">
          {{ payment.observation.encounter_types.join(', ') }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="Note">
        {{ payment.observation.note || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Complaints">
        {{ payment.observation.complaints || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Clinical Exam">
        {{ payment.observation.clinical_exam || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Assigned Treatment">
        {{ payment.observation.assigned_treatment || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Created At">
        {{ formatDate(payment.observation.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Updated At">
        {{ formatDate(payment.observation.updated_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="History">
        <span v-if="payment.observation.history">
          {{ JSON.stringify(payment.observation.history, null, 2) }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="Updated By">
        {{ payment.observation.updated_by || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import moment from 'moment';

const props = defineProps({
  payment: {
    type: Object,
    required: true
  }
});

const formatDate = (date) => {
  if (!date) return '-';
  return moment(date).format("DD-MM-YYYY HH:mm");
};
</script>

<style scoped>

</style>