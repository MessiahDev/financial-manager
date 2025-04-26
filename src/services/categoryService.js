const categoryService = {
    getCategories: async () => {
        try {
            const response = await api.get('/Category');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/Category', categoryData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
    },

    updateCategory: async (categoryId, categoryData) => {
        try {
            const response = await api.put(`/Category/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/Category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            throw error;
        }
    },
};

export default categoryService;
