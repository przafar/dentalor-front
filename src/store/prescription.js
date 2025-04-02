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

export const prescriptionStore = defineStore('prescription', {
    state: () => ({
        loading: false,
        appointments: [],
        appointmentData: {},
        slots: []
    }),

    actions: {
        // async GET_ALL(params) {
        //     return await axios
        //         .get('appointments', { params: params })
        //         .then((e) => {
        //             this.appointments = e.data
        //             return e
        //         })
        //         .catch((error) => {
        //             return error
        //         })
        // },
        async CREATE_PRESCRIPTION(body) {
            return await axios
                .post('prescriptions', body)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async UPDATE_PRESCRIPTION(id, body) {
            return await axios
                .put(`prescriptions/${id}`, body)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async GET_PDF_DOCUMENT(id) {
            return await axios
                .get(`prescriptions/${id}/pdf`, { responseType: 'blob' })
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        }


    },

    getters: {
    },
});
