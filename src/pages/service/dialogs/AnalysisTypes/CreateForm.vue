<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" label-position="top">
    <el-form-item label="Код" prop="code">
      <el-input v-model="form.code" />
    </el-form-item>
    <el-form-item label="Название" prop="display">
      <el-input v-model="form.display" />
    </el-form-item>
    <el-form-item label="Норма" prop="norm">
      <el-input v-model="form.norm" />
    </el-form-item>
    <el-form-item label="Ед. изм." prop="unit">
      <el-input v-model="form.unit" />
    </el-form-item>
    <el-form-item label="Цена" prop="price">
      <el-input-number v-model="form.price" :min="0" />
    </el-form-item>
    <el-form-item label="Комплексный анализ">
      <el-checkbox v-model="form.isComplex">Содержит поданализы</el-checkbox>
    </el-form-item>

    <template v-if="form.isComplex">
      <el-form-item label="Поданализы" prop="sub_analyses">
        <div v-for="(item, index) in form.sub_analyses" :key="index" class="mb-2 flex items-center">
          <el-form-item
              :label="'Название поданализа'"
              :prop="'sub_analyses.' + index + '.name'"
              style="flex: 1; margin-right: 8px;"
          >
            <el-input v-model="item.name" placeholder="Название поданализа" />
          </el-form-item>
          <el-form-item
              :label="'Норма'"
              :prop="'sub_analyses.' + index + '.norm'"
              style="flex: 1; margin-right: 8px;"
          >
            <el-input v-model="item.norm" placeholder="Норма" />
          </el-form-item>
          <el-form-item
              :label="'Ед. изм.'"
              :prop="'sub_analyses.' + index + '.unit'"
              style="flex: 1; margin-right: 8px;"
          >
            <el-input v-model="item.unit" placeholder="Ед. изм." />
          </el-form-item>
          <el-form-item
              :label="'Результат'"
              :prop="'sub_analyses.' + index + '.result'"
              style="flex: 1; margin-right: 8px;"
          >
            <el-input-number v-model="item.result" :min="0" placeholder="Результат" />
          </el-form-item>
          <el-button type="danger" icon="el-icon-delete" @click="removeSubAnalysis(index)"></el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="addSubAnalysis">Добавить поданализ</el-button>
      </el-form-item>
    </template>

    <el-form-item>
      <div class="flex justify-end">
        <el-button :loading="isLoading" type="primary" @click="onCreate">Создать</el-button>
        <el-button :loading="isLoading" @click="onCancel">Отмена</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { servicesStore } from '@/store/services'
import { ElMessage } from 'element-plus'

const store = servicesStore()
const formRef = ref(null)

const form = reactive({
  code: '',
  display: '',
  norm: '',
  unit: '',
  price: null,
  isComplex: false,
  sub_analyses: []
})

const rules = {
  code: [ {required: true, message: "Поле 'Код' обязательно", trigger: "blur"} ],
  display: [ {required: true, message: "Поле 'Название' обязательно", trigger: "blur"} ],
  norm: [ {required: false, message: "Введите норму", trigger: "blur"} ],
  unit: [ {required: false, message: "Введите ед. изм.", trigger: "blur"} ],
  price: [ {required: true, type: "number", message: "Введите цену", trigger: "blur"} ],
  sub_analyses: [
    {
      validator: (rule, value, callback) => {
        if (form.isComplex) {
          if (!Array.isArray(value) || value.length === 0) {
            return callback(new Error("Добавьте хотя бы один поданализ."));
          }
          for (let i = 0; i < value.length; i++) {
            if (!value[i].name) {
              return callback(new Error(`Поле 'Название поданализа' обязательно для элемента ${ i + 1 }.`));
            }
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ]
}

const isLoading = ref(false)

const addSubAnalysis = () => {
  form.sub_analyses.push({name: '', norm: '', unit: '', result: null});
}

const removeSubAnalysis = (index) => {
  form.sub_analyses.splice(index, 1);
}

const emit = defineEmits([ 'create', 'cancel' ])

const onCreate = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error("Пожалуйста, исправьте ошибки в форме.");
      return;
    }
    isLoading.value = true;
    const payload = {
      code: form.code,
      display: form.display,
      norm: form.norm,
      unit: form.unit,
      price: form.price
    };
    if (form.isComplex && form.sub_analyses.length > 0) {
      payload.sub_analyses = form.sub_analyses;
    }
    try {
      await store.CREATE_ANALYSIS_TYPE(payload);
      ElMessage.success("Анализ успешно создан.");
      resetForm();
      emit('create', payload);
    } catch (error) {
      console.error(error);
      ElMessage.error("Ошибка при создании анализа.");
    } finally {
      isLoading.value = false;
    }
  });
}

const resetForm = () => {
  form.code = '';
  form.display = '';
  form.norm = '';
  form.unit = '';
  form.price = null;
  form.isComplex = false;
  form.sub_analyses = [];
  formRef.value.clearValidate();
}

const onCancel = () => {
  emit('cancel');
}
</script>