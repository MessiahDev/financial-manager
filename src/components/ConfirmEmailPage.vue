<template>
    <div class="text-center">
        <div v-if="isLoading">
            <h1>Confirmação de E-mail</h1>
            <p>Estamos confirmando seu e-mail...</p>
            <div class="loader-container">
                <Loader />
            </div>
        </div>
        <div v-else>
            <h1>{{ success ? 'Sucesso!' : 'Erro!' }}</h1>
            <p>{{ message }}</p>
        </div>
        <div class="btn-container">
            <router-link to="/" class="btn-primary">Ir para Login</router-link>
        </div>
    </div>
</template>

<script>
import authService from "../services/authService";
import Loader from '../components/Loader.vue';

export default {
    name: 'ConfirmEmailPage',

    components: {
        Loader
    },

    data() {
        return {
            isLoading: true,
            success: false,
            message: '',
        }
    },

    async created() {
        const token = this.$route.query.token;
        if (!token) {
            this.message = 'Token de confirmação ausente.';
            this.isLoading = false;
            return;
        }

        try {
            const response = await authService.confirmEmail(token);
            this.success = true;
            this.message = response || 'E-mail confirmado com sucesso!';
        } catch (error) {
            this.success = false;
            if (error.response && error.response.data) {
                this.message = error.response.data;
            } else {
                this.message = 'Erro ao confirmar e-mail.';
            }
        } finally {
            this.isLoading = false;
        }
    }
}
</script>

<style scoped>
.text-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100vh;
    padding: 1rem;
}

.btn-container {
    margin-top: 20px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    height: 40px;
}
</style>
