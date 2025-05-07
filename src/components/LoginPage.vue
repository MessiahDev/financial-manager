<template>
    <div class="flex justify-center items-center font-sans min-h-screen bg-gray-50">
        <div class="relative w-full max-w-sm">
            <form class="bg-white p-6 rounded-lg w-full shadow-lg" @submit.prevent="handleLogin">
                <h2 class="text-center text-xl font-semibold text-gray-800 mb-6">
                    Login
                </h2>

                <div class="mb-4">
                    <label for="email" class="block text-gray-600 mb-2">Email</label>
                    <input id="email" type="email" v-model="email" required
                        class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <small v-if="emailNotConfirmed" class="text-red-500 mt-2 block">
                        Email não confirmado!
                        <router-link to="/reenviar-confirmacao-email" class="text-blue-600">
                            Reenviar confirmação?
                        </router-link>
                    </small>
                </div>

                <div class="mb-4">
                    <label for="password" class="block text-gray-600 mb-2">Senha</label>
                    <div class="relative">
                        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" required
                            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                            @click="togglePasswordVisibility">
                            <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                        </span>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="inline-flex items-center text-gray-600">
                        <input type="checkbox" v-model="stayConnected" class="form-checkbox text-blue-500" />
                        <span class="ml-2">Manter conectado</span>
                    </label>
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    Entrar
                </button>

                <div class="text-center mt-4">
                    <a href="/recuperar-senha" class="text-blue-600 hover:underline">Esqueci a senha</a><br />
                    <a href="/cadastro" class="text-blue-600 hover:underline">Cadastrar-se</a>
                </div>
            </form>

            <div v-if="isLoading"
                class="absolute inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center rounded-lg z-10">
                <Loader />
                <p class="mt-5 font-semibold text-gray-900 text-lg">Aguarde, processando seu login...</p>
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
