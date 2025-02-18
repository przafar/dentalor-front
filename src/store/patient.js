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

export const patientStore = defineStore('patient', {
    state: () => ({
        loading: false,
        patients: [],
        patientPagiantion: {}
    }),

    actions: {
        async GET_ALL(params) {
            return await axios
                .get('patients', { params: params })
                .then((e) => {
                    this.patients = e.data.data
                    this.patientPagination = e.data.pagination
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async GET_BY_ID(id) {
            return await axios
                .get(`patients/${id}`)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async CREATE_PATIENT(body) {
            return await axios
                .post('patients', body)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async UPDATE_PATIENT(id, body) {
            return await axios
                .put(`patients/${id}`, body)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async DELETE_PATIENT(id) {
            return await axios
                .delete(`patients/${id}`)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },

    },

    getters: {
        getPatients: (state) => state.patients,
        getPatientPagination: (state) => state.patientPagination
    },
});
