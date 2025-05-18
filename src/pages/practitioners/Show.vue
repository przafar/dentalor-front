<template>
  <div>
    <!-- Header -->
    <div class="pt-2 border-b border-[#eceeef]">
      <div class="relative rounded-lg-lg pb-2 pl-4">
        <el-page-header @back="$router.push('/practitioners')" class="flex items-center">
          <template #content>
            <h1 class="text-md font-semibold text-gray-800">Детали сотрудника</h1>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="p-4">
      <!-- Practitioner Info -->
      <div class="bg-white shadow border rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4">Детали практикующего</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span class="font-bold">ФИО:</span>
            <span>{{ practitioner.last_name }} {{ practitioner.first_name }} {{ practitioner.middle_name }}</span>
          </div>
          <div>
            <span class="font-bold">Пол:</span>
            <span>
              {{ practitioner.gender === 'male'
                ? 'Мужской'
                : practitioner.gender === 'female'
                    ? 'Женский'
                    : 'Не указан' }}
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
          <div>
            <span class="font-bold">Номер кабинета:</span>
            <span>
              {{ practitioner.roles && practitioner.roles.length
                ? practitioner.roles[0].room_number || '—'
                : '—' }}
            </span>
          </div>
          <div v-if="practitioner.organizations && practitioner.organizations.length">
            <span class="font-bold">Организации:</span>
            <ul class="list-disc list-inside">
              <li v-for="org in practitioner.organizations" :key="org.id">
                {{ org.name_ru }}
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-6">
          <el-button type="primary" @click="openRoleDialog">Добавить/Изменить роль</el-button>
        </div>
      </div>

      <!-- Roles List -->
      <div v-if="practitioner.roles && practitioner.roles.length" class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Роли</h3>
        <div class="grid grid-cols-1 gap-4">
          <div
              v-for="role in practitioner.roles"
              :key="role.id"
              class="bg-white shadow border rounded-lg p-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="font-bold">Роль:</div>
                <div>{{ role.role || 'Не указано' }}</div>
              </div>
              <div>
                <div class="font-bold">Номер кабинета:</div>
                <div>{{ role.room_number || '—' }}</div>
              </div>
            </div>
            <div class="mt-2">
              <div class="font-bold">Сервисы:</div>
              <div>{{ role.service || 'Не указано' }}</div>
            </div>
            <div class="mt-2">
              <div class="font-bold">Специальность:</div>
              <div>{{ role.specialty || 'Не указано' }}</div>
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
            <div class="mt-2" v-if="practitioner.organizations">
              <div class="font-bold">Организации:</div>
              <ul class="list-disc list-inside text-sm">
                <li v-for="org in practitioner.organizations" :key="org.id">
                  {{ org.name_ru }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Dialog -->
    <el-dialog
        v-model="roleDialogVisible"
        :title="roleUpdateMode ? 'Изменить роль' : 'Добавить роль'"
        width="50%"
    >
      <el-form
          :model="roleForm"
          ref="roleFormRef"
          label-width="120px"
          label-position="top"
      >
        <template v-if="roleUpdateMode">
          <el-form-item label="Логин" prop="login">
            <el-input
                v-model="roleForm.login"
                placeholder="Введите логин"
                autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="Пароль" prop="password">
            <el-input
                v-model="roleForm.password"
                placeholder="Введите пароль"
                show-password
                autocomplete="new-password"
            />
          </el-form-item>
        </template>

        <el-form-item label="Организация" prop="organization">
          <el-select
              v-model="roleForm.organization"
              placeholder="Выберите организацию"
              multiple
          >
            <el-option
                v-for="item in getAllOrganizations"
                :key="item.id"
                :label="item.name_ru"
                :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Роль" prop="role">
          <el-select
              v-model="roleForm.role"
              placeholder="Выберите роль"
              multiple
          >
            <el-option
                v-for="item in catalog.getRoles"
                :key="item.code"
                :label="item.label"
                :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Номер кабинета" prop="room_number">
          <el-input
              v-model="roleForm.room_number"
              placeholder="Введите номер кабинета"
          />
        </el-form-item>

        <el-form-item label="Сервис" prop="service">
          <el-select
              v-model="roleForm.service"
              placeholder="Выберите сервис"
              multiple
              clearable
          >
            <el-option
                v-for="item in service.getEncounterClasses"
                :key="item.id"
                :label="item.display"
                :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Специальность" prop="specialty">
          <el-input
              v-model="roleForm.specialty"
              placeholder="Введите специальность"
          />
        </el-form-item>

        <el-form-item label="Рабочие часы" prop="working_hours">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <div class="w-full">
              <label class="block text-sm font-medium">Пн</label>
              <el-input
                  v-model="roleForm.working_hours.mon"
                  placeholder="09:00-18:00"
              />
            </div>
            <div class="w-full">
              <label class="block text-sm font-medium">Вт</label>
              <el-input
                  v-model="roleForm.working_hours.tue"
                  placeholder="09:00-18:00"
              />
            </div>
            <div class="w-full">
              <label class="block text-sm font-medium">Ср</label>
              <el-input
                  v-model="roleForm.working_hours.wed"
                  placeholder="09:00-18:00"
              />
            </div>
            <div class="w-full">
              <label class="block text-sm font-medium">Чт</label>
              <el-input
                  v-model="roleForm.working_hours.thu"
                  placeholder="09:00-18:00"
              />
            </div>
            <div class="w-full">
              <label class="block text-sm font-medium">Пт</label>
              <el-input
                  v-model="roleForm.working_hours.fri"
                  placeholder="09:00-18:00"
              />
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/plugins/axios/index';
import { practitionersStore } from '@/store/practitioners';
import { organizationsStore } from '@/store/organizations';
import { servicesStore } from '@/store/services.js';
import { catalogsStore } from '@/store/catalogs.js';
import { ElMessage } from 'element-plus';
import jwt_decode from 'jwt-decode';

const route = useRoute();
const practitioner = ref({});
const catalog = catalogsStore();
const service = servicesStore();
const store = practitionersStore();
const organizationStore = organizationsStore();

const getAllOrganizations = computed(() => organizationStore.getOrganizations);

function loadPractitionerFromToken() {
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      const decoded = jwt_decode(token);
      if (decoded.practitioner) {
        practitioner.value = decoded.practitioner;
      }
    } catch (e) {
      console.error('Token decode error:', e);
    }
  }
}

async function fetchPractitioner() {
  try {
    if (route.params.id) {
      const resp = await store.GET_PRACTITIONER_BY_ID(route.params.id);
      practitioner.value = resp.data;
    } else {
      loadPractitionerFromToken();
    }
  } catch (e) {
    ElMessage.error('Ошибка загрузки данных практикующего');
    console.error(e);
  }
}

onMounted(async () => {
  await fetchPractitioner();
  await catalog.GET_ROLES();
  await service.GET_LIST_OF_ECOUNTER_CLASSES();
});

const roleDialogVisible = ref(false);
const roleUpdateMode = ref(false);
const roleId = ref(null);
const roleFormRef = ref(null);

const roleForm = ref({
  login: '',
  password: '',
  role: [],
  room_number: '',
  organization: [],
  specialty: '',
  service: [],
  working_hours: {
    mon: '09:00-18:00',
    tue: '09:00-18:00',
    wed: '09:00-18:00',
    thu: '09:00-18:00',
    fri: '09:00-18:00',
  },
});

const openRoleDialog = async () => {
  await organizationStore.GET_LIST_OF_ORGANIZATIONS({
    page: 1,
    per_page: 40,
  });
  if (practitioner.value.roles?.length) {
    const existing = practitioner.value.roles[0];
    roleUpdateMode.value = true;
    roleId.value = existing.id;
    roleForm.value = {
      login: existing.login || '',
      password: '',
      organization: practitioner.value.organizations?.map(o => o.id) || [],
      role: existing.role || [],
      room_number: existing.room_number || '',
      specialty: existing.specialty || '',
      service: existing.service || [],
      working_hours: { ...existing.working_hours },
    };
  } else {
    roleUpdateMode.value = false;
    roleId.value = null;
    roleForm.value = {
      login: '',
      password: '',
      role: [],
      room_number: '',
      organization: [],
      specialty: '',
      service: [],
      working_hours: {
        mon: '09:00-18:00',
        tue: '09:00-18:00',
        wed: '09:00-18:00',
        thu: '09:00-18:00',
        fri: '09:00-18:00',
      },
    };
  }
  roleDialogVisible.value = true;
};

function closeRoleDialog() {
  roleDialogVisible.value = false;
}

async function submitRole() {
  const payload = {
    practitioner_id: practitioner.value.id,
    role: roleForm.value.role,
    room_number: roleForm.value.room_number,
    specialty: roleForm.value.specialty,
    working_hours: roleForm.value.working_hours,
    organization: roleForm.value.organization,
    service: roleForm.value.service,
  };
  if (roleUpdateMode.value && roleId.value) {
    payload.login = roleForm.value.login;
    payload.password = roleForm.value.password;
  }

  try {
    if (roleUpdateMode.value && roleId.value) {
      await axios.put(`practitioner_roles/${roleId.value}`, payload);
      ElMessage.success('Роль успешно обновлена');
    } else {
      await axios.post('practitioner_roles', payload);
      ElMessage.success('Роль успешно добавлена');
    }
    roleDialogVisible.value = false;
    await fetchPractitioner();
  } catch (e) {
    ElMessage.error('Ошибка при сохранении роли');
    console.error(e);
  }
}

const rules = {
  role: [{ required: true, message: 'Выберите роль', trigger: 'change' }],
  room_number: [{ required: true, message: 'Введите номер кабинета', trigger: 'blur' }],
  specialty: [{ required: true, message: 'Введите специальность', trigger: 'blur' }],
  service: [{ required: true, message: 'Выберите сервис', trigger: 'change' }],
};
</script>

<style scoped>
/* Все стили вынесены в Tailwind-классы */
</style>