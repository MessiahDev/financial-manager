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
import authService from "../services/authService";
import categoryService from "../services/categoryService";
import Loader from "../components/Loader.vue";
import Swal from 'sweetalert2';

export default {
    name: "CategoryPage",

    components: {
        Loader,
    },

    data() {
        return {
            newCategory: {
                name: "",
                userId: null,
            },
            categories: [],
            editingCategory: null,
            editingIndex: null,
            isEditing: false,
            showEditModal: false,
            isLoading: false,
        };
    },

    async mounted() {
        try {
            await this.fetchCategories();
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
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando busca de categorias.");
                    return;
                }
                this.isLoading = true;
                const response = await categoryService.getCategoryByUserId(userId);
                this.isLoading = false;
                this.categories = response || [];
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
            }
        },

        async saveCategory() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando salvamento de categoria.");
                    return;
                }

                this.isLoading = true;
                const categoryData = { ...this.newCategory, userId: userId };
                await categoryService.createCategory(categoryData);
                await this.fetchCategories();
                this.resetForm();
            } catch (error) {
                console.error("Erro ao salvar categoria:", error);
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

                Swal.fire({
                    title: "Sucesso!",
                    text: "A categoria foi atualizada.",
                    icon: "success",
                    draggable: false
                });
            } catch (error) {
                console.error("Erro ao atualizar categoria:", error);
                await Swal.fire("Erro", "Ocorreu um erro ao tentar atualizar a categoria.", "error");
            }
        },

        async deleteCategory(index) {
            const id = this.categories[index]?.id;

            if (!id) {
                console.warn("ID da categoria não encontrado. Abortando exclusão.");
                return;
            }

            const result = await Swal.fire({
                title: "Tem certeza?",
                text: "Essa categoria será deletada e não poderá ser recuperada!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim, deletar!",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded',
                    cancelButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded ml-2'
                },
                buttonsStyling: false,
            });

            if (result.isConfirmed) {
                try {
                    await categoryService.deleteCategory(id);
                    await this.fetchCategories();
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deletado!',
                        text: 'A categoria foi removida com sucesso.',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                        },
                        buttonsStyling: false
                    });
                } catch (error) {
                    console.error('Erro ao deletar categoria:', error);

                    let message = 'Ocorreu um erro ao tentar deletar a categoria. Tente novamente mais tarde.';

                    if (error.response && error.response.data) {
                        message =
                            typeof error.response.data === 'string'
                                ? error.response.data
                                : error.response.data.message || message;
                    }

                    await Swal.fire({
                        icon: 'error',
                        title: 'Erro ao deletar categoria!',
                        text: message,
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded'
                        },
                        buttonsStyling: false
                    });
                }
            }
        },

        startEdit(index) {
            const category = this.categories[index];
            if (!category) {
                console.warn("Categoria não encontrada no índice:", index);
                return;
            }
            this.editingIndex = index;
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
            };
        },

        closeModal() {
            this.showEditModal = false;
            this.isEditing = false;
            this.editingIndex = null;
            this.editingCategory = null;
        },
    },
};
</script>

<style scoped></style>
