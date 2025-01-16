<template>
  <el-container>
    <el-header class="p-4">
     <div class="mb-4 flex justify-between items-center">
      <div>
        <h4 class="page_title">Пациенты</h4>
      </div>
      <div>
          <el-button id="el_button" type="success" icon="el-icon-circle-plus" @click="addPatient">
          <i class="fa-solid fa-plus mr-2"></i>
          Добавить пациента
        </el-button>
      </div>
    </div>
    </el-header>
    <el-main class="mt-5">

      <el-row :gutter="20" class="filters">
        <el-col :span="6">
          <el-input v-model="filters.lastName" placeholder="Фамилия" clearable />
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.firstName" placeholder="Имя" clearable />
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.patronymic" placeholder="Отчество" clearable />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="applyFilter">Фильтр</el-button>
          <el-button @click="clearFilter" type="warning">Очистить фильтр</el-button>
        </el-col>
      </el-row>

      <el-table
        :data="filteredPatients"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" min-width="50" />
        <el-table-column prop="fullName" label="Полное имя" />
        <el-table-column prop="document" label="Документ" />
        <el-table-column prop="birthYear" label="Год рождения" min-width="120" />
        <el-table-column prop="phone" label="Номер телефона" min-width="150" />
        <el-table-column label="Действия" width="150">
          <template #default="scope">
            <div class="flex items-center"> 
            <el-button type="info" size="small" @click="openShowDrawer(row)">
              <i class="fa-solid fa-eye"></i>
            </el-button>
            <el-button type="primary" size="small" @click="openEditDrawer(row)">
              <i class="fa-solid fa-pen-to-square"></i>
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <i class="fa-solid fa-trash-can"></i>
            </el-button>
          </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredPatients.length"
        :page-size="perPage"
        @current-change="handlePageChange"
        :current-page.sync="currentPage"
        class="pagination"
        style="margin-top: 20px"
      />
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      patients: [
        { id: 299, fullName: "МИЛЕБОЕВ ЗОКИР", document: "Документа нет", birthYear: "25-02-1963", phone: "+(998)93 551-40-31" },
        { id: 298, fullName: "БОРИЕВ МИРСАИД", document: "Документа нет", birthYear: "01-06-1997", phone: "+(998)77 777-78-55" },

      ],
      filters: {
        lastName: "",
        firstName: "",
        patronymic: ""
      },
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    filteredPatients() {
      const filtered = this.patients.filter(patient => {
        return (
          (!this.filters.lastName || patient.fullName.includes(this.filters.lastName)) &&
          (!this.filters.firstName || patient.fullName.includes(this.filters.firstName)) &&
          (!this.filters.patronymic || patient.fullName.includes(this.filters.patronymic))
        );
      });

      const start = (this.currentPage - 1) * this.perPage;
      return filtered.slice(start, start + this.perPage);
    }
  },
  methods: {
    applyFilter() {
      this.currentPage = 1;
    },
    clearFilter() {
      this.filters = { lastName: "", firstName: "", patronymic: "" };
      this.currentPage = 1;
    },
    addPatient() {
      this.$message.success("Добавление нового пациента");
    },
    viewPatient(id) {
      this.$message.info(`Просмотр пациента с ID: ${id}`);
    },
    editPatient(id) {
      this.$message.warning(`Редактирование пациента с ID: ${id}`);
    },
    deletePatient(id) {
      this.patients = this.patients.filter(patient => patient.id !== id);
      this.$message.success("Пациент удалён");
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.filters {
  margin-bottom: 20px;
}
.add-button-row {
  margin: 20px 0;
}
.pagination {
  text-align: right;
}
#el_button {
  padding-left: 0;
}
</style>
