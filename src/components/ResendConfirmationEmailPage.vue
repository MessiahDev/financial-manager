<template>
    <div class="flex justify-center items-start font-sans pt-24 min-h-screen">
        <form @submit.prevent="resendConfimation" class="w-full max-w-sm text-center space-y-5">
            <h2 class="text-2xl font-semibold text-gray-800">Cadastro</h2>

            <div class="space-y-2 text-left">
                <label for="email" class="block text-gray-600 text-sm font-medium">Email</label>
                <input id="email" type="email" v-model="email" required
                    class="w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <button type="submit" :disabled="isLoading"
                class="w-full px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md text-base disabled:bg-blue-200 disabled:cursor-not-allowed transition-colors">
                Enviar
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
import Swal from 'sweetalert2';

export default {
    name: 'ResendConfirmationEmailPage',

    components: {
        Loader,
    },

    data() {
        return {
            email: '',
            isLoading: false,
        };
    },

    methods: {
        goToLogin() {
            router.push('/');
        },

        async resendConfimation() {
            this.isLoading = true;
            try {
                const response = await authService.resendConfirmationEmail(this.email);
                await Swal.fire({
                    icon: 'success',
                    title: 'Email reenviado!',
                    text: 'Caso não visualize na caixa de entrada, verifique sua caixa de spam.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });

                this.goToLogin();
            } catch (error) {
                console.error('Erro ao reenviar e-mail de confirmação:', error);
                const mensagem = typeof error.response?.data === 'string'
                    ? error.response.data
                    : 'Erro desconhecido.';

                await Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: mensagem,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>