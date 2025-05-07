<template>
    <div class="flex flex-col justify-center items-center text-center font-sans min-h-screen p-4">
        <div v-if="isLoading">
            <h1 class="text-2xl font-semibold text-gray-800 mb-2">Confirmação de E-mail</h1>
            <p class="text-gray-600">Estamos confirmando seu e-mail...</p>
            <div class="flex justify-center items-center mt-10 h-10">
                <Loader />
            </div>
        </div>

        <div v-else>
            <h1 class="text-2xl font-semibold text-gray-800 mb-2">
                {{ success ? 'Sucesso!' : 'Erro!' }}
            </h1>
            <p class="text-gray-600">{{ message }}</p>
        </div>

        <div class="mt-6">
            <router-link to="/"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors duration-300">
                Ir para Login
            </router-link>
        </div>
    </div>
</template>

<script>
import Loader from "../components/Loader.vue";
import authService from "../services/authService";

export default {
    name: "ConfirmEmailPage",

    components: {
        Loader,
    },

    data() {
        return {
            isLoading: true,
            success: false,
            message: "",
        };
    },

    async created() {
        const token = this.$route.query.token;
        if (!token) {
            this.message = "Token de confirmação ausente.";
            this.isLoading = false;
            return;
        }

        try {
            const response = await authService.confirmEmail(token);
            this.success = true;
            this.message = response || "E-mail confirmado com sucesso!";
        } catch (error) {
            this.success = false;
            this.message =
                error.response?.data || "Erro ao confirmar e-mail.";
        } finally {
            this.isLoading = false;
        }
    },
};
</script>