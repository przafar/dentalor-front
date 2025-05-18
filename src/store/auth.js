import { defineStore } from 'pinia';
import axios from '../plugins/axios/index';
import jwtDecode from 'jwt-decode';

export const authStore = defineStore('auth', {
  state: () => ({
    user: {
      token: localStorage.getItem('token') || null,
      roles: localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')).roles
          : null,
      organizations: localStorage.getItem('organizations') ? JSON.parse(localStorage.getItem('organizations')) : null,
      ability: null,
      isCollapse: false,
    },
  }),
  getters: {
    isAuthenticated: (state) => !!state.user.token,
    getRoles: (state) => state.user.roles,
    getAbility: (state) => state.user.ability,
    getIsCollapse: (state) => state.isCollapse,
  },
  actions: {
    async login(formData) {
      try {
        const { data } = await axios.post('/auth/login', {
          username: formData.email,
          password: formData.password,
        });
        const { accessToken } = data;
        const decoded = jwtDecode(accessToken);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(decoded));
        localStorage.setItem('organizations', JSON.stringify(decoded.organizations || []));

        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        if (decoded.organizations?.length === 1) {
          axios.defaults.headers.common['organization-id'] = decoded.organizations[0].id;
          localStorage.setItem('current_organization', decoded.organizations[0].id);
        }

        this.user.token         = accessToken;
        this.user.roles         = decoded.roles;
        this.user.organizations = decoded.organizations || [];

        return { accessToken, user: decoded };
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error(error.response?.data?.message || 'Login failed.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
        localStorage.removeItem('organizations');

      this.user.token = null;
      this.user.roles = null;
      this.user.ability = null;

      window.location.href = '/auth/login';
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
  },
});