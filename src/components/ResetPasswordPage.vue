<template>
  <div class="flex justify-center items-start font-sans pt-24 min-h-screen bg-gray-50 px-4">
    <form
      @submit.prevent="reset"
      class="w-full max-w-md bg-white p-8 mt-12 rounded-2xl shadow-xl space-y-5"
    >
      <h2 class="text-2xl font-bold text-center text-gray-800">Redefinir Senha</h2>

      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700">Nova Senha</label>
        <div class="relative">
          <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            v-model="newPassword"
            required
            class="w-full pr-10 py-2 px-3 rounded-lg text-sm border focus:outline-none transition text-gray-600"
            :class="[
              passwordsMismatch ? 'border-red-500' : '',
              passwordsMatch ? 'border-green-500' : 'border-gray-300'
            ]"
          />
          <span
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
            @click="togglePasswordVisibility"
          >
            <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
          </span>
        </div>
      </div>

      <div class="text-sm mt-1 space-y-1">
        <div
          v-for="(label, key) in passwordLabels"
          :key="key"
          :class="passwordChecks[key] ? 'text-green-600' : 'text-gray-500'"
        >
          <i :class="passwordChecks[key] ? 'fa-solid fa-check' : 'fa-regular fa-circle'" class="mr-2"></i>
          {{ label }}
        </div>
      </div>

      <div class="space-y-1">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar Senha</label>
        <div class="relative">
          <input
            id="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmNewPassword"
            required
            class="w-full pr-10 py-2 px-3 rounded-lg text-sm border focus:outline-none transition text-gray-600"
            :class="[
              passwordsMismatch ? 'border-red-500' : '',
              passwordsMatch ? 'border-green-500' : 'border-gray-300'
            ]"
          />
          <span
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
            @click="toggleConfirmPasswordVisibility"
          >
            <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
          </span>
        </div>
        <p v-if="passwordsMismatch" class="text-red-600 text-xs mt-1">As senhas não coincidem!</p>
        <p v-if="passwordResetSuccess" class="text-green-600 text-xs mt-1">Senha redefinida com sucesso!</p>
      </div>

      <div class="space-y-2">
        <button
          type="submit"
          :disabled="passwordsMismatch || !isPasswordValid || isLoading"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Redefinir Senha
        </button>
        <button
          type="button"
          @click="goToLogin"
          class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
        >
          Voltar ao Login
        </button>
      </div>

      <div class="flex justify-center items-center mt-6 h-10">
        <Loader v-if="isLoading" />
      </div>
    </form>
  </div>
</template>

<script>
import router from '../router';
import authService from '../services/authService';
import Loader from '../components/Loader.vue';
import { showError, showSuccess } from '../services/alertService';

export default {
    name: 'ResetPasswordPage',

    components: {
        Loader,
    },

    data() {
        return {
            passwordResetSuccess: false,
            newPassword: '',
            confirmNewPassword: '',
            showPassword: false,
            showConfirmPassword: false,
            isLoading: false,
        };
    },

    computed: {
        passwordsMismatch() {
            return this.newPassword && this.confirmNewPassword && this.newPassword !== this.confirmNewPassword;
        },
        passwordsMatch() {
            return this.newPassword && this.confirmNewPassword && this.newPassword === this.confirmNewPassword;
        },
        passwordChecks() {
            return {
            minLength: this.newPassword.length >= 8,
            uppercase: /[A-Z]/.test(this.newPassword),
            lowercase: /[a-z]/.test(this.newPassword),
            number: /\d/.test(this.newPassword),
            specialChar: /[^A-Za-z0-9]/.test(this.newPassword)
            };
        },
        isPasswordValid() {
            const c = this.passwordChecks;
            return c.minLength && c.uppercase && c.lowercase && c.number && c.specialChar;
        },
        passwordLabels() {
            return {
            minLength: 'Mínimo de 8 caracteres',
            uppercase: 'Pelo menos 1 letra maiúscula',
            lowercase: 'Pelo menos 1 letra minúscula',
            number: 'Pelo menos 1 número',
            specialChar: 'Pelo menos 1 caractere especial'
            };
        }
    },

    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },

        toggleConfirmPasswordVisibility() {
            this.showConfirmPassword = !this.showConfirmPassword;
        },

        goToLogin() {
            router.push('/');
        },

        async reset() {
            try {
                if (!this.isPasswordValid) {
                    await showError('A senha não cumpre os critérios mínimos de segurança.');
                    return;
                }
                const token = this.$route.query.token;
                if (!token) {
                    alert('Token inválido ou ausente na URL.');
                    return;
                }

                this.isLoading = true;
                await authService.resetPassword(token, this.newPassword);
                this.isLoading = false;
                this.passwordResetSuccess = true;
                await showSuccess('Sucesso!', 'Sua senha foi redefinida.');
                this.newPassword = '';
                this.confirmNewPassword = '';
            } catch (error) {
                await showError('Erro ao redefinir a senha:', error);
            }
        },
    },
};
</script>