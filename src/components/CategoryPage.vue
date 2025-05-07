<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-8">Gerenciador de Categorias</h1>
        <form @submit.prevent="saveCategory"
            class="flex flex-wrap sm:flex-nowrap items-center justify-center items-end gap-4 mb-8">
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="newCategory.name" placeholder="Nome da receita" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" :disabled="isLoading"
                class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                Salvar
            </button>
        </form>

        <ul class="list-none p-0">
            <li v-for="(category, index) in categories" :key="category.id"
                class="flex justify-between items-center mb-2 p-1 bg-white hover:bg-zinc-200 transition-colors border border-gray-300 rounded-lg shadow-md">
                <span class="px-3 text-gray-600 text-sm">{{ category.name }}</span>
                <div class="flex items-center">
                    <button @click="startEdit(index)"
                        class="px-3 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors text-sm">
                        Editar
                    </button>
                    <button @click="deleteCategory(index)"
                        class="px-3 py-2 ml-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors text-sm">
                        Deletar
                    </button>
                </div>
            </li>
        </ul>
    </div>

    <div class="flex justify-center items-center mt-10 h-10">
        <Loader v-if="isLoading" />
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 class="text-center text-xl font-semibold text-gray-800 mb-4">Editar Dívida</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="editingCategory.name" placeholder="Nome" required
                    class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                <div class="flex flex-col sm:flex-row justify-end gap-2">
                    <button type="submit"
                        class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Salvar</button>
                    <button @click.prevent="closeModal"
                        class="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-md">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import Loader from "../components/Loader.vue";
import authService from "../services/authService";
import categoryService from "../services/categoryService";
import { showSuccess, showError, showConfirm } from "../services/alertService";

export default {
    name: "CategoryPage",

    components: {
        Loader,
    },

    data() {
        return {
            userId: null,
            newCategory: {
                name: "",
                userId: null,
            },
            categories: [],
            editingCategory: null,
            isEditing: false,
            showEditModal: false,
            isLoading: false,
        };
    },

    async mounted() {
        try {
            this.userId = await this.fetchUserId();
            if (this.userId) {
                this.newCategory.userId = this.userId;
                await this.fetchCategories();
            }
        } catch (error) {
            console.error("Erro ao montar o componente:", error);
        }
    },

    methods: {
        async fetchUserId() {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                console.warn("Token não encontrado.");
                return null;
            }
            try {
                const user = await authService.getProfile();
                return user.id;
            } catch (error) {
                console.error("Erro ao obter perfil do usuário:", error);
                return null;
            }
        },

        async fetchCategories() {
            try {
                this.isLoading = true;
                const response = await categoryService.getCategoryByUserId(this.userId);
                this.categories = response || [];
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
            } finally {
                this.isLoading = false;
            }
        },

        async saveCategory() {
            try {
                this.isLoading = true;
                await categoryService.createCategory(this.newCategory);
                await this.fetchCategories();
                this.resetForm();
            } catch (error) {
                await showError('Erro ao salvar categoria:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async updateCategory() {
            try {
                const { id, ...data } = this.editingCategory;
                if (!id) {
                    console.warn("ID da categoria não encontrado. Abortando atualização.");
                    return;
                }

                await categoryService.updateCategory(id, data);
                await this.fetchCategories();
                this.closeModal();

                await showSuccess('Sucesso!', 'A categoria foi atualizada.');
            } catch (error) {
                console.error('Erro ao atualizar categoria:', error);
                await showError('Erro ao atualizar', error);
            }
        },

        async deleteCategory(index) {
            const id = this.categories[index]?.id;
            if (!id) {
                console.warn("ID da categoria não encontrado. Abortando exclusão.");
                return;
            }

            const result = await showConfirm();

            if (result.isConfirmed) {
                try {
                    await categoryService.deleteCategory(id);
                    await this.fetchCategories();
                    await showSuccess('Deletado!', 'A categoria foi removida com sucesso.');
                } catch (error) {
                    await showError('Erro ao deletar categoria!', error);
                }
            }
        },

        startEdit(index) {
            const category = this.categories[index];
            if (!category) {
                console.warn("Categoria não encontrada no índice:", index);
                return;
            }
            this.editingCategory = { ...category };
            this.isEditing = true;
            this.showEditModal = true;
        },

        submitEdit() {
            this.updateCategory();
        },

        resetForm() {
            this.newCategory = {
                name: "",
                userId: this.userId,
            };
        },

        closeModal() {
            this.showEditModal = false;
            this.isEditing = false;
            this.editingCategory = null;
        },
    },
};
</script>

<style scoped></style>
