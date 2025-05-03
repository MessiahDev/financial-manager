<template>
    <div class="container">
        <h1 class="title">Perfil do Usuário</h1>

        <div class="card">
            <div class="form-group">
                <label class="label">Nome</label>
                <input v-model="form.name" type="text" class="input" />
            </div>

            <div class="form-group">
                <label class="label">E-mail</label>
                <input v-model="form.email" type="email" class="input" />
            </div>

            <div class="form-group">
                <label class="label">Nova Senha</label>
                <div class="input-wrapper">
                    <input :type="showPassword ? 'text' : 'password'" v-model="form.password" :class="[
                        'input',
                        confirmPassword && form.password !== confirmPassword ? 'input-error' : '',
                        confirmPassword && form.password === confirmPassword ? 'input-success' : ''
                    ]" />
                    <span class="toggle-visibility" @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
                <small class="help-text">Deixe em branco para manter a senha atual.</small>
            </div>

            <div class="form-group">
                <label class="label">Confirme a Nova Senha</label>
                <div class="input-wrapper">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" :class="[
                        'input',
                        confirmPassword && form.password !== confirmPassword ? 'input-error' : '',
                        confirmPassword && form.password === confirmPassword ? 'input-success' : ''
                    ]" />
                    <span class="toggle-visibility" @click="toggleConfirmPasswordVisibility">
                        <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
                <p v-if="confirmPassword && form.password !== confirmPassword" class="error-message">As senhas não coincidem!</p>
                <p v-if="updateSuccess" class="update-success">Dados alterados com sucesso!</p>
            </div>

            <button @click="updateProfile" class="button" :disabled="isLoading">Salvar Alterações</button>

            <div class="loader-container">
                <Loader v-if="isLoading" />
            </div>
        </div>
    </div>
</template>

<script>
import authService from '../services/authService';
import userService from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import Loader from './Loader.vue';

export default {
    name: 'ProfilePage',

    components: {
        Loader
    },

    data() {
        return {
            form: {
                name: '',
                email: '',
                password: ''
            },
            confirmPassword: '',
            showPassword: false,
            showConfirmPassword: false,
            updateSuccess: false,
            isLoading: false,
        }
    },

    computed: {
        authStore() {
            return useAuthStore();
        }
    },

    mounted() {
        this.fetchUserId();
        this.fetchProfile();
        this.authStore.fetchUserProfile();
    },

    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        toggleConfirmPasswordVisibility() {
            this.showConfirmPassword = !this.showConfirmPassword;
        },

        async fetchUserId() {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                console.warn("Token não encontrado.");
                return null;
            }
            try {
                const user = await authService.getProfile();
                return user.id;
            } catch (error) {
                console.error("Erro ao obter perfil do usuário:", error);
                return null;
            }
        },

        async fetchProfile() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) return;

                const user = await userService.getUserProfile(userId);
                this.form.name = user.name;
                this.form.email = user.email;
            } catch (err) {
                console.error('Erro ao buscar perfil do usuário:', err);
            }
        },

        async updateProfile() {
            try {
                const userId = await this.fetchUserId();

                const payload = {
                    name: this.form.name,
                    email: this.form.email
                };

                if (this.form.password.trim() !== '') {
                    if (this.form.password !== this.confirmPassword) {
                        alert('As senhas não coincidem!');
                        return;
                    }
                    payload.password = this.form.password;
                }

                this.isLoading = true;

                await userService.updateUserProfile(userId, payload);
                await this.authStore.fetchUserProfile();

                this.isLoading = false;
                this.updateSuccess = true;
                this.form.password = '';
                this.confirmPassword = '';
            } catch (err) {
                alert('Erro ao atualizar perfil.');
                console.error(err);
            }
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
}

.title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.card {
    border-radius: 0.75rem;
    padding: 1rem;
}

.form-group {
    margin-bottom: 1rem;
    position: relative;
}

.label {
    display: block;
    margin-bottom: 5px;
    color: #555;
}

.input-wrapper {
    position: relative;
}

.input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 2rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    color: #555;
}

.input:focus {
    outline: none;
    box-shadow: none;
}

.input-error {
    border-color: red;
}

.input-success {
    border-color: green;
}

.update-success {
    color: green;
    font-size: 12px;
    margin-top: 5px;
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    height: 40px;
}

.toggle-visibility {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #888;
}

.help-text {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.error-message {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.button {
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
}

.button:hover {
    background-color: #1d4ed8;
}

.button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}
</style>
