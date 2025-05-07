import api from './api';
import router from '../router';
import { useAuthStore } from '../stores/authStore';

const authService = {
    login: async (credentials, router, stayConnected = false) => {
        try {
            const response = await api.post('/Auth/login', credentials);
            const token = response.data.token;

            if (token) {
                if (stayConnected) {
                    localStorage.setItem('token', token);
                } else {
                    sessionStorage.setItem('token', token);
                }

                const authStore = useAuthStore();
                await authStore.fetchUserProfile();

                if (router) {
                    router.push('/home');
                }
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    
        const authStore = useAuthStore();
        authStore.isAuthenticated = false;
        authStore.firstName = '';

        router.push('/');
    },

    register: async (userData) => {
        try {
            const response = await api.post('/Auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            throw error;
        }
    },

    confirmEmail: async (token) => {
        try {
            const response = await api.get(`/Auth/confirm-email?token=${token}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao confirmar email:', error);
            throw error;
        }
    },

    resendConfirmationEmail: async (email) => {
        try {
            return await api.post('/Auth/resend-confirmation-email', email, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            console.error('Erro ao reenviar email de confirmação:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/Auth/profile');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/Auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar email de recuperação de senha:', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post('/Auth/reset-password', {
                Token: token,
                NewPassword: newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            throw error;
        }
    },
};

export default authService;
