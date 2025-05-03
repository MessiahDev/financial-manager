<template>
    <div class="resetpassword-page">
        <form @submit.prevent="reset" class="resetpassword-form">
            <h2>Redefinir senha</h2>

            <div class="form-group">
                <label for="password">Senha</label>
                <div class="input-wrapper">
                    <input id="password" :type="showPassword ? 'text' : 'password'" v-model="newPassword"
                        :class="{ 'error': passwordsMismatch, 'success': passwordsMatch }" required />
                    <span class="toggle-visibility" @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmação de Senha</label>
                <div class="input-wrapper">
                    <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="confirmNewPassword" :class="{ 'error': passwordsMismatch, 'success': passwordsMatch }"
                        required />
                    <span class="toggle-visibility" @click="toggleConfirmPasswordVisibility">
                        <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
                <p v-if="passwordsMismatch" class="error-message">As senhas não coincidem!</p>
                <p v-if="passwordResetSuccess" class="success-message">Senha redefinida com sucesso!</p>
            </div>

            <button type="submit" :disabled="passwordsMismatch" class="submit-button">Cadastrar</button>
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
            isLoading: true,
        };
    },

    computed: {
        passwordsMismatch() {
            return this.newPassword && this.confirmNewPassword && this.newPassword !== this.confirmNewPassword;
        },
        passwordsMatch() {
            return this.newPassword && this.confirmNewPassword && this.newPassword === this.confirmNewPassword;
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
                const token = this.$route.query.token;

                if (!token) {
                    alert('Token inválido ou ausente na URL.');
                    return;
                }

                const newPassword = this.newPassword;

                this.isLoading = true;
                await authService.resetPassword(token, newPassword);
                this.isLoading = false;
                this.passwordResetSuccess = true;
                this.newPassword = '';
                this.confirmNewPassword = '';
            } catch (error) {
                console.error('Erro ao redefinir a senha:', error);
                alert('Erro ao redefinir a senha. Tente novamente.');
            }
        }
    },
};
</script>

<style scoped>
.resetpassword-page {
    padding: 6em 0em 0em 0em;
    display: flex;
    justify-content: center;
    height: 100vh;
}

.resetpassword-form {
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

.success-message {
    color: green;
    font-size: 12px;
    margin-top: 5px;
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
</style>