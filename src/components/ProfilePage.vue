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

            <div>
                <label class="block text-gray-700 mb-1">Nova Senha</label>
                <div class="relative">
                    <input :type="showPassword ? 'text' : 'password'" v-model="form.password" :class="[
                        'w-full pr-10 px-4 py-2 rounded-md border focus:outline-none',
                        confirmPassword && form.password !== confirmPassword ? 'border-red-500' : '',
                        confirmPassword && form.password === confirmPassword ? 'border-green-500' : 'border-gray-300'
                    ]" />
                    <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                        @click="togglePasswordVisibility">
                        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>
                <small class="text-sm text-gray-500 mt-1 block">Deixe em branco para manter a senha atual.</small>
            </div>

            <div>
                <label class="block text-gray-700 mb-1">Confirme a Nova Senha</label>
                <div class="relative">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" :class="[
                        'w-full pr-10 px-4 py-2 rounded-md border focus:outline-none',
                        confirmPassword && form.password !== confirmPassword ? 'border-red-500' : '',
                        confirmPassword && form.password === confirmPassword ? 'border-green-500' : 'border-gray-300']" />
                    <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                        @click="toggleConfirmPasswordVisibility">
                        <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
                    </span>
                </div>

                <p v-if="confirmPassword && form.password !== confirmPassword" class="text-sm text-red-500 mt-1">As
                    senhas não coincidem!</p>
                <p v-if="updateSuccess" class="text-sm text-green-600 mt-1">Dados alterados com sucesso!</p>
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
import authService from '../services/authService';
import userService from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import Loader from './Loader.vue';
import Swal from 'sweetalert2';
import router from '../router';

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
                const user = await authService.getProfile(userId);

                const payload = {
                    name: this.form.name,
                    email: this.form.email
                };

                if (this.form.password.trim() !== '') {
                    if (this.form.password !== this.confirmPassword) {
                        await Swal.fire({
                            icon: 'error',
                            title: 'Erro!',
                            text: 'As senhas não coincidem!',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded'
                            },
                            buttonsStyling: false
                        });
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

                const message = typeof response.data === 'string'
                    ? response.data
                    : (response.data.message || 'Perfil atualizado com sucesso.');

                await Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: message,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });

                if (this.form.email.trim().toLowerCase() !== oldEmail.trim().toLowerCase()) {
                    await authService.logout();
                    router.push('/');
                }

            } catch (error) {
                this.isLoading = false;
                console.error('Erro ao atualizar perfil:', error);

                let message = 'Ocorreu um erro ao tentar atualizar o perfil. Tente novamente mais tarde.';

                if (error.response && error.response.data) {
                    message = typeof error.response.data === 'string'
                        ? error.response.data
                        : (error.response.data.message || message);
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao atualizar!',
                    text: message,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                    },
                    buttonsStyling: false
                });
            }
        }
    }
}
</script>

<style scoped></style>
