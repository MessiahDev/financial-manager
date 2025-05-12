<template>
    <div class="flex justify-center items-start mt-10 font-sans min-h-screen pt-24 px-4 sm:px-0 bg-gray-50">
      <form @submit.prevent="updatePassword" class="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-5">
        <h2 class="text-2xl font-semibold text-gray-800 text-center">Esqueci a senha</h2>
  
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="input"
          />
          <small v-if="emailNotExist" class="text-red-500 text-xs block mt-1">
            Email não encontrado. Verifique se está correto!
          </small>
          <small v-if="emailValid" class="text-green-600 text-xs block mt-1">
            Uma mensagem foi enviada ao seu email!<br />
            Se não encontrar, verifique sua caixa de spam.
          </small>
        </div>
  
        <div class="space-y-2">
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Enviar
          </button>
          <button
            type="button"
            @click="goToLogin"
            class="w-full bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition"
          >
            Voltar ao Login
          </button>
        </div>
      </form>
    </div>
</template>  

<script>
import router from '../router';
import authService from '../services/authService';
import { showSuccess, showError } from "../services/alertService";

export default {
    name: 'ForgotPasswordPage',
    data() {
        return {
            email: '',
            emailNotExist: false,
            emailValid: false,
        };
    },
    methods: {
        goToLogin() {
            router.push('/');
        },

        async updatePassword() {
            try {
                await authService.forgotPassword(this.email);
                this.emailValid = true;
                this.emailNotExist = false;
                await showSuccess('Sucesso!', 'A senha foi atualizada.');
            } catch (error) {
                this.emailNotExist = true;
                this.emailValid = false;
                await showError('Erro ao atualizar a senha:', error);
            }
        },
    },
};
</script>