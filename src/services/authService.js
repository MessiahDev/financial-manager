import api from './api';

const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/Auth/login', credentials);
            const token = response.data.token;
            if (token) {
                localStorage.setItem('token', token);
            }
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/User/register', userData); // <-- Corrigido aqui
            return response.data;
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            throw error;
        }
    },

    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/User/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            throw error;
        }
    },
};

export default authService;