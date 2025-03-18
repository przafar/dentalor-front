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

export const practitionersStore = defineStore('practitioners', {
    state: () => ({
        loading: false,
        practitioners: [],
        practitionerPagination: {},
        practitioner: null,
    }),

    actions: {
        async GET_LIST_OF_PRACTITIONERS(params) {
            try {
                const response = await axios.get('practitioners', { params });
                console.log(response.data);
                this.practitioners = response.data;
                this.practitionerPagination = response.data.pagination;
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async GET_PRACTITIONER_BY_ID(id) {
            try {
                const response = await axios.get(`practitioners/${id}`);
                this.practitioner = response.data;
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async CREATE_PRACTITIONER(body) {
            try {
                const response = await axios.post('practitioners', body);
                // Если сервер возвращает созданного практикующего:
                if (response.data.practitioner) {
                    this.practitioners.push(response.data.practitioner);
                }
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async UPDATE_PRACTITIONER(id, body) {
            try {
                const response = await axios.put(`practitioners/${id}`, body);
                // Обновляем практикующего в списке, если он там есть
                const index = this.practitioners.findIndex(prac => prac.id === id);
                if (index !== -1) {
                    this.practitioners.splice(index, 1, response.data.practitioner);
                }
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async DELETE_PRACTITIONER(id) {
            try {
                const response = await axios.delete(`practitioners/${id}`);
                // Удаляем практикующего из состояния
                this.practitioners = this.practitioners.filter(prac => prac.id !== id);
                return response;
            } catch (error) {
                handleError(error);
            }
        },
    },

    getters: {
        getPractitioners: (state) => state.practitioners,
        getPractitionerPagination: (state) => state.practitionerPagination,
    },
});