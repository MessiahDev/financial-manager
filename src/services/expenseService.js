import api from './api';

const expenseService = {
    getExpenses: async () => {
        try {
            const response = await api.get('/Expense');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar despesas:', error);
            throw error;
        }
    },

    createExpense: async (expenseData) => {
        try {
            const response = await api.post('/Expense', expenseData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar despesa:', error);
            throw error;
        }
    },

    updateExpense: async (expenseId, expenseData) => {
        try {
            const response = await api.put(`/Expense/${expenseId}`, expenseData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar despesa:', error);
            throw error;
        }
    },

    deleteExpense: async (expenseId) => {
        try {
            const response = await api.delete(`/Expense/${expenseId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar despesa:', error);
            throw error;
        }
    },
};

export default expenseService;
