import { defineStore } from 'pinia';
import { filter } from './properties/manufacturerFilter.js';
import { badInstance } from '../plugins/axios/badInstance.js';
import { ElNotification } from 'element-plus';

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

export const badControllerStore = defineStore('badController', {
  state: () => ({
    loading: false,
    encounterClasses: [],
    encounterTypes: [],
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
          console.log(e, 'Success')
          return e
        })
        .catch((error) => {
          return error
        })
    },
    async CREATE_ENCOUNTER_TYPES(body) {
      return await axios
        .post('valuesets/encounter_types', body)
        .then((e) => {

          return e
        })
        .catch((error) => {
          return error
        })
    },
  },

  getters: {
    getBadControllers: (state) => state.badControllers,
  },
});
