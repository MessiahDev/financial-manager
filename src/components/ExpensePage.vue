<template>
    <div class="max-w-5xl mx-auto py-24 font-sans rounded-xl px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-8">Gerenciador de Despesas</h1>
        <form @submit.prevent="saveExpense" class="flex flex-wrap sm:flex-nowrap items-end gap-4 mb-8">
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="form.description" placeholder="Descrição da despesa" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="number" v-model.number="form.amount" placeholder="Valor da despesa" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select v-model="form.categoryId" required
                class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400">
                <option value="" disabled>Selecione uma categoria</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </select>
            <button type="submit" :disabled="isLoading"
                class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                Salvar
            </button>
        </form>

        <ul class="list-none p-0">
            <li v-for="(expense, index) in expenses" :key="expense.id"
                class="flex justify-between items-center mb-2 p-1 bg-white hover:bg-zinc-200 transition-colors border border-gray-300 rounded-lg shadow-md">
                <span class="px-3 text-gray-600 text-sm">{{ expense.description }} - {{
                    Number(expense.amount).toMoeda(true)
                    }} ({{ expense.categoryName }})</span>
                <div class="flex items-center">
                    <button @click="startEdit(index)"
                        class="px-3 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors text-sm">
                        Editar
                    </button>
                    <button @click="deleteExpense(index)"
                        class="px-3 py-2 ml-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors text-sm">
                        Deletar
                    </button>
                </div>
            </li>
        </ul>
    </div>

    <div class="flex justify-center items-center mt-10 h-10" v-if="isLoading">
        <Loader />
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-gray-100 p-8 rounded-xl shadow-xl max-w-md w-full">
            <h2 class="text-center text-gray-800 mb-4 text-xl font-semibold">Editar Receita</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="form.description" placeholder="Nome" required
                    class="w-full p-2 mb-4 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:border-blue-500" />
                <input v-model.number="form.amount" type="number" placeholder="Valor" required
                    class="w-full p-2 mb-4 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:border-blue-500" />
                <select v-model="form.categoryId" required
                    class="w-full p-2 mb-4 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:border-blue-500">
                    <option value="" disabled>Selecione uma categoria</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
                <div class="flex flex-col sm:flex-row justify-end gap-2">
                    <button type="submit"
                        class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        Salvar
                    </button>
                    <button @click.prevent="closeModal"
                        class="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import Loader from "./Loader.vue";
import authService from "../services/authService";
import expenseService from "../services/expenseService";
import categoryService from "../services/categoryService";
import { showSuccess, showError, showConfirm } from "../services/alertService";

export default {
    name: "ExpensePage",

    components: {
        Loader,
    },

    data() {
        return {
            categories: [],
            expenses: [],
            form: {
                id: null,
                description: '',
                amount: null,
                date: new Date(),
                categoryId: '',
                categoryName: '',
                userId: null,
            },
            isEditing: false,
            editingIndex: null,
            showEditModal: false,
            isLoading: false,
        };
    },

    async mounted() {
        try {
            await this.fetchCategories();
            await this.fetchExpenses();
        } catch (error) {
            console.error("Erro ao montar o componente de despesas:", error);
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
                this.categories = response || [];
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
            }
        },

        async fetchExpenses() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando busca de despesas.");
                    return;
                }
                this.isLoading = true;
                const response = await expenseService.getExpensesByUserId(userId);
                this.isLoading = false;
                this.expenses = response || [];
            } catch (error) {
                console.error("Erro ao buscar despesas:", error);
            }
        },

        async saveExpense() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando salvamento de despesa.");
                    return;
                }

                const selectedCategory = this.categories.find(c => c.id === this.form.categoryId);
                this.form.categoryName = selectedCategory ? selectedCategory.name : "";

                const newExpense = {
                    description: this.form.description,
                    amount: Number(this.form.amount),
                    date: new Date().toISOString(),
                    categoryId: this.form.categoryId,
                    categoryName: this.form.categoryName,
                    userId: userId,
                };

                this.isLoading = true;

                await expenseService.createExpense(newExpense);

                this.resetForm();
                await this.fetchExpenses();
            } catch (error) {
                await showError('Erro ao salvar despesa:', error);
            } finally {
                this.isLoading = false;
            }
        },

        startEdit(index) {
            const expense = this.expenses[index];
            if (!expense) {
                console.warn("Despesa não encontrada no índice:", index);
                return;
            }
            this.form = {
                ...expense,
                amount: Number(expense.amount).toFixed(2),
                date: new Date(expense.date),
            };
            this.isEditing = true;
            this.editingIndex = index;
            this.showEditModal = true;
        },

        async submitEdit() {
            try {
                const selectedCategory = this.categories.find(c => c.id === this.form.categoryId);
                this.form.categoryName = selectedCategory ? selectedCategory.name : "";
                this.isLoading = true;
                await expenseService.updateExpense(this.form.id, {
                    ...this.form,
                    date: new Date(this.form.date).toISOString(),
                });
                await this.fetchExpenses();
                this.closeModal();
                await showSuccess('Sucesso!', 'A despesa foi atualizada.');
            } catch (error) {
                await showError('Erro ao atualizar despesa:', error);
            }
        },

        async deleteExpense(index) {
            const id = this.expenses[index]?.id;

            if (!id) {
                console.warn("ID da despesa não encontrado. Abortando exclusão.");
                return;
            }
            const result = await showConfirm();

            if (result.isConfirmed) {
                try {
                    await expenseService.deleteExpense(id);
                    await this.fetchExpenses();
                    await showSuccess('Deletado!', 'A despesa foi removida com sucesso.');
                } catch (error) {
                    await showError('Erro ao deletar despesa:', error);
                }
            }
        },

        resetForm() {
            this.form = {
                id: null,
                description: '',
                amount: null,
                date: new Date(),
                categoryId: '',
                categoryName: '',
                userId: null,
            };
        },

        closeModal() {
            this.showEditModal = false;
            this.resetForm();
            this.isEditing = false;
            this.editingIndex = null;
            this.isLoading = false;
        },
    },
};
</script>