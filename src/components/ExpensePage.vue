<template>
  <div class="font-sans bg-stone-250 min-h-screen mb-12 flex flex-col">
    <div class="w-full mx-auto pt-24 pb-8 px-4">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-center text-3xl font-bold mb-12"
            :class="isDark ? 'text-gray-100' : 'text-gray-800'">
          Gerenciador de Despesas
        </h1>

        <form @submit.prevent="saveExpense" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            v-model="form.description"
            type="text"
            placeholder="Descrição da despesa"
            required
            class="input"
            aria-label="Descrição da despesa"
          />
          <input
            v-model="formattedAmount"
            type="text"
            placeholder="Valor"
            required
            class="input text-right"
            aria-label="Valor"
          />
          <select
            v-model="form.categoryId"
            required
            class="input"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <div class="col-span-full flex justify-end">
            <button type="submit" :disabled="isLoading" class="btn-primary">
              <i class="fa-regular fa-floppy-disk mr-1"></i>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="w-full border-t" :class="isDark ? 'border-gray-700' : 'border-gray-300'"></div>

    <div class="w-full flex-1" :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
      <div class="max-w-5xl mx-auto px-4 py-8">
        <ul class="space-y-4">
          <li
            v-for="(expense, index) in expenses"
            :key="expense.id"
            class="p-4 border border-gray-300 rounded-xl shadow transition hover:shadow-md"
            :class="isDark ? 'bg-gray-800' : 'bg-white'"
          >
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <p class="text-lg font-semibold mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ expense.description }}</p>
                <p class="text-sm" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
                  Valor: {{ Number(expense.amount).toMoeda(true) }} |
                  Categoria: {{ expense.categoryName }}
                </p>
              </div>
              <div class="flex gap-2 mt-1 sm:mt-0">
                <button @click="startEdit(index)" class="btn-green">
                  <i class="fa-regular fa-pen-to-square mr-1"></i>
                  Editar
                </button>
                <button @click="deleteExpense(index)" class="btn-red">
                  <i class="fa-regular fa-trash-can mr-1"></i>
                  Deletar
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="flex justify-center items-center mt-8 h-10">
          <Loader v-if="isLoading" />
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="p-8 rounded-lg shadow-lg w-full max-w-md mx-4" 
            :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
        <h2 class="text-center text-xl font-semibold mb-4"
            :class="isDark ? 'text-gray-100' : 'text-gray-600'">
          Editar Despesa
        </h2>
        <form @submit.prevent="submitEdit">
          <input
            v-model="form.description"
            placeholder="Descrição"
            required
            class="input mb-4"
          />
          <input
            v-model="formattedEditAmount"
            type="text"
            placeholder="Valor"
            class="input text-right mb-4"
          />
          <select
            v-model="form.categoryId"
            required
            class="w-full p-2 mb-4 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <div class="flex flex-col sm:flex-row justify-end gap-2">
            <button type="submit" class="btn-primary">Salvar</button>
            <button @click.prevent="closeModal" class="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from "./Loader.vue";
import authService from "../services/authService";
import { useThemeStore } from '../stores/themeStore';
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
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        categoryName: '',
      },
      userId: null,
      isEditing: false,
      editingIndex: null,
      showEditModal: false,
      isLoading: false,
      formattedAmount: '',
      formattedEditAmount: '',
      themeStore: useThemeStore(),
    };
  },

  computed: {
    isDark() {
      return this.themeStore.theme === 'dark';
    },
  },

  watch: {
    formattedAmount(newVal) {
      const cleaned = newVal.replace(/\D/g, '');
      const number = parseFloat(cleaned) / 100;

      this.form.amount = isNaN(number) ? 0 : number;
      this.formattedAmount = this.form.amount.toMoeda(true);
    },
    formattedEditAmount(newVal) {
      const cleaned = newVal.replace(/\D/g, '');
      const number = parseFloat(cleaned) / 100;

      this.form.amount = isNaN(number) ? 0 : number;
      this.formattedEditAmount = this.form.amount.toMoeda(true);
    }
  },

  async mounted() {
    try {
      await this.fetchCategories();
      await this.fetchExpenses();
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },

  methods: {
    async fetchCategories() {
      try {
        this.isLoading = true;
        const response = await categoryService.getCategories();
        this.categories = response || [];
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    },

    async fetchExpenses() {
      try {
        this.isLoading = true;
        const response = await expenseService.getExpenses();
        this.isLoading = false;
        this.expenses = response || [];
      } catch (error) {
        console.error("Erro ao buscar despesas:", error);
      }
    },

    async saveExpense() {
      try {
        const selectedCategory = this.categories.find(c => c.id === this.form.categoryId);
        this.form.categoryName = selectedCategory ? selectedCategory.name : '';

        const newExpense = {
          description: this.form.description,
          amount: Number(this.form.amount),
          date: new Date().toISOString(),
          categoryId: this.form.categoryId,
          categoryName: this.form.categoryName,
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

    async submitEdit() {
      try {
        const selectedCategory = this.categories.find(c => c.id === this.form.categoryId);
        this.form.categoryName = selectedCategory ? selectedCategory.name : "";
        this.isLoading = true;
        await expenseService.updateExpense(this.form.id, {
          ...this.form,
          date: new Date(this.form.date).toISOString(),
        });
        this.resetForm();
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

    startEdit(index) {
      const expense = this.expenses[index];
      const newDate = new Date(expense.date).toISOString().split('T')[0];

      if (!expense) {
        console.warn("Despesa não encontrada no índice:", index);
        return;
      }
      this.form = {
        ...expense,
        amount: Number(expense.amount).toFixed(2),
        date: newDate,
      };
      this.formattedEditAmount = Number(expense.amount).toMoeda(true);
      this.isEditing = true;
      this.editingIndex = index;
      this.showEditModal = true;
    },

    resetForm() {
      this.form = {
        id: null,
        description: '',
        amount: null,
        date: new Date(),
        categoryId: '',
        categoryName: '',
      };
      this.formattedAmount = '',
        this.formattedEditAmount = ''
    },

    closeModal() {
      this.showEditModal = false;
      this.isEditing = false;
      this.editingIndex = null;
      this.isLoading = false;
    },
  },
};
</script>

<style scoped></style>