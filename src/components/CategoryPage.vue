<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-12">
        Gerenciador de Categorias
        </h1>
        
        <form
        @submit.prevent="saveCategory"
        class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 mb-12"
        >
        <input
            v-model="newCategory.name"
            type="text"
            placeholder="Descrição da categoria"
            required
            class="input"
            aria-label="Descrição da categoria"
        />
        <div class="col-span-full flex justify-end">
            <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary"
            >
            Salvar
            </button>
        </div>
        </form>

        <ul class="space-y-2">
        <li
            v-for="(category, index) in categories"
            :key="category.id"
            class="flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-zinc-100"
        >
            <span class="text-sm text-gray-700">
            <strong>{{ category.name }}</strong>
            </span>
            <div class="flex gap-2">
            <button @click="startEdit(index)" class="btn-green">Editar</button>
            <button @click="deleteCategory(index)" class="btn-red">Deletar</button>
            </div>
        </li>
        </ul>

        <div class="flex justify-center items-center mt-10 h-10">
            <Loader v-if="isLoading" />
        </div>

        <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 class="text-center text-xl font-semibold text-gray-800 mb-4">
            Editar Categoria
            </h2>
            <form @submit.prevent="submitEdit">
            <input v-model="editingCategory.name" placeholder="Título" required class="input mb-4" />
            <div class="flex flex-col sm:flex-row justify-end gap-2">
                <button type="submit" class="btn-primary">Salvar</button>
                <button @click.prevent="closeModal" class="btn-secondary">Cancelar</button>
            </div>
            </form>
        </div>
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
                if (!this.userId) return;
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
