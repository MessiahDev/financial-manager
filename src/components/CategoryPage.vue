<template>
  <div class="font-sans bg-stone-250 min-h-screen mb-12 flex flex-col">
    <div class="w-full mx-auto pt-24 pb-8 px-4">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-center text-3xl font-bold mb-12" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
          Gerenciador de Categorias
        </h1>

        <form @submit.prevent="saveCategory" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <input v-model="newCategory.name" type="text" placeholder="Descrição da categoria" required class="input"
            aria-label="Descrição da categoria" />
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
          <li v-for="(category, index) in categories" :key="category.id"
            class="p-4 border border-gray-300 rounded-xl shadow transition hover:shadow-md"
            :class="isDark ? 'bg-gray-800' : 'bg-white'">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <p class="text-lg font-semibold mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ category.name
                }}</p>
              <div class="flex gap-2">
                <button @click="startEdit(index)" class="btn-green">
                  <i class="fa-regular fa-pen-to-square mr-1"></i>
                  Editar
                </button>
                <button @click="deleteCategory(index)" class="btn-red">
                  <i class="fa-regular fa-trash-can mr-1"></i>
                  Deletar
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="isLoading" class="flex justify-center items-center mt-8 h-10">
          <Loader />
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="p-8 rounded-lg shadow-lg w-full max-w-md mx-4" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
        <h2 class="text-center text-xl font-semibold mb-4" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
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
import { useThemeStore } from '../stores/themeStore';
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
      },
      categories: [],
      editingCategory: null,
      isEditing: false,
      showEditModal: false,
      isLoading: false,
      themeStore: useThemeStore(),
    };
  },

  computed: {
    isDark() {
      return this.themeStore.theme === 'dark';
    },
  },

  async mounted() {
    try {
      await this.fetchUserProfile();
      if (this.userId) {
        await this.fetchCategories();
      }
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },

  methods: {
    async fetchUserProfile() {
      try {
        const user = await authService.getProfile();
        if (user && user.id) {
          this.userId = user.id;
        } else {
          console.warn("Usuário não autenticado.");
          this.userId = null;
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        this.userId = null;
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
        const categoryData = { name: this.newCategory.name };
        await categoryService.createCategory(categoryData);
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