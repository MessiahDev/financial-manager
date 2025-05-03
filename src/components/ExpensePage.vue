<template>
    <div class="expense-page">
        <h1>Gerenciador de Despesas</h1>
        <form @submit.prevent="saveExpense" class="expense-form">
            <div>
                <input type="text" v-model="form.description" placeholder="Descrição da despesa" required />
            </div>
            <div>
                <input v-money v-model.number="form.amount" placeholder="Valor da despesa" required />
            </div>
            <select v-model="form.categoryId" required>
                <option value="" disabled>Selecione uma categoria</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </select>
            <button type="submit" :disabled="isLoading">Salvar</button>
        </form>

        <ul class="expense-list">
            <li v-for="(expense, index) in expenses" :key="expense.id" class="expense-item">
                <span>{{ expense.description }} - R$ {{ expense.amount.toFixed(2) }} ({{ expense.categoryName }})</span>
                <div>
                    <button @click="startEdit(index)">Editar</button>
                    <button @click="deleteExpense(index)">Deletar</button>
                </div>
            </li>
        </ul>
    </div>

    <div class="loader-container">
        <Loader v-if="isLoading" />
    </div>

    <div v-if="showEditModal" class="modal-backdrop">
        <div class="modal">
            <h2>Editar Receita</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="form.description" placeholder="Nome" required />
                <input v-model.number="form.amount" type="number" placeholder="Valor" required />
                <select v-model="form.categoryId" required>
                    <option value="" disabled>Selecione uma categoria</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
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
import expenseService from "../services/expenseService";
import categoryService from "../services/categoryService";
import Loader from "./Loader.vue";

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
                description: "",
                amount: null,
                date: new Date(),
                categoryId: "",
                categoryName: "",
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
                console.error("Erro ao salvar despesa:", error);
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
            } catch (error) {
                console.error("Erro ao atualizar despesa:", error);
            }
        },

        async deleteExpense(index) {
            try {
                const id = this.expenses[index]?.id;
                if (!id) {
                    console.warn("ID da despesa não encontrado. Abortando exclusão.");
                    return;
                }
                await expenseService.deleteExpense(id);
                await this.fetchExpenses();
            } catch (error) {
                console.error("Erro ao deletar despesa:", error);
            }
        },

        resetForm() {
            this.form = {
                id: null,
                description: "",
                amount: null,
                date: new Date(),
                categoryId: "",
                categoryName: "",
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

<style scoped>
.expense-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 6em 0em 0em 0em;
    font-family: 'Roboto', sans-serif;
    border-radius: 8px;
}

.expense-page h1 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5em;
}

.expense-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 15px;
    margin-bottom: 2em;
}

.expense-form div {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 150px;
}

.expense-form label {
    font-weight: 500;
    margin-bottom: 8px;
    color: #555;
}

.expense-form input,
.expense-form button,
.expense-form select {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #555;
}

.expense-form input:focus {
    border-color: #007bff;
    outline: none;
}

.expense-form button {
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    height: 48px;
    padding: 0 20px;
}

.expense-form button:hover {
    background-color: #0056b3;
}

.expense-list {
    list-style: none;
    padding: 0;
}

.expense-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.expense-item span {
    font-size: 16px;
    color: #555;
}

.expense-item button {
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

.expense-item button:hover {
    background-color: #218838;
}

.expense-item button:nth-child(2) {
    background-color: #dc3545;
}

.expense-item button:nth-child(2):hover {
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
    .expense-page {
        padding: 7em 1em;
    }

    .expense-form {
        flex-direction: column;
        gap: 10px;
    }

    .expense-form select,
    .expense-form button,
    .expense-form div,
    .expense-item input,
    .expense-item button {
        width: 100%;
        margin: 3px 0;
    }

    .modal {
        width: 90%;
        padding: 1.5em;
    }
}
</style>
