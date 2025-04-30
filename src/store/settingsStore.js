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

export const settingsStore = defineStore('settings', {
    state: () => ({
        loading: false,
        settings: null,
    }),

    actions: {
        async UPLOAD_FILE(file) {
            // Загружаем одиночный файл и получаем URL
            const form = new FormData();
            form.append('file', file);
            try {
                const resp = await axios.post('uploads/file', form);
                return resp.data.url;
            } catch (err) {
                handleError(err);
            }
        },

        async GET_SETTINGS(orgId) {
            this.loading = true;
            try {
                const response = await axios.get(`settings/${orgId}`);
                this.settings = response.data;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },


        async UPSERT_SETTINGS(payload) {
            this.loading = true;
            try {

                const response = await axios.post('settings', payload);
                this.settings = response.data.settings;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async UPDATE_SETTINGS(orgId, payload) {
            this.loading = true;
            try {

                const response = await axios.put(`settings/${orgId}`, payload);
                this.settings = response.data.settings;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async DELETE_SETTINGS(orgId) {
            this.loading = true;
            try {
                const response = await axios.delete(`settings/${orgId}`);
                this.settings = null;
                return response;
            } catch (error) {
                handleError(error);
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        getSettings: (state) => state.settings,
    },
});