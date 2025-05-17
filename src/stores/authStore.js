import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userId: null,
    name: '',
    email: '',
    role: '',
  }),

  actions: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const user = await authService.getUserInfo();
        if (user && user.name) {
          this.name = user.name.split(' ')[0];
          this.userId = user.id;
          this.email = user.email;
          this.role = user.role;
          this.isAuthenticated = true;
        }
      } catch (error) {
        console.error("Erro ao buscar o usuário logado:", error);
        this.name = '';
        this.email = '';
        this.role = '';
        this.userId = null;
        this.isAuthenticated = false;
      }
    },

    logout() {
      authService.logout();
      this.isAuthenticated = false;
      this.userId = null;
      this.name = '';
      this.email = '';
      this.role = '';
      window.location.href = '/';
    },
  },
});