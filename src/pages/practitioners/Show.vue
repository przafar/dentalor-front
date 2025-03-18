<template>
  <div class="p-4">
    <!-- Шапка страницы -->
    <div class="mb-4">
      <button @click="$router.back()" class="text-blue-600 hover:underline">&larr; Назад</button>
    </div>

    <!-- Карточка с данными практикующего -->
    <div class="bg-white shadow rounded p-6 mb-6">
      <h2 class="text-2xl font-semibold mb-4">Детали практикующего</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span class="font-bold">ФИО:</span>
          <span>{{ practitioner.last_name }} {{ practitioner.first_name }} {{ practitioner.middle_name }}</span>
        </div>
        <div>
          <span class="font-bold">Пол:</span>
          <span>
            {{ practitioner.gender === 'male' ? 'Мужской' : (practitioner.gender === 'female' ? 'Женский' : 'Не указан') }}
          </span>
        </div>
        <div>
          <span class="font-bold">Телефон:</span>
          <span>{{ practitioner.phone_number }}</span>
        </div>
        <div>
          <span class="font-bold">Адрес:</span>
          <span>{{ practitioner.address }}</span>
        </div>
      </div>
      <div class="mt-6">
        <el-button type="primary" @click="openRoleDialog">Добавить/Изменить роль</el-button>
      </div>
    </div>

    <!-- Секция для отображения ролей -->
    <div v-if="practitioner.roles && practitioner.roles.length" class="mb-6">
      <h3 class="text-xl font-semibold mb-4">Роли</h3>
      <div class="grid grid-cols-1 gap-4">
        <div v-for="role in practitioner.roles" :key="role.id" class="bg-white shadow rounded p-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-bold">Логин:</div>
              <div>{{ role.login }}</div>
            </div>
            <div>
              <div class="font-bold">Роль:</div>
              <div>{{ role.role || 'Не указано' }}</div>
            </div>
          </div>
          <div class="mt-2">
            <div class="font-bold">Специальность:</div>
            <div>{{ role.specialty }}</div>
          </div>
          <div class="mt-2">
            <div class="font-bold">Рабочие часы:</div>
            <div class="text-sm">
              <div>Пн: {{ role.working_hours.mon }}</div>
              <div>Вт: {{ role.working_hours.tue }}</div>
              <div>Ср: {{ role.working_hours.wed }}</div>
              <div>Чт: {{ role.working_hours.thu }}</div>
              <div>Пт: {{ role.working_hours.fri }}</div>
            </div>
          </div>
          <div class="mt-2">
            <div class="font-bold">Права:</div>
            <div>{{ role.roles ? role.roles.roles : 'Не указаны' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог для добавления/изменения роли -->
    <el-dialog v-model="roleDialogVisible" :title="roleUpdateMode ? 'Изменить роль' : 'Добавить роль'" width="40%">
      <el-form :model="roleForm" ref="roleFormRef" label-width="120px" label-position="top">
        <el-form-item label="Логин" prop="login">
          <el-input v-model="roleForm.login" placeholder="Введите логин" />
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input v-model="roleForm.password" placeholder="Введите пароль" show-password />
        </el-form-item>
        <!-- Вместо текстового поля используем select, где варианты берутся из каталога ролей -->
        <el-form-item label="Роль" prop="role">
          <el-select v-model="roleForm.role" placeholder="Выберите роль">
            <el-option
                v-for="item in catalog.getRoles"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Специальность" prop="specialty">
          <el-input v-model="roleForm.specialty" placeholder="Введите специальность" />
        </el-form-item>
        <el-form-item label="Рабочие часы" prop="working_hours">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium">Пн</label>
              <el-input v-model="roleForm.working_hours.mon" placeholder="09:00-17:00" />
            </div>
            <div>
              <label class="block text-sm font-medium">Вт</label>
              <el-input v-model="roleForm.working_hours.tue" placeholder="09:00-17:00" />
            </div>
            <div>
              <label class="block text-sm font-medium">Ср</label>
              <el-input v-model="roleForm.working_hours.wed" placeholder="09:00-17:00" />
            </div>
            <div>
              <label class="block text-sm font-medium">Чт</label>
              <el-input v-model="roleForm.working_hours.thu" placeholder="09:00-17:00" />
            </div>
            <div>
              <label class="block text-sm font-medium">Пт</label>
              <el-input v-model="roleForm.working_hours.fri" placeholder="09:00-17:00" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRoleDialog">Отмена</el-button>
          <el-button type="primary" @click="submitRole">Сохранить</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "@/plugins/axios/index";
import { practitionersStore } from "@/store/practitioners";
import { catalogsStore } from "@/store/catalogs.js";
import { ElMessage } from "element-plus";
import jwt_decode from "jwt-decode";

const route = useRoute();
const practitioner = ref({});
const catalog = catalogsStore();
const store = practitionersStore();

// Функция для загрузки данных практикующего из токена
const loadPractitionerFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwt_decode(token);
      if (decoded && decoded.practitioner) {
        practitioner.value = decoded.practitioner;
      }
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
    }
  }
};

// Используем store.GET_PRACTITIONER_BY_ID вместо прямого вызова axios
const fetchPractitioner = async () => {
  try {
    if (route.params.id) {
      const response = await store.GET_PRACTITIONER_BY_ID(route.params.id);
      practitioner.value = response.data;
    } else {
      loadPractitionerFromToken();
    }
  } catch (error) {
    ElMessage.error("Ошибка загрузки данных практикующего");
    console.error(error);
  }
};

onMounted(async () => {
  await fetchPractitioner();
  // Загружаем справочник ролей из каталога
  await catalog.GET_ROLES();
});

// Флаг для определения режима: обновление или создание роли
const roleUpdateMode = ref(false);
const roleId = ref(null);

// Модальное окно и форма для роли
const roleDialogVisible = ref(false);
const roleForm = ref({
  login: "",
  password: "",
  role: "",
  specialty: "",
  working_hours: {
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: ""
  }
});
const roleFormRef = ref(null);

const openRoleDialog = () => {
  // Если у практикующего уже есть роли, берем первую для обновления
  if (practitioner.value.roles && practitioner.value.roles.length) {
    const existingRole = practitioner.value.roles[0];
    roleForm.value = {
      login: existingRole.login || "",
      password: "", // пароль не возвращается из БД, поэтому оставляем пустым
      role: existingRole.role || "",
      specialty: existingRole.specialty || "",
      working_hours: {
        mon: existingRole.working_hours?.mon || "",
        tue: existingRole.working_hours?.tue || "",
        wed: existingRole.working_hours?.wed || "",
        thu: existingRole.working_hours?.thu || "",
        fri: existingRole.working_hours?.fri || ""
      }
    };
    roleId.value = existingRole.id;
    roleUpdateMode.value = true;
  } else {
    roleForm.value = {
      login: "",
      password: "",
      role: "",
      specialty: "",
      working_hours: {
        mon: "",
        tue: "",
        wed: "",
        thu: "",
        fri: ""
      }
    };
    roleId.value = null;
    roleUpdateMode.value = false;
  }
  roleDialogVisible.value = true;
};

const closeRoleDialog = () => {
  roleDialogVisible.value = false;
};

const submitRole = async () => {
  const payload = {
    practitioner_id: practitioner.value.id,
    login: roleForm.value.login,
    password: roleForm.value.password,
    role: roleForm.value.role,
    working_hours: roleForm.value.working_hours,
    specialty: roleForm.value.specialty
  };

  try {
    if (roleUpdateMode.value && roleId.value) {
      await axios.put(`practitioner_roles/${roleId.value}`, payload);
      ElMessage.success("Роль успешно обновлена");
    } else {
      await axios.post("practitioner_roles", payload);
      ElMessage.success("Роль успешно добавлена");
    }
    roleDialogVisible.value = false;
    // Сброс формы
    roleForm.value = {
      login: "",
      password: "",
      role: "",
      specialty: "",
      working_hours: {
        mon: "",
        tue: "",
        wed: "",
        thu: "",
        fri: ""
      }
    };
    // Обновляем данные практикующего (если API возвращает новые данные с ролями)
    await fetchPractitioner();
  } catch (error) {
    ElMessage.error("Ошибка при сохранении роли");
    console.error(error);
  }
};
</script>

<style scoped>
/* Минималистичный стиль обеспечен использованием Tailwind CSS через классы в шаблоне */
</style>