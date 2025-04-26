const revenueService = {
    getRevenues: async () => {
        try {
            const response = await api.get('/Revenue');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            throw error;
        }
    },

    createRevenue: async (revenueData) => {
        try {
            const response = await api.post('/Revenue', revenueData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar receita:', error);
            throw error;
        }
    },

    updateRevenue: async (revenueId, revenueData) => {
        try {
            const response = await api.put(`/Revenue/${revenueId}`, revenueData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar receita:', error);
            throw error;
        }
    },

    deleteRevenue: async (revenueId) => {
        try {
            const response = await api.delete(`/Revenue/${revenueId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar receita:', error);
            throw error;
        }
    },
};

export default revenueService;
