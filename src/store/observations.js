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

export const observationStore = defineStore('observation', {
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
        async CREATE_OBSERVATION(body) {
            return await axios
                .post('observations', body)
                .then((e) => {
                    return e
                })
                .catch((error) => {
                    return error
                })
        },
        async UPDATE_OBSERVATION(id, body) {
            return await axios
                .put(`observations/${id}`, body)
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
