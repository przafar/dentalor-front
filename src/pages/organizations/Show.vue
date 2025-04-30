<template>
  <div>
    <div class="pt-4 pb-2 border-b border-gray-200 mb-6">
      <el-page-header @back="$router.push('/organizations')" class="flex items-center">
        <template #content>
          <h1 class="text-lg font-semibold text-gray-900">Детали организации</h1>
        </template>
      </el-page-header>
    </div>

    <el-card shadow="hover" class="mb-8">
      <div slot="header" class="flex justify-between items-center">
        <span class="text-xl font-medium text-gray-800">
          {{ organization.name_ru || '—' }}
        </span>
        <el-button type="primary" @click="openSettingsDialog">Настройки</el-button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
      </div>
    </el-card>

    <el-dialog
        v-model="settingsDialogVisible"
        title="Настройки организации"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="settingsForm"
          ref="settingsFormRef"
          :rules="rules"
          status-icon
          label-width="120px"
      >
        <el-form-item label="Логотип" prop="logo">
          <input type="file" accept="image/*" @change="onLogoChange" />
          <div v-if="fileList.logo.length" class="mt-2 flex items-center space-x-4">
            <img
                :src="fileList.logo[0].url
                ? `${config.API_BASE_URL_IMAGE}${fileList.logo[0].url}`
                : createObjectURL(fileList.logo[0])"
                alt="Preview"
                class="w-24 h-24 object-cover rounded"
            />
            <el-button type="text" @click="removeLogo">Удалить</el-button>
          </div>
        </el-form-item>

        <el-form-item label="Текст новости" prop="news_text">
          <el-input
              type="textarea"
              v-model="settingsForm.news_text"
              rows="3"
              placeholder="Введите текст новости"
          />
        </el-form-item>

        <!-- Реклама -->
        <el-form-item label="Реклама (картинка)" prop="ad_image">
          <input type="file" accept="image/*" @change="onAdChange" />
          <div v-if="fileList.ad_image.length" class="mt-2 flex items-center space-x-4">
            <img
                :src="fileList.ad_image[0].url
                ? `${config.API_BASE_URL_IMAGE}${fileList.ad_image[0].url}`
                : createObjectURL(fileList.ad_image[0])"
                alt="Preview"
                class="w-24 h-24 object-cover rounded"
            />
            <el-button type="text" @click="removeAd">Удалить</el-button>
          </div>
        </el-form-item>

        <el-form-item label="Нижний текст новости" prop="bottom_news_text">
          <el-input
              type="textarea"
              v-model="settingsForm.bottom_news_text"
              rows="2"
              placeholder="Введите нижний текст"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeSettingsDialog">Отмена</el-button>
        <el-button type="primary" @click="submitSettings">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { organizationsStore } from '@/store/organizations';
import { settingsStore } from '@/store/settingsStore';
import config from '@/config';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const orgStore = organizationsStore();
const setStore = settingsStore();

const organization = ref({});
const settingsDialogVisible = ref(false);
const settingsForm = ref({
  organization_id: '',
  logo: null,
  news_text: '',
  ad_image: null,
  bottom_news_text: ''
});
const fileList = ref({ logo: [], ad_image: [] });
const settingsFormRef = ref(null);

const rules = {
  news_text: [
    { required: true, message: 'Введите текст новости', trigger: 'blur' }
  ],
  bottom_news_text: [
    { required: true, message: 'Введите нижний текст', trigger: 'blur' }
  ]
};

async function fetchOrganization() {
  try {
    const resp = await orgStore.GET_ORGANIZATION_BY_ID(route.params.id);
    organization.value = resp.data;
    settingsForm.value.organization_id = resp.data.id;
  } catch (err) {
    console.error(err);
    ElMessage.error('Ошибка загрузки организации');
    router.push('/organizations');
  }
}

async function openSettingsDialog() {
  await fetchOrganization();
  try {
    const resp = await setStore.GET_SETTINGS(organization.value.id);
    const data = resp.data;
    settingsForm.value.news_text = data.news_text;
    settingsForm.value.bottom_news_text = data.bottom_news_text;
    fileList.value.logo = data.logo_url ? [{ url: data.logo_url }] : [];
    fileList.value.ad_image = data.ad_image_url ? [{ url: data.ad_image_url }] : [];
  } catch {
    fileList.value.logo = [];
    fileList.value.ad_image = [];
  }
  settingsDialogVisible.value = true;
}

function closeSettingsDialog() {
  settingsDialogVisible.value = false;
}

function onLogoChange(e) {
  const file = e.target.files[0];
  if (file) {
    fileList.value.logo = [file];
    settingsForm.value.logo = file;
  }
}

function removeLogo() {
  fileList.value.logo = [];
  settingsForm.value.logo = null;
}

function onAdChange(e) {
  const file = e.target.files[0];
  if (file) {
    fileList.value.ad_image = [file];
    settingsForm.value.ad_image = file;
  }
}

function removeAd() {
  fileList.value.ad_image = [];
  settingsForm.value.ad_image = null;
}

function createObjectURL(file) {
  return URL.createObjectURL(file);
}

async function submitSettings() {
  settingsFormRef.value.validate(async valid => {
    if (!valid) return;

    try {
      const payload = {
        organization_id: settingsForm.value.organization_id,
        news_text: settingsForm.value.news_text,
        bottom_news_text: settingsForm.value.bottom_news_text,
        logo_url: null,
        ad_image_url: null
      };

      if (settingsForm.value.logo) {
        const logoUrl = await setStore.UPLOAD_FILE(settingsForm.value.logo);
        payload.logo_url = logoUrl;
      } else if (fileList.value.logo[0]?.url) {
        payload.logo_url = fileList.value.logo[0].url;
      }

      if (settingsForm.value.ad_image) {
        const adUrl = await setStore.UPLOAD_FILE(settingsForm.value.ad_image);
        payload.ad_image_url = adUrl;
      } else if (fileList.value.ad_image[0]?.url) {
        payload.ad_image_url = fileList.value.ad_image[0].url;
      }

      console.log('Final payload:', JSON.stringify(payload, null, 2));

      await setStore.UPSERT_SETTINGS(payload);
      ElMessage.success('Настройки сохранены');
      settingsDialogVisible.value = false;
    } catch (err) {
      console.error('submitSettings error:', err);
    }
  });
}

onMounted(fetchOrganization);
</script>

<style scoped>
/* при необходимости добавьте стили */
</style>
