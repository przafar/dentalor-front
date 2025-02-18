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

export const practitionerRoleStore = defineStore('practitionerRole', {
    state: () => ({
        loading: false,
        practitionerRoles: []
    }),

    actions: {
        async GET_ALL(params) {
            return await axios
                .get('practitioner_roles', { params: params })
                .then((e) => {
                    this.practitionerRoles = e.data
                    return e
                })
                .catch((error) => {
                    return error
                })
        },


    },

    getters: {
        getPractitionerRoles: (state) => state.practitionerRoles,
    },
});
