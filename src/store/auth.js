import { defineStore } from 'pinia';
import axios from '../plugins/axios/index';
import { jwtDecode } from 'jwt-decode';

export const authStore = defineStore('auth', {
  state: () => ({
    user: {
      token: localStorage.getItem('token') || null,
      role: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null,
      ability: null,
    },
  }),
  getters: {
    isAuthenticated: (state) => !!state.user.token,
    getRole: (state) => state.user.role,
    getAbility: (state) => state.user.ability,
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
        this.user.role = decodedToken.role;


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
      this.user.role = null;
      this.user.ability = null;

      window.location.href = '/auth/login';
    },
  },
});