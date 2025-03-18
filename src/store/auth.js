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
        const response = await axios.post('/auth/login', {
          username: formData.email,
          password: formData.password,
        });

        const { accessToken } = response.data;
        const decodedToken = jwtDecode(accessToken);

        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(decodedToken));

        this.user.token = accessToken;
        this.user.roles = decodedToken.roles; // Используем поле roles

        return response.data;
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Login failed.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

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