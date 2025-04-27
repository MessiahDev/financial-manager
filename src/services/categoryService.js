import api from './api';

const categoryService = {
    async getCategories() {
        try {
            const response = await api.get("/Category");
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            throw error;
        }
    },

    async getCategoryById(id) {
        try {
            const response = await api.get(`/Category/${id}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar categoria:", error);
            throw error;
        }
    },

    async getCategoryByUserId(userId) {
        try {
            const response = await api.get(`/Category/user/${userId}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return [];
            }
            console.error("Error fetching categories by user:", error);
            throw error;
        }
    },

    async createCategory(category) {
        try {
            const response = await api.post("/Category", category);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }
    },
    
    async updateCategory(id, category) {
        try {
            const response = await api.put(`/Category/${id}`, category);
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }
    },
    
    async deleteCategory(id) {
        try {
            const response = await api.delete(`/Category/${id}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            throw error;
        }
    },
};

export default categoryService;
