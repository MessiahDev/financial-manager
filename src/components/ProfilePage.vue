<template>
    <div class="max-w-lg w-full mx-auto p-4 sm:p-6 lg:p-8 font-sans">
        <h1 class="text-2xl font-bold mb-6 text-center">Perfil do Usuário</h1>

        <div class="rounded-2xl p-6 space-y-6">
            <div>
                <label class="block text-gray-700 mb-1">Nome</label>
                <input v-model="form.name" type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300" />
            </div>

            <div>
                <label class="block text-gray-700 mb-1">E-mail</label>
                <input v-model="form.email" type="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300" />
            </div>

            <div class="space-y-1">
                <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
                
                <div class="relative">
                    <input
                    id="password"
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    required
                    :class="[
                        'w-full px-4 py-2 pr-10 rounded-lg focus:outline-none border transition',
                        passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
                    ]"
                    />
                    <span
                    class="absolute right-3 top-2 text-gray-500 cursor-pointer text-lg"
                    @click="togglePasswordVisibility"
                    >
                    <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
            </div>

            <div class="text-sm mt-1 space-y-1">
                <div
                    v-for="(label, key) in passwordLabels"
                    :key="key"
                    :class="passwordChecks[key] ? 'text-green-600' : 'text-gray-500'"
                >
                    <i :class="passwordChecks[key] ? 'fa-solid fa-check' : 'fa-regular fa-circle'" class="mr-2"></i>
                    {{ label }}
                </div>
            </div>

            <div class="space-y-1">
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                
                <div class="relative">
                    <input
                    id="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    required
                    :class="[
                        'w-full px-4 py-2 pr-10 rounded-lg focus:outline-none border transition',
                        passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-gray-300'
                    ]"
                    />
                    <span
                    class="absolute right-3 top-2 text-gray-500 cursor-pointer text-lg"
                    @click="toggleConfirmPasswordVisibility"
                    >
                    <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>

                <p v-if="passwordsMismatch" class="text-red-500 text-sm">As senhas não coincidem.</p>
                <p v-if="updateSuccess" class="text-green-600 text-sm">Cadastro realizado com sucesso!</p>
            </div>

            <div class="flex justify-end">
                <button @click="updateProfile" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition">
                    Salvar Alterações
                </button>
            </div>

            <div v-if="isLoading" class="flex justify-center mt-6">
                <Loader />
            </div>
        </div>
    </div>
</template>


<script>
import router from '../router';
import Loader from './Loader.vue';
import authService from '../services/authService';
import userService from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import { showSuccess, showError } from "../services/alertService";

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
            password: '',
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
        },
        passwordsMatch() {
            return this.password !== '' && this.confirmPassword !== '' && this.password === this.confirmPassword;
        },
        passwordsMismatch() {
            return this.password !== '' && this.confirmPassword !== '' && this.password !== this.confirmPassword;
        },
        passwordChecks() {
            return {
            minLength: this.password.length >= 8,
            uppercase: /[A-Z]/.test(this.password),
            lowercase: /[a-z]/.test(this.password),
            number: /\d/.test(this.password),
            specialChar: /[^A-Za-z0-9]/.test(this.password)
            };
        },
        isPasswordValid() {
            const c = this.passwordChecks;
            return c.minLength && c.uppercase && c.lowercase && c.number && c.specialChar;
        },
        passwordLabels() {
            return {
            minLength: 'Mínimo de 8 caracteres',
            uppercase: 'Pelo menos 1 letra maiúscula',
            lowercase: 'Pelo menos 1 letra minúscula',
            number: 'Pelo menos 1 número',
            specialChar: 'Pelo menos 1 caractere especial'
            };
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
                if (!this.isPasswordValid) {
                    await showError('A senha não cumpre os critérios mínimos de segurança.');
                    return;
                }

                const userId = await this.fetchUserId();
                const user = await authService.getProfile(userId);

                const payload = {
                    name: this.form.name,
                    email: this.form.email
                };

                if (this.form.password.trim() !== '') {
                    if (this.form.password !== this.confirmPassword) {
                        await showError('Atenção!', 'As senhas não coincidem.');
                        return;
                    }
                    payload.password = this.form.password;
                }

                const oldEmail = user.email;

                this.isLoading = true;

                const response = await userService.updateUserProfile(user.id, payload);
                await this.authStore.fetchUserProfile();

                this.isLoading = false;
                this.updateSuccess = true;
                this.form.password = '';
                this.confirmPassword = '';

                await showSuccess('Sucesso', 'Perfil atualizado com sucesso.');

                if (this.form.email.trim().toLowerCase() !== oldEmail.trim().toLowerCase()) {
                    await authService.logout();
                    router.push('/');
                }

            } catch (error) {
                this.isLoading = false;
                await showError('Erro ao atualizar perfil:', error)
            }
        }
    }
}
</script>

<style scoped></style>
