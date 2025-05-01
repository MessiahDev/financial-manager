<template>
    <div class="register-page">
        <form @submit.prevent="register" class="register-form">
            <h2>Cadastro</h2>
            
            <div class="form-group">
                <label for="name">Nome</label>
                <input id="name" type="text" v-model="name" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" type="email" v-model="email" required />
            </div>

            <div class="form-group">
                <label for="password">Senha</label>
                <div class="input-wrapper">
                    <input 
                        id="password" 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="password" 
                        :class="{ 'error': passwordsMismatch, 'success': passwordsMatch }" 
                        required 
                    />
                    <span class="toggle-visibility" @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmação de Senha</label>
                <div class="input-wrapper">
                    <input 
                        id="confirmPassword" 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        v-model="confirmPassword" 
                        :class="{ 'error': passwordsMismatch, 'success': passwordsMatch }" 
                        required 
                    />
                    <span class="toggle-visibility" @click="toggleConfirmPasswordVisibility">
                        <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
                <p v-if="passwordsMismatch" class="error-message">As senhas não coincidem</p>
            </div>

            <button type="submit" :disabled="passwordsMismatch" class="submit-button">Cadastrar</button>
            <button type="button" @click="goToLogin" class="back-button">Voltar ao Login</button>
        </form>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import router from '../router';
import authService from '../services/authService';

export default {
    name: 'RegisterPage',
    setup() {
        const name = ref('');
        const email = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const showPassword = ref(false);
        const showConfirmPassword = ref(false);

        const passwordsMismatch = computed(() => confirmPassword.value && password.value !== confirmPassword.value);
        const passwordsMatch = computed(() => confirmPassword.value && password.value === confirmPassword.value);

        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        };

        const toggleConfirmPasswordVisibility = () => {
            showConfirmPassword.value = !showConfirmPassword.value;
        };

        const goToLogin = () => {
            router.push('/');
        };

        const register = async () => {
            try {
                const userData = {
                    name: name.value,
                    email: email.value,
                    password: password.value,
                };

                await authService.register(userData);

                router.push('/');
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                alert('Erro ao cadastrar. Tente novamente.');
            }
        };

        return {
            name,
            email,
            password,
            confirmPassword,
            showPassword,
            showConfirmPassword,
            passwordsMismatch,
            passwordsMatch,
            togglePasswordVisibility,
            toggleConfirmPasswordVisibility,
            register,
            goToLogin,
        };
    },
};
</script>

<style scoped>
.register-page {
    padding: 6em 0em 0em 0em;
    display: flex;
    justify-content: center;
    height: 100vh;
}

.register-form {
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
</style>