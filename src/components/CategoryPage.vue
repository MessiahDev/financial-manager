<template>
    <div class="category-page">
        <h1>Gerenciador de Categorias</h1>
        <form @submit.prevent="saveCategory" class="category-form">
            <div>
                <input type="text" v-model="newCategory.name" placeholder="Nome da categoria" required />
            </div>
            <button type="submit" :disabled="isLoading">Salvar</button>
        </form>

        <ul class="category-list">
            <li v-for="(category, index) in categories" :key="category.id" class="category-item">
                <span>{{ category.name }}</span>
                <div>
                    <button @click="startEdit(index)">Editar</button>
                    <button @click="deleteCategory(index)">Deletar</button>
                </div>
            </li>
        </ul>
    </div>

    <div class="loader-container">
        <Loader v-if="isLoading" />
    </div>

    <div v-if="showEditModal" class="modal-backdrop">
        <div class="modal">
            <h2>Editar Categoria</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="editingCategory.name" placeholder="Nome" required />
                <div class="modal-actions">
                    <button type="submit">Salvar</button>
                    <button @click.prevent="closeModal">Cancelar</button>
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
                confirmButtonColor: "#007bff",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sim, deletar!",
                cancelButtonText: "Cancelar"
            });

            if (result.isConfirmed) {
                try {
                    await categoryService.deleteCategory(id);
                    await this.fetchCategories();
                    await Swal.fire("Deletado!", "A categoria foi removida com sucesso.", "success");
                } catch (error) {
                    console.error("Erro ao deletar categoria:", error);
                    await Swal.fire("Erro", "Ocorreu um erro ao tentar deletar a categoria.", "error");
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

<style scoped>
.category-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 6em 0em 0em 0em;
    font-family: 'Roboto', sans-serif;
    border-radius: 8px;
}

.category-page h1 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5em;
}

.category-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 15px;
    margin-bottom: 2em;
}

.category-form div {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 150px;
}

.category-form label {
    font-weight: 500;
    margin-bottom: 8px;
    color: #555;
}

.category-form input,
.category-form button {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.category-form input:focus {
    border-color: #007bff;
    outline: none;
}

.category-form button {
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    height: 48px;
    padding: 0 20px;
}

.category-form button:hover {
    background-color: #0056b3;
}

.category-list {
    list-style: none;
    padding: 0;
}

.category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    color: #555;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-item span {
    font-size: 16px;
}

.category-item button {
    padding: 8px 12px;
    font-size: 14px;
    color: #fff;
    background-color: #28a745;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-left: 5px;
}

.category-item button:hover {
    background-color: #218838;
}

.category-item button:nth-child(2) {
    background-color: #dc3545;
}

.category-item button:nth-child(2):hover {
    background-color: #c82333;
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    height: 40px;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background-color: #f5f5f5;
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
    font-family: 'Roboto', sans-serif;
}

.modal h2 {
    margin-top: 0;
    margin-bottom: 1em;
    color: #333;
    font-size: 1.5em;
    text-align: center;
}

.modal input,
.modal select {
    width: 100%;
    padding: 10px;
    margin-bottom: 1em;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #555;
}

.modal input:focus,
.modal select:focus {
    border-color: #007bff;
    outline: none;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-actions button {
    padding: 10px 16px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-actions button[type="submit"] {
    background-color: #007bff;
    color: #fff;
}

.modal-actions button[type="submit"]:hover {
    background-color: #0056b3;
}

.modal-actions button:not([type="submit"]) {
    background-color: #6c757d;
    color: #fff;
}

.modal-actions button:not([type="submit"]):hover {
    background-color: #5a6268;
}

@media (max-width: 800px) {
    .category-page {
        padding: 7em 1em;
    }

    .category-form {
        flex-direction: column;
        gap: 10px;
    }

    .category-form button,
    .category-item input,
    .category-item button,
    .category-form div {
        width: 100%;
        margin: 3px 0;
    }

    .modal {
        width: 90%;
        padding: 1.5em;
    }
}
</style>
