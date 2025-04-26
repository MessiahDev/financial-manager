import api from './api';

const debtService = {
    getDebts: async () => {
        try {
            const response = await api.get('/Debt');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dívidas:', error);
            throw error;
        }
    },

    createDebt: async (debtData) => {
        try {
            const response = await api.post('/Debt', debtData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar dívida:', error);
            throw error;
        }
    },

    updateDebt: async (debtId, debtData) => {
        try {
            const response = await api.put(`/Debt/${debtId}`, debtData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar dívida:', error);
            throw error;
        }
    },

    deleteDebt: async (debtId) => {
        try {
            const response = await api.delete(`/Debt/${debtId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar dívida:', error);
            throw error;
        }
    },
};

export default debtService;
