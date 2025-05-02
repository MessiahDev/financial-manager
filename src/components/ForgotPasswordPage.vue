<template>
    <div class="forgotPassword-page">
        <form @submit.prevent="register" class="forgotPassword-form">
            <h2>Esqueci a senha</h2>

            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" type="email" v-model="email" required />
                <small v-if="emailNotExist" class="emailNotExist">Email não encontrado, verifique se está correto!</small>
                <small v-if="emailValid" class="emailValid">Uma mensagem foi enviada ao seu endereço de email!<br>Se não conseguir visualizar, verifique sua caixa de span!</small>
            </div>

            <button type="submit" class="submit-button" @click.prevent="updatePassword()">Enviar</button>
            <button type="button" @click="goToLogin" class="back-button">Voltar ao Login</button>
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
            } catch (error) {
                console.error('Erro ao cadastrar. Tente novamente.', error);
                this.emailNotExist = true;
            }
        },
    },
};
</script>

<style scoped>
.forgotPassword-page {
    padding: 6em 0em 0em 0em;
    display: flex;
    justify-content: center;
    height: 100vh;
}

.forgotPassword-form {
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

.error-message {
    color: red;
    font-size: 12px;
    margin-top: 5px;
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

.emailNotExist {
    color: red;
    font-size: 12px;
    margin-top: 5px;
}

.emailValid {
    color: green;
    font-size: 12px;
    margin-top: 5px;
}
</style>