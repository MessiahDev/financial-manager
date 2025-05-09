<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
      <form
        @submit.prevent="register"
        class="w-full max-w-md bg-white p-8 mt-12 rounded-2xl shadow-xl space-y-5"
        aria-label="Formulário de Cadastro"
      >
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">Criar Conta</h2>

        <div class="space-y-1">
          <label for="name" class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            id="name"
            type="text"
            v-model="name"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
          
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              required
              :class="[
                'w-full px-4 py-2 pr-10 rounded-lg focus:outline-none border transition',
                passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
              ]"
            />
            <span
              class="absolute right-3 top-2 text-gray-500 cursor-pointer text-lg"
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
              v-model="confirmPassword"
              required
              :class="[
                'w-full px-4 py-2 pr-10 rounded-lg focus:outline-none border transition',
                passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
              ]"
            />
            <span
              class="absolute right-3 top-2 text-gray-500 cursor-pointer text-lg"
              @click="toggleConfirmPasswordVisibility"
            >
              <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
            </span>
          </div>

          <p v-if="passwordsMismatch" class="text-red-500 text-sm">As senhas não coincidem.</p>
          <p v-if="resgisterSuccess" class="text-green-600 text-sm">Cadastro realizado com sucesso!</p>
        </div>

        <button
          type="submit"
          :disabled="passwordsMismatch || !isPasswordValid || isLoading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          Cadastrar
        </button>

        <button
          type="button"
          @click="goToLogin"
          class="w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Voltar ao Login
        </button>

        <div class="flex justify-center items-center mt-6 h-10">
          <Loader v-if="isLoading" />
        </div>
      </form>
    </div>
</template>

<script>
import router from '../router';
import Loader from '../components/Loader.vue';
import authService from '../services/authService';
import { showSuccess, showError } from '../services/alertService';

export default {
  name: 'RegisterPage',
  components: {
      Loader,
  },
  data() {
      return {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          showPassword: false,
          showConfirmPassword: false,
          isLoading: false,
          resgisterSuccess: false,
      };
  },
  computed: {
    passwordsMatch() {
        return this.password !== '' && this.confirmPassword !== '' && this.password === this.confirmPassword;
    },
    passwordsMismatch() {
        return this.password !== '' && this.confirmPassword !== '' && this.password !== this.confirmPassword;
    },
    passwordChecks() {
        return {
        minLength: this.password.length >= 8,
        uppercase: /[A-Z]/.test(this.password),
        lowercase: /[a-z]/.test(this.password),
        number: /\d/.test(this.password),
        specialChar: /[^A-Za-z0-9]/.test(this.password)
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
    async register() {
        try {
          if (!this.isPasswordValid) {
            await showError('A senha não cumpre os critérios mínimos de segurança.');
            return;
          }

          const userData = {
              name: this.name,
              email: this.email,
              password: this.password,
          };

          this.isLoading = true;
          await authService.register(userData);
          this.isLoading = false;

          await showSuccess('Cadastro realizado!', `Um email de verificação foi enviado para ${this.email}. Caso não visualize, verifique sua caixa de spam.`);

          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.resgisterSuccess = true;
      } catch (error) {
          this.isLoading = false;
          await showError('Erro ao cadastrar:', error);
      }
    },
  },
};
</script>