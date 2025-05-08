<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-12">
        Gerenciador de Receitas
        </h1>
        
        <form
        @submit.prevent="saveRevenue"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-12"
        >
        <input
            v-model="newRevenue.description"
            type="text"
            placeholder="Descrição da receita"
            required
            class="input"
            aria-label="Descrição da receita"
        />
        <input
            v-model="newRevenue.amount"
            type="number"
            placeholder="Valor"
            required
            class="input"
            aria-label="Valor da receita"
        />
        <div class="col-span-full flex justify-end">
            <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary"
            >
            <i class="fa-regular fa-floppy-disk mr-1"></i>
            Salvar
            </button>
        </div>
        </form>

        <ul class="space-y-2">
        <li
            v-for="(revenue, index) in revenues"
            :key="revenue.id"
            class="flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-zinc-100"
        >
            <span class="text-sm text-gray-700">
            <strong>{{ revenue.description }}</strong> - 
            {{ Number(revenue.amount).toMoeda(true) }}
            </span>
            <div class="flex gap-2">
            <button @click="startEdit(index)" class="btn-green">
                <i class="fa-regular fa-pen-to-square mr-1"></i>
                Editar
            </button>
            <button @click="deleteRevenue(index)" class="btn-red">
                <i class="fa-regular fa-trash-can mr-1"></i>
                Deletar
            </button>
            </div>
        </li>
        </ul>

        <div class="flex justify-center items-center mt-10 h-10">
            <Loader v-if="isLoading" />
        </div>

        <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 class="text-center text-xl font-semibold text-gray-800 mb-4">
            Editar Receita
            </h2>
            <form @submit.prevent="submitEdit">
            <input v-model="editingRevenue.description" placeholder="Título" required class="input mb-4" />
            <input v-model="editingRevenue.amount" type="number" placeholder="Valor" required class="input mb-4" />
            <div class="flex flex-col sm:flex-row justify-end gap-2">
                <button type="submit" class="btn-primary">Salvar</button>
                <button @click.prevent="closeModal" class="btn-secondary">Cancelar</button>
            </div>
            </form>
        </div>
        </div>
    </div>
</template>

<script>
import Loader from "../components/Loader.vue";
import authService from "../services/authService";
import revenueService from "../services/revenueService";
import { showConfirm, showError, showSuccess } from "../services/alertService";

export default {
    name: "RevenuePage",

    components: {
        Loader,
    },

    data() {
        return {
            newRevenue: {
                description: "",
                amount: null,
                date: new Date(),
                userId: null,
            },
            userId: null,
            revenues: [],
            editingRevenue: null,
            editingIndex: null,
            isEditing: false,
            showEditModal: false,
            isLoading: false,
        };
    },

    async mounted() {
        try {
            this.userId = await this.fetchUserId();
            if (this.userId) {
                this.newRevenue.userId = this.userId;
                await this.fetchRevenues();
            }
        } catch (error) {
            console.error("Erro ao montar o componente:", error);
        }
    },

    methods: {
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
                console.error("Erro ao buscar perfil do usuário:", error);
                return null;
            }
        },

        async fetchRevenues() {
            try {
                if (!this.userId) return;
                this.isLoading = true;
                const response = await revenueService.getRevenuesByUserId(this.userId);
                this.isLoading = false;
                this.revenues = response || [];
            } catch (error) {
                console.error("Erro ao buscar receitas:", error);
            }
        },

        async saveRevenue() {
            try {
                const revenueData = { ...this.newRevenue };
                this.isLoading = true;
                await revenueService.createRevenue(revenueData);
                await this.fetchRevenues();
                this.resetForm();
            } catch (error) {
                this.isLoading = false
                await showError('Erro ao salvar receita:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async updateRevenue() {
            try {
                const { id, ...data } = this.editingRevenue;

                if (!id) {
                    console.warn("ID da receita não encontrado.");
                    return;
                }

                await revenueService.updateRevenue(id, data);
                await this.fetchRevenues();
                this.closeModal();
                await showSuccess('Sucesso!', 'A receita foi atualizada.');
            } catch (error) {
                await showError('Erro ao atualizar receita:', error);
            }
        },

        async deleteRevenue(index) {
            const id = this.revenues[index]?.id;
            if (!id) {
                console.warn("ID da receita não encontrado. Abortando exclusão.");
                return;
            }

            const result = await showConfirm();

            if (result.isConfirmed) {
                try {
                    await revenueService.deleteRevenue(id);
                    await this.fetchRevenues();
                    await showSuccess('Sucesso!', 'A receita foi removida.');
                } catch (error) {
                    await showError('Erro ao deletar receita:', error);
                }
            }
        },

        startEdit(index) {
            this.editingIndex = index;
            this.editingRevenue = {
                ...this.revenues[index],
                amount: Number(this.revenues[index].amount).toFixed(2),
                userId: this.userId, 
            };
            this.isEditing = true;
            this.showEditModal = true;
        },

        submitEdit() {
            this.updateRevenue();
        },

        resetForm() {
            this.newRevenue = {
                description: "",
                amount: 0,
                date: new Date(),
            };
        },

        closeModal() {
            this.showEditModal = false;
            this.isEditing = false;
            this.editingIndex = null;
            this.editingRevenue = null;
        },
    },
};
</script>

<style scoped></style>