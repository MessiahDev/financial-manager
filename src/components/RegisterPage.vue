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
                        required 
                    />
                    <span class="toggle-visibility" @click="togglePasswordVisibility">
                        {{ showPassword ? '🙈' : '👁️' }}
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
                        {{ showConfirmPassword ? '🙈' : '👁️' }}
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
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.register-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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