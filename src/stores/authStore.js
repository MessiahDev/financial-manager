import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    firstName: '',
  }),
  actions: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = true;

        const user = await authService.getProfile(token);
        if (user && user.name) {
          this.firstName = user.name.split(' ')[0];
        }
      } catch (error) {
        console.error("Erro ao buscar o usuário logado:", error);
        this.firstName = '';
        this.isAuthenticated = false;
      }
    },

    logout() {
      authService.logout();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      this.isAuthenticated = false;
      this.firstName = '';
      window.location.href = '/';
    },
  },
});
