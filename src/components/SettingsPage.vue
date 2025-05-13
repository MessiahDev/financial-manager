<template>
  <div class="max-w-lg min-h-screen mx-auto mt-20 p-4 sm:p-6 lg:p-8 font-sans">
    <h1 class="text-center text-3xl font-bold mb-12" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
      Configurações
    </h1>

    <div class="rounded-2xl p-6 space-y-10">
      <div class="flex items-center">
        <span :class="isDark ? 'text-gray-100' : 'text-gray-800'" class="text-lg font-medium">Tema:</span>
        <button
          @click="toggleTheme"
          class="w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 mx-5 transition-colors duration-300"
        >
          <div
            class="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300"
            :class="{ 'translate-x-6': isDark }"
          >
            <span v-if="isDark" class="flex justify-center items-center h-full">🌙</span>
            <span v-else class="flex justify-center items-center h-full">🌞</span>
          </div>
        </button>
      </div>

      <div>
        <button 
          @click="deleteAccount" 
          class="w-full py-2 bg-red-600 text-white rounded-lg my-12 hover:bg-red-700 focus:outline-none transition"
        >
          Excluir Conta
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import userService from '../services/userService';
import { useThemeStore } from '../stores/themeStore';
import { showConfirm, showSuccess, showError } from '../services/alertService';
import authService from '../services/authService';

export default {
  name: 'SettingsPage',

  data() {
    return {
      userId: null,
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
    
    toggleTheme() {
      this.themeStore.toggleTheme();
    },

    async deleteAccount() {
      const result = await showConfirm();

      if (result.isConfirmed) {
        try {
          await userService.deleteUser(this.userId);
          await showSuccess('Deletado!', 'A conta foi excluida com sucesso.');
          authService.logout();
        } catch (error) {
          await showError('Erro ao deletar conta!', error);
        }
      }
    },
  },
};
</script>

<style scoped>
</style>
