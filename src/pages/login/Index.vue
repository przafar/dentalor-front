<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <!-- Заголовок -->
      <h2 class="text-2xl font-semibold text-center text-gray-700 mb-4">
        {{ showOrgSelect ? 'Выбор организации' : 'Авторизация' }}
      </h2>
      <p v-if="!showOrgSelect" class="text-sm text-center text-gray-500 mb-6">
        DentaLor
      </p>

      <transition name="fade" mode="out-in">
        <!-- Форма логина -->
        <el-form
            v-if="!showOrgSelect"
            key="login"
            :model="loginForm"
            :rules="rules"
            ref="formRef"
            class="space-y-4"
            label-position="top"
        >
          <el-form-item prop="email" label="Email">
            <el-input
                v-model="loginForm.email"
                placeholder="Введите email"
                class="w-full"
            />
          </el-form-item>

          <el-form-item prop="password" label="Пароль">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Введите пароль"
                class="w-full"
            />
          </el-form-item>

          <div class="flex items-center justify-between">
            <el-checkbox v-model="rememberMe">Запомнить меня</el-checkbox>
          </div>

          <el-button
              type="primary"
              class="w-full mt-4"
              size="large"
              @click="handleLogin"
              :loading="loading"
          >
            Войти
          </el-button>
        </el-form>

        <!-- Форма выбора организации -->
        <el-form
            v-else
            key="select"
            :model="{ org: selectedOrg }"
            ref="orgFormRef"
            class="space-y-4"
            label-position="top"
        >
          <el-form-item
              prop="org"
              label="Организация"
              :rules="[{ required: true, message: 'Выберите организацию', trigger: 'change' }]"
          >
            <el-select
                v-model="selectedOrg"
                placeholder="Выберите организацию"
                class="w-full"
                value-key="id"
            >
              <el-option
                  v-for="o in organizations"
                  :key="o.id"
                  :label="o.name_ru"
                  :value="o"
              />
            </el-select>
          </el-form-item>

          <el-button
              type="primary"
              class="w-full mt-4"
              size="large"
              @click="confirmOrganization"
              :disabled="!selectedOrg"
          >
            Подтвердить
          </el-button>
        </el-form>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import jwt_decode from 'jwt-decode';
import { authStore } from '@/store/auth';
import axios from '@/plugins/axios';

const router = useRouter();
const store = authStore();

// Login state
const loginForm = ref({email: '', password: ''});
const rememberMe = ref(false);
const loading = ref(false);
const formRef = ref(null);

// Org select state
const showOrgSelect = ref(false);
const organizations = ref([]);
const selectedOrg = ref(null);
const orgFormRef = ref(null);

// Validation rules
const rules = {
  email: [ {required: true, message: 'Email обязателен', trigger: 'blur'} ],
  password: [ {required: true, message: 'Пароль обязателен', trigger: 'blur'} ],
};

// Step 1: Handle login
async function handleLogin() {
  formRef.value.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // Perform login, store token under 'token'
      const {accessToken} = await store.login({email: loginForm.value.email, password: loginForm.value.password});
      localStorage.setItem('token', accessToken);

      // Decode and extract organizations
      const payload = jwt_decode(accessToken);
      organizations.value = payload.organizations || [];
      localStorage.setItem('organizations', JSON.stringify(organizations.value));

      showOrgSelect.value = true;
    } catch (err) {
      ElNotification.error({
        title: 'Ошибка',
        message: err.response?.data?.message || err.message || 'Не удалось войти'
      });
    } finally {
      loading.value = false;
    }
  });
}

// Step 2: Confirm organization
async function confirmOrganization() {
  // Save full organization object
  localStorage.setItem('current_organization', JSON.stringify(selectedOrg.value));
  // Set axios header to org id
  axios.defaults.headers.common['organization-id'] = selectedOrg.value.id;

  ElNotification.success({
    title: 'Успех',
    message: 'Организация выбрана'
  });

  try {
    await router.push({name: 'patients'});
  } catch (err) {
    console.warn('Navigation error:', err);
  }
}
</script>

<style scoped>
/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

body {
  font-family: 'Inter', sans-serif;
}
</style>
