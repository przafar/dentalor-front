import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import axios from '../plugins/axios/index';

function handleError(error) {
    const { response } = error;
    if (response && (response.status === 400 || response.status === 404)) {
        ElNotification({
            title: 'Error',
            message: response.data && response.data.message
                ? response.data.message
                : 'This is an error message',
            type: 'error',
        });
    } else {
        console.error('Unexpected error:', error);
    }
    throw error;
}

export const paymentsStore = defineStore('payments', {
    state: () => ({
        loading: false,
        payments: [],
        paymentsPagination: []
    }),
    actions: {
        async GET_PAYMENTS(params) {
            try {
                const response = await axios.get('payments', { params });
                this.payments = response.data.data;
                this.paymentsPagination = response.data.pagination
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async UPDATE_PAYMENT(id, body) {
            try {
                const response = await axios.put(`payments/${id}`, body);
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async DELETE_PAYMENT(id) {
            try {
                const response = await axios.delete(`payments/${id}`);
                return response;
            } catch (error) {
                handleError(error);
            }
        }
    },
    getters: {
        getPayments: (state) => state.payments,
        getPaymentPagination: (state) => state.paymentsPagination,
    }
});