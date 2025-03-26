<template>
  <div class="patient_relative">
    <div class="new_patient_box">
      <div class="new_patient_body">
        <div class="patient_left_bio">
          <div class="new_patient_image">
            <div
                class="demo-image__preview"
                v-if="patient && patient.gender === '2'"
            >
              <el-image
                  :src="femaleIcon"
                  :zoom-rate="1.2"
                  :max-scale="7"
                  :min-scale="1.2"
                  :initial-index="4"
                  fit="contain"
              >
                <template #error>
                  <img :src="femaleIcon" alt="women" />
                </template>
              </el-image>
            </div>
            <div class="demo-image__preview" v-else>
              <el-image
                  :src="maleIcon"
                  :zoom-rate="1.2"
                  :max-scale="7"
                  :min-scale="0.2"
                  :initial-index="4"
                  fit="contain"
                  error
              >
                <template #error>
                  <img :src="maleIcon" alt="men" />
                </template>
              </el-image>
            </div>
            <router-link
                v-if="patient && patient.id"
                :to="{ name: 'patient-show', params: { id: patient.id } }"
            >
              <el-skeleton :loading="!patient" animated>
                <template #template>
                  <el-skeleton-item class="mt-2" variant="text" style="width: 80%"></el-skeleton-item>
                </template>
                <template #default>
                  {{ patient.last_name }} {{ patient.first_name }} {{ patient.middle_name }}
                </template>
              </el-skeleton>
            </router-link>
            <span v-else class="ml-2 href_fontsize">-</span>
          </div>
        </div>

        <div class="new_patient_info ">
          <div
              class="new_patient_info_item table-icon__item copy_identifier"
              @click="patient && copyToClipboard(patient.tech_id)"
          >
          <div class="flex items-center">
              <Icon icon="material-symbols:grid-3x3-rounded" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>TECH ID</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 60%"></el-skeleton-item>
              </template>
              <template #default>
                <span>{{ patient.tech_id }}</span>
              </template>
            </el-skeleton>
          </div>
          <div class="new_patient_info_item">
            <div>
              <Icon icon="material-symbols:phone-in-talk-rounded" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>Номер телефона</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 50%"></el-skeleton-item>
              </template>
              <template #default>
                <span>+{{ patient.phone_number && patient.phone_number ? patient.phone_number : '-' }}</span>
              </template>
            </el-skeleton>
          </div>
          <div class="new_patient_info_item">
            <div>
              <Icon icon="material-symbols:view-agenda-outline" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>Пол</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 30%"></el-skeleton-item>
              </template>
              <template #default>
                <span>
                  {{ patient.gender === '2' ? 'Женский' : (patient.gender === '1' ? 'Мужской' : '-') }}
                </span>
              </template>
            </el-skeleton>
          </div>

          <div class="new_patient_info_item">
            <div>
              <Icon icon="material-symbols:date-range" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>Дата рождения</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 40%"></el-skeleton-item>
              </template>
              <template #default>
                <span>{{ patient.birth_date ? formatData(patient.birth_date) : '-' }}</span>
              </template>
            </el-skeleton>
          </div>
          <div
              class="new_patient_info_item table-icon__item copy_identifier"
              @click="copyToClipboard(pinValue(patient.identifier))"
          >
            <div>
              <Icon icon="material-symbols:id-card-outline-rounded" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>ПИНФЛ</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 40%"></el-skeleton-item>
              </template>
              <template #default>
                <span>{{ pinValue(patient.identifier) }}</span>
              </template>
            </el-skeleton>
          </div>
          <div
              class="new_patient_info_item table-icon__item copy_identifier"
              @click="copyToClipboard(passportValue(patient.identifier))"
          >
            <div class="d-flex justify-content-between">
              <Icon icon="material-symbols:id-card-outline-rounded" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>Паспорт</h5>
            </div>
            <el-skeleton :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 40%"></el-skeleton-item>
              </template>
              <template #default>
                <span>{{ passportValue(patient.identifier) }}</span>
              </template>
            </el-skeleton>
          </div>



        </div>
        <div class="new_patient_address">
          <div class="patient_address_item">
            <div>
              <Icon icon="material-symbols:calendar-clock-rounded" class="text-[18px] mr-2 text-[#385df0]" :ssr="true" />
              <h5>Создано</h5>
            </div>
            <el-skeleton :rows="3" :loading="!patient" animated>
              <template #template>
                <el-skeleton-item class="mt-2" variant="text" style="width: 80%"></el-skeleton-item>
              </template>
              <template #default>
                <span class="new_address_text">
                  {{ patient.created_at ? formatData(patient.created_at) : '-' }}
                </span>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import moment from 'moment';
import { ElMessage } from 'element-plus';
import femaleIcon from '@/assets/image/female.png';
import maleIcon from '@/assets/image/men.png';
import { Icon } from "@iconify/vue";

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
});

const patient = computed(() => props.info);

const pinValue = (identifiers) => {
  const item = identifiers?.find((item) => item?.type === 'NNUZB');
  return item ? item.value : '-';
};

const passportValue = (identifiers) => {
  const czItem = identifiers?.find((item) => item?.type === 'CZ');
  const ppnItem = identifiers?.find((item) => item?.type === 'PPN');
  if (czItem) {
    return czItem.value;
  } else if (ppnItem) {
    return ppnItem.value;
  } else {
    return '-';
  }
};

const formatData = (date) => {
  return moment(date).format('DD-MM-YYYY');
};



const copyToClipboard = (value) => {
  if (value) {
    navigator.clipboard
        .writeText(value)
        .then(() => {
          ElMessage({
            message: 'Скопировано',
            type: 'success',
          });
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
        });
  }
};
</script>