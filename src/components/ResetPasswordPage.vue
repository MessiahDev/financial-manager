<template>
    <div class="flex justify-center items-start font-sans pt-24 min-h-screen">
        <form @submit.prevent="reset" class="w-full max-w-sm text-center space-y-5">
            <h2 class="text-2xl font-semibold text-gray-800">Redefinir senha</h2>

            <div class="space-y-2 text-left">
                <label for="password" class="block text-gray-600 text-sm font-medium">Senha</label>
                <div class="relative">
                    <input id="password" :type="showPassword ? 'text' : 'password'" v-model="newPassword" required
                        :class="[
                            'w-full pr-10 py-2 px-3 rounded-md text-sm border focus:outline-none',
                            passwordsMismatch ? 'border-red-500' : '',
                            passwordsMatch ? 'border-green-500' : 'border-gray-300'
                        ]" />
                    <span
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
                        @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
            </div>

            <div class="space-y-2 text-left">
                <label for="confirmPassword" class="block text-gray-600 text-sm font-medium">Confirmação de
                    Senha</label>
                <div class="relative">
                    <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="confirmNewPassword" required :class="[
                            'w-full pr-10 py-2 px-3 rounded-md text-sm border focus:outline-none',
                            passwordsMismatch ? 'border-red-500' : '',
                            passwordsMatch ? 'border-green-500' : 'border-gray-300'
                        ]" />
                    <span
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
                        @click="toggleConfirmPasswordVisibility">
                        <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>

                <p v-if="passwordsMismatch" class="text-red-600 text-xs mt-1">As senhas não coincidem!</p>
                <p v-if="passwordResetSuccess" class="text-green-600 text-xs mt-1">Senha redefinida com sucesso!</p>
            </div>

            <button type="submit" :disabled="passwordsMismatch"
                class="w-full px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md text-base disabled:bg-blue-200 disabled:cursor-not-allowed transition-colors">
                Cadastrar
            </button>

            <button type="button" @click="goToLogin"
                class="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors">
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