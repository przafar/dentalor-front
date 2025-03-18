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

export const catalogsStore = defineStore('catalogs', {
    state: () => ({
        loading: false,
        roles: []
    }),

    actions: {
        async GET_ROLES(params) {
            return await axios
                .get('/catalogs/practitioner_roles', { params: params })
                .then((e) => {
                    this.roles = e.data
                    return e
                })
                .catch((error) => {
                    return error
                })
        },


    },

    getters: {
        getRoles: (state) => state.roles,
    },
});
