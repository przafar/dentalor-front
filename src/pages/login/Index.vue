<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-center text-gray-700">
        Авторизация
      </h2>
      <p class="text-sm text-center text-gray-500 mb-6">
        DentaLor
      </p>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="formRef"
        class="space-y-4"
        label-position="top"
      >
        <el-form-item prop="email" label="Email">
          <el-input
            v-model="loginForm.email"
            placeholder="Enter your email"
            class="w-full"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password" label="Password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Enter your password"
            class="w-full"
          ></el-input>
        </el-form-item>

        <div class="flex justify-between items-center">
          <el-checkbox v-model="rememberMe">Запомнить пароль</el-checkbox>
          
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
     
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';

const loginForm = ref({
  email: '',
  password: '',
});
const rememberMe = ref(false);
const loading = ref(false);
const formRef = ref(null);

const store = authStore();
const router = useRouter();

const rules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
  ],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
};

const handleLogin = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        await store.login(loginForm.value);
        ElNotification({
          title: 'Success',
          message: 'You have logged in successfully!',
          type: 'success',
        });
        router.push('/patient'); // Redirect after successful login
      } catch (error) {
        ElNotification({
          title: 'Error',
          message: error.message || 'Login failed',
          type: 'error',
        });
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>