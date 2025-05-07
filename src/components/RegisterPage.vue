<template>
    <div class="flex justify-center items-start font-sans min-h-screen pt-24 px-4 sm:px-0">
        <form @submit.prevent="register" class="w-full max-w-sm text-center space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800 mb-5">Cadastro</h2>

            <div class="text-left space-y-2">
                <label for="name" class="block text-gray-600 text-sm font-medium">Nome</label>
                <input id="name" type="text" v-model="name" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div class="text-left space-y-2">
                <label for="email" class="block text-gray-600 text-sm font-medium">Email</label>
                <input id="email" type="email" v-model="email" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div class="text-left space-y-2 relative">
                <label for="password" class="block text-gray-600 text-sm font-medium">Senha</label>
                <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" required :class="[
                    'w-full px-3 py-2 pr-10 rounded-md text-sm focus:outline-none border',
                    passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
                ]" />
                <span class="absolute right-3 top-[50%] transform -translate-y-1/3 text-gray-500 text-lg cursor-pointer"
                    @click="togglePasswordVisibility">
                    <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </span>
            </div>

            <div class="text-left space-y-2 relative">
                <label for="confirmPassword" class="block text-gray-600 text-sm font-medium">Confirmação de
                    Senha</label>
                <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
                    required :class="[
                        'w-full px-3 py-2 pr-10 rounded-md text-sm focus:outline-none border',
                        passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
                    ]" />
                <span class="absolute right-3 top-[50%] transform -translate-y-1/3 text-gray-500 text-lg cursor-pointer"
                    @click="toggleConfirmPasswordVisibility">
                    <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </span>
                <p v-if="passwordsMismatch" class="text-red-500 text-xs mt-1">As senhas não coincidem!</p>
                <p v-if="resgisterSuccess" class="text-green-600 text-xs mt-1">Cadastro realizado com sucesso!</p>
            </div>

            <button type="submit" :disabled="passwordsMismatch || isLoading"
                class="w-full bg-blue-400 text-white py-2 rounded-md text-sm hover:bg-blue-500 transition disabled:bg-blue-200 disabled:cursor-not-allowed">
                Cadastrar
            </button>

            <button type="button" @click="goToLogin"
                class="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition">
                Voltar ao Login
            </button>

            <div class="flex justify-center items-center mt-10 h-10">
                <Loader v-if="isLoading" />
            </div>
        </form>
    </div>
</template>

<script>
import router from '../router';
import authService from '../services/authService';
import Loader from '../components/Loader.vue';
import Swal from 'sweetalert2';

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
                const userData = {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                };

                this.isLoading = true;
                await authService.register(userData);
                this.isLoading = false;

                await  Swal.fire({
                    icon: 'success',
                    title: 'Cadastro realizado!',
                    text: `Um email de verificação foi enviado para ${this.email}. Caso não visualize, verifique sua caixa de spam.`,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });

                this.name = '';
                this.email = '';
                this.password = '';
                this.confirmPassword = '';
                this.resgisterSuccess = true;
            } catch (error) {
                this.isLoading = false;
                console.error('Erro ao cadastrar:', error);

                let message = 'Ocorreu um erro ao tentar cadastrar o usuário. Tente novamente mais tarde.';

                if (error.response && error.response.data) {
                    message =
                        typeof error.response.data === 'string'
                            ? error.response.data
                            : error.response.data.message || message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao cadastrar!',
                    text: message,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });
            }
        },
    },
};
</script>