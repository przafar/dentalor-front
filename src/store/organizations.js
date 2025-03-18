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

export const organizationsStore = defineStore('organizations', {
    state: () => ({
        loading: false,
        organizations: [],
        organizationPagination: {},
        organization: null,
    }),

    actions: {
        async GET_LIST_OF_ORGANIZATIONS(params) {
            try {
                const response = await axios.get('organizations', { params });
                console.log(response.data);
                this.organizations = response.data.data;
                this.organizationPagination = response.data.pagination;
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async GET_ORGANIZATION_BY_ID(id) {
            try {
                const response = await axios.get(`organizations/${id}`);
                this.organization = response.data;
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async CREATE_ORGANIZATION(body) {
            try {
                const response = await axios.post('organizations', body);
                // Если сервер возвращает созданную организацию:
                if (response.data.organization) {
                    this.organizations.push(response.data.organization);
                }
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async UPDATE_ORGANIZATION(id, body) {
            try {
                const response = await axios.put(`organizations/${id}`, body);
                // Обновляем организацию в списке, если она там есть
                const index = this.organizations.findIndex(org => org.id === id);
                if (index !== -1) {
                    this.organizations.splice(index, 1, response.data.organization);
                }
                return response;
            } catch (error) {
                handleError(error);
            }
        },

        async DELETE_ORGANIZATION(id) {
            try {
                const response = await axios.delete(`organizations/${id}`);
                // Удаляем организацию из состояния
                this.organizations = this.organizations.filter(org => org.id !== id);
                return response;
            } catch (error) {
                handleError(error);
            }
        },
    },
    getters: {
        getOrganizations: (state) => state.organizations,
        getOrganizationPagination: (state) => state.organizationPagination,
    }
});