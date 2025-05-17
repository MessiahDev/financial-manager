<template>
  <div class="font-sans bg-stone-250 min-h-screen mb-12 flex flex-col">
    <div class="w-full mx-auto pt-24 pb-8 px-4">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-center text-3xl font-bold mb-12"
            :class="isDark ? 'text-gray-100' : 'text-gray-800'">
          Gerenciador de Receitas
        </h1>

        <form @submit.prevent="saveRevenue" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <input
            v-model="newRevenue.description"
            type="text"
            placeholder="Descrição da receita"
            required
            class="input"
            aria-label="Descrição da receita"
          />
          <input
            v-model="formattedAmount"
            type="text"
            placeholder="Valor"
            required
            class="input text-right"
            aria-label="Valor"
          />
          <div class="col-span-full flex justify-end">
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary"
            >
              <i class="fa-regular fa-floppy-disk mr-1"></i>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="w-full border-t " :class="isDark ? 'border-gray-700' : 'border-gray-300'"></div>

    <div class="w-full flex-1" :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
      <div class="max-w-5xl mx-auto px-4 py-8">
        <ul class="space-y-4">
          <li
            v-for="(revenue, index) in revenues"
            :key="revenue.id"
            class="p-4 border border-gray-300 rounded-xl shadow transition hover:shadow-md"
            :class="isDark ? 'bg-gray-800' : 'bg-white'"
          >
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <p class="text-lg font-semibold mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ revenue.description }}</p>
                <p class="text-sm" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
                  Valor: {{ Number(revenue.amount).toMoeda(true) }}
                </p>
              </div>
              <div class="flex gap-2 mt-1 sm:mt-0">
                <button @click="startEdit(index)" class="btn-green">
                  <i class="fa-regular fa-pen-to-square mr-1"></i>
                  Editar
                </button>
                <button @click="deleteRevenue(index)" class="btn-red">
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
          Editar Receita
        </h2>
        <form @submit.prevent="submitEdit">
          <input
            v-model="editingRevenue.description"
            placeholder="Título"
            required
            class="input mb-4"
          />
          <input
            v-model="formattedEditAmount"
            type="text"
            placeholder="Valor"
            class="input text-right mb-4"
          />
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
import Loader from "../components/Loader.vue";
import authService from "../services/authService";
import { useThemeStore } from '../stores/themeStore';
import revenueService from "../services/revenueService";
import { showConfirm, showError, showSuccess } from "../services/alertService";

export default {
  name: "RevenuePage",

  components: {
    Loader,
  },

  data() {
    return {
      newRevenue: {
        description: "",
        amount: null,
        date: new Date(),
      },
      userId: null,
      revenues: [],
      editingRevenue: null,
      editingIndex: null,
      isEditing: false,
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

      this.newRevenue.amount = isNaN(number) ? 0 : number;
      this.formattedAmount = this.newRevenue.amount.toMoeda(true);
    },
    formattedEditAmount(newVal) {
      const cleaned = newVal.replace(/\D/g, '');
      const number = parseFloat(cleaned) / 100;

      this.editingRevenue.amount = isNaN(number) ? 0 : number;
      this.formattedEditAmount = this.editingRevenue.amount.toMoeda(true);
    }
  },

  async mounted() {
    try {
      await this.fetchRevenues();
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },

  methods: {
    async fetchRevenues() {
      try {
        this.isLoading = true;
        const response = await revenueService.getRevenues();
        this.isLoading = false;
        this.revenues = response || [];
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
      }
    },

    async saveRevenue() {
      try {
        const revenueData = { ...this.newRevenue };
        this.isLoading = true;
        await revenueService.createRevenue(revenueData);
        await this.fetchRevenues();
        this.resetForm();
      } catch (error) {
        this.isLoading = false
        await showError('Erro ao salvar receita:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async updateRevenue() {
      try {
        const { id, ...data } = this.editingRevenue;

        if (!id) {
          console.warn("ID da receita não encontrado.");
          return;
        }

        await revenueService.updateRevenue(id, data);
        this.resetForm();
        await this.fetchRevenues();
        this.closeModal();
        await showSuccess('Sucesso!', 'A receita foi atualizada.');
      } catch (error) {
        await showError('Erro ao atualizar receita:', error);
      }
    },

    async deleteRevenue(index) {
      const id = this.revenues[index]?.id;
      if (!id) {
        console.warn("ID da receita não encontrado. Abortando exclusão.");
        return;
      }

      const result = await showConfirm();

      if (result.isConfirmed) {
        try {
          await revenueService.deleteRevenue(id);
          await this.fetchRevenues();
          await showSuccess('Sucesso!', 'A receita foi removida.');
        } catch (error) {
          await showError('Erro ao deletar receita:', error);
        }
      }
    },

    startEdit(index) {
      this.editingIndex = this.revenues[index];
      this.editingRevenue = {
        ...this.editingIndex,
        amount: Number(this.revenues[index].amount).toFixed(2),
      };
      this.formattedEditAmount = Number(this.editingIndex.amount).toMoeda(true);
      this.isEditing = true;
      this.showEditModal = true;
    },

    submitEdit() {
      this.updateRevenue();
    },

    resetForm() {
      this.newRevenue = {
        description: "",
        amount: 0,
        date: new Date(),
      };
      this.formattedAmount = '',
        this.formattedEditAmount = ''
    },

    closeModal() {
      this.showEditModal = false;
      this.isEditing = false;
      this.editingIndex = null;
      this.editingRevenue = null;
    },
  },
};
</script>

<style scoped></style>
