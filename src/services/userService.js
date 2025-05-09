import api from './api';

const userService = {
    getUserProfile: async (token) => {
        try {
            const response = await api.get('/Auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            throw error;
        }
    },

    getUserByIdAllIncludes: async (userId) => {
        try {
            const response = await api.get(`/User/allIncludes/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar o usuário:', error);
            throw error;
        }
    },

    updateUserProfile: async (userId, userData) => {
        try {
            const response = await api.put(`/User/${userId}`, userData);
            return response;
        } catch (error) {
            console.error('Erro ao atualizar perfil do usuário:', error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/User/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw error;
        }
    },
};

export default userService;
