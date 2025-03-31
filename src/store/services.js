import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import axios from '../plugins/axios/index';
import { get } from '@vueuse/core/index.cjs';

function handleError(error) {
  const { response } = error;

  if (response && (response.status === 400 || response.status === 404)) {
    ElNotification({
      title: 'Error',
      message:
        response.data && response.data.message
          ? response.data.message
          : 'This is an error message',
      type: 'error',
    });
  } else {
    console.error('Unexpected error:', error);
  }
  throw error;
}

export const servicesStore = defineStore('services', {
  state: () => ({
    loading: false,
    encounterClasses: [],
    encounterTypes: [],
    analysisTypes: [],
  }),

  actions: {
    async GET_LIST_OF_ECOUNTER_CLASSES(params) {
      return await axios
        .get('valuesets/encounter_classes', { params: params })
        .then((e) => {
          this.encounterClasses = e.data.data
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async GET_LIST_OF_ECOUNTER_TYPES(params) {
      return await axios
        .get(`valuesets/encounter_types/${params}`)
        .then((response) => {
          this.encounterTypes = response.data.data
          return response
        })
        .catch((error) => {
          console.error('Error fetching encounter types:', error)
          throw error 
        })
    },
    async CREATE_ENCOUNTER_CLASSES(body) {
      return await axios
        .post('valuesets/encounter_classes', body)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async UPDATE_ENCOUNTER_CLASSES(id, body) {
      return await axios
        .put(`valuesets/encounter_classes/${id}`, body)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async UPDATE_ENCOUNTER_TYPES(id, body) {
        return await axios
            .put(`valuesets/encounter_types/${id}`, body)
            .then((e) => {
            return e
            })
            .catch((error) => {
              return error
            })
    },
    async CREATE_ENCOUNTER_TYPES(body) {
      return await axios
        .post(`valuesets/encounter_types`, body)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async DELETE_ENCOUNTER(id) {
      return await axios
        .delete(`valuesets/encounter_classes/${id}`)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async DELETE_ENCOUNTER_TYPES(id) {
        return await axios
            .delete(`valuesets/encounter_types/${id}`)
            .then((e) => {
            return e
            })
            .catch((error) => {
            return error
            })
    },
    async GET_ANALYSIS_TYPES(params) {
      return await axios
      .get('valuesets/analysis_types', { params: params })
        .then((e) => {
            this.analysisTypes = e.data.data
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async CREATE_ANALYSIS_TYPE(body) {
      return await axios
        .post('valuesets/analysis_types', body)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async UPDATE_ANALYSIS_TYPE(id, body) {
      return await axios
        .put(`valuesets/analysis_types/${id}`, body)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async DELETE_ANALYSIS_TYPES(id) {
      return await axios
        .delete(`valuesets/analysis_types/${id}`)
        .then((e) => {
          return e
        })
        .catch((error) => {
          return error
        })
    }
  },

  getters: {
    getEncounterClasses: (state) => state.encounterClasses,
    getEncounterTypes: (state) => state.encounterTypes,
    getAnalysisTypes: (state) => state.analysisTypes,
  },
});
