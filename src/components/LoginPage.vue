<template>
    <div class="login-page">
        <form class="login-form" @submit.prevent="handleLogin">
            <h2>Login</h2>
            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" type="email" v-model="email" required />
            </div>
            <div class="form-group password-group">
                <label for="password">Senha</label>
                <div class="input-wrapper">
                    <input
                        id="password"
                        :type="showPassword ? 'text' : 'password'"
                        v-model="password"
                        required
                    />
                    <span class="toggle-visibility" @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" v-model="stayConnected" />
                    Manter conectado
                </label>
            </div>
            <button type="submit" class="login-button">Entrar</button>
            <div class="links">
                <a href="#" @click.prevent="handleForgotPassword">Esqueci a senha</a>
                <a href="/cadastro">Cadastrar-se</a>
            </div>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import router from '../router';
import authService from '../services/authService';

export default {
    name: 'LoginPage',
    setup() {
        const email = ref('');
        const password = ref('');
        const showPassword = ref(false);
        const stayConnected = ref(false);

        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        };

        const handleLogin = async () => {
            try {
                const credentials = {
                    email: email.value,
                    password: password.value,
                };

                await authService.login(credentials, router);

            } catch (error) {
                console.error('Erro ao fazer login:', error);
                alert('Falha no login. Verifique seu email e senha.');
            }
        };

        const handleForgotPassword = () => {
            alert('Função de recuperação de senha ainda não implementada.');
        };

        return {
            email,
            password,
            showPassword,
            stayConnected,
            togglePasswordVisibility,
            handleLogin,
            handleForgotPassword,
        };
    },
};
</script>

<style scoped>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.login-form {
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333333;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #555555;
}

input[type="email"],
input[type="password"],
input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    box-sizing: border-box;
    color: #555;
}

input:focus {
    outline: none;
    box-shadow: none;
}

.password-group {
    position: relative;
}

.input-wrapper {
    position: relative;
}

.toggle-visibility {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
}

.login-button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.login-button:hover {
    background-color: #0056b3;
}

.links {
    margin-top: 15px;
    text-align: center;
}

.links a {
    color: #007bff;
    text-decoration: none;
    margin: 0 10px;
}

.links a:hover {
    text-decoration: underline;
}
</style>