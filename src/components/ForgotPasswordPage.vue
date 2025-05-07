<template>
    <div class="flex justify-center items-start font-sans min-h-screen pt-24 px-4 sm:px-0">
        <form @submit.prevent="register" class="w-full max-w-sm rounded-md text-center space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800 mb-5">Esqueci a senha</h2>

            <div class="text-left space-y-2">
                <label for="email" class="block text-gray-600 text-sm font-medium">Email</label>
                <input id="email" type="email" v-model="email" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <small v-if="emailNotExist" class="text-red-500 text-xs block mt-1">
                    Email não encontrado, verifique se está correto!
                </small>
                <small v-if="emailValid" class="text-green-600 text-xs block mt-1">
                    Uma mensagem foi enviada ao seu endereço de email!
                    <br />Se não conseguir visualizar, verifique sua caixa de spam!
                </small>
            </div>

            <button type="submit"
                class="w-full bg-blue-400 text-white py-2 rounded-md text-sm hover:bg-blue-500 transition"
                @click.prevent="updatePassword()">
                Enviar
            </button>
            <button type="button" @click="goToLogin"
                class="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition">
                Voltar ao Login
            </button>
        </form>
    </div>
</template>

<script>
import router from '../router';
import authService from '../services/authService';

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

                await Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'A senha foi atualizada.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });
            } catch (error) {
                this.emailNotExist = true;
                this.emailValid = false;

                console.error('Erro ao cadastrar. Tente novamente:', error);

                let message = 'Ocorreu um erro ao tentar cadastrar a despesa. Tente novamente mais tarde.';

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