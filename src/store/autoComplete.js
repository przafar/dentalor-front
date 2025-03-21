import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import axios from '../plugins/axios/index';

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

export const autoCompleteStore = defineStore('catalogs', {
    state: () => ({
        loading: false,
        firstNames: [],
        lastNames: [],
        middleNames: [],
    }),

    actions: {
        async GET_FIRST_NAMES(params) {
            this.loading = true;
            try {
                const response = await axios.get('/autocomplete/patientFirstNames', { params });
                this.firstNames = response.data;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async GET_LAST_NAMES(params) {
            this.loading = true;
            try {
                const response = await axios.get('/autocomplete/patientLastNames', { params });
                this.lastNames = response.data;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async GET_MIDDLE_NAMES(params) {
            this.loading = true;
            try {
                const response = await axios.get('/autocomplete/patientMiddleNames', { params });
                this.middleNames = response.data;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        getFirstNames: (state) => state.firstNames,
        getLastNames: (state) => state.lastNames,
        getMiddleNames: (state) => state.middleNames,
    },
});