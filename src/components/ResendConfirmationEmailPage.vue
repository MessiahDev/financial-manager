<template>
    <div class="resend-confirmation-page">
        <form @submit.prevent="resendConfimation" class="resend-form">
            <h2>Cadastro</h2>

            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" type="email" v-model="email" required />
            </div>

            <button type="submit" :disabled="isLoading" class="submit-button">Enviar</button>
            <button type="button" @click="goToLogin" class="back-button">Voltar ao Login</button>

            <div class="loader-container">
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
                console.log('Resposta:', response.data);

                await Swal.fire({
                    icon: 'success',
                    title: 'Email reenviado!',
                    text: 'Caso não visualize na caixa de entrada, verifique sua caixa de spam.',
                    confirmButtonText: 'Ok',
                });

                this.goToLogin();

            } catch (error) {
                console.error('Erro ao reenviar e-mail de confirmação:', error);
                const mensagem = typeof error.response?.data === 'string'
                    ? error.response.data
                    : 'Erro desconhecido. Verifique o console.';

                await Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: mensagem,
                    confirmButtonText: 'Fechar',
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped>
.resend-confirmation-page {
    padding: 6em 0em 0em 0em;
    display: flex;
    justify-content: center;
    height: 100vh;
}

.resend-form {
    border-radius: 8px;
    width: 100%;
    max-width: 300px;
    text-align: center;
}

h2 {
    margin-bottom: 20px;
    color: #333;
}

.form-group {
    margin-bottom: 15px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #555;
}

.input-wrapper {
    position: relative;
}

input {
    width: 100%;
    padding: 10px;
    padding-right: 30px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

input:focus {
    outline: none;
    box-shadow: none;
}

input.error {
    border-color: red;
}

input.success {
    border-color: green;
}

.toggle-visibility {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 17px;
    color: #888;
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    height: 40px;
}

.submit-button {
    width: 100%;
    padding: 10px;
    background-color: #4cafef;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.submit-button:disabled {
    background-color: #b3d9ff;
    cursor: not-allowed;
}

.back-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}
</style>