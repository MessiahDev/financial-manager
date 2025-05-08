<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
        <div class="relative w-full max-w-md">
        <form
            class="bg-white p-8 rounded-2xl shadow-xl w-full"
            @submit.prevent="handleLogin"
            aria-label="Formulário de Login"
        >
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">Acessar Conta</h2>

            <div class="mb-5">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
                id="email"
                type="email"
                v-model="email"
                required
                aria-label="Email"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <small v-if="emailNotConfirmed" class="text-red-600 mt-2 block">
                Email não confirmado!
                <router-link to="/reenviar-confirmacao-email" class="text-blue-600 hover:underline ml-1">
                Reenviar confirmação
                </router-link>
            </small>
            </div>

            <div class="mb-5">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div class="relative">
                <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                aria-label="Senha"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
            </div>
            </div>

            <div class="mb-6">
            <label class="inline-flex items-center text-gray-700 text-sm">
                <input
                type="checkbox"
                v-model="stayConnected"
                class="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span class="ml-2">Manter conectado</span>
            </label>
            </div>

            <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
            Entrar
            </button>

            <div class="text-center mt-6 text-sm text-gray-600">
            <router-link to="/recuperar-senha" class="text-blue-600 hover:underline">
                Esqueci a senha
            </router-link>
            <span class="mx-2">|</span>
            <router-link to="/cadastro" class="text-blue-600 hover:underline">
                Cadastrar-se
            </router-link>
            </div>
        </form>

        <div
            v-if="isLoading"
            class="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10"
        >
            <Loader />
            <p class="mt-4 font-medium text-gray-800">Aguarde, processando login...</p>
        </div>
        </div>
    </div>
</template>  

<script>
import router from '../router';
import Loader from '../components/Loader.vue';
import authService from '../services/authService';
import { showError } from "../services/alertService";

export default {
    name: 'LoginPage',

    components: {
        Loader,
    },

    data() {
        return {
            email: '',
            password: '',
            showPassword: false,
            stayConnected: false,
            isLoading: false,
            emailNotConfirmed: false,
        };
    },

    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },

        async handleLogin() {
            this.isLoading = true;
            this.emailNotConfirmed = false;

            try {
                const credentials = {
                    email: this.email,
                    password: this.password,
                };

                await authService.login(credentials, router, this.stayConnected);
            } catch (error) {
                if (
                    error.response &&
                    error.response.status === 422 &&
                    typeof error.response.data === 'string' &&
                    error.response.data.toLowerCase().includes('e-mail não confirmado')
                ) {
                    this.emailNotConfirmed = true;
                    this.password = '';
                    await showError('Atenção!', error);
                } else {
                    await showError('Erro ao fazer login:', error);
                }
            } finally {
                this.isLoading = false;
            }
        }
    },
};
</script>
