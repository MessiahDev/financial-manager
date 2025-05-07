<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-8">Gerenciador de Receitas</h1>
        <form @submit.prevent="saveRevenue"
            class="flex flex-wrap sm:flex-nowrap items-center justify-center items-end gap-4 mb-8">
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="newRevenue.description" placeholder="Nome da receita" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="number" v-model.number="newRevenue.amount" placeholder="Valor da receita" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" :disabled="isLoading"
                class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                Salvar
            </button>
        </form>

        <ul class="list-none p-0">
            <li v-for="(revenue, index) in revenues" :key="revenue.id"
                class="flex justify-between items-center mb-2 p-1 bg-white hover:bg-zinc-200 transition-colors border border-gray-300 rounded-lg shadow-md">
                <span class="px-3 text-gray-600 text-sm">{{ revenue.description }} - {{
                    Number(revenue.amount.toFixed(2)).toMoeda(true) }}</span>
                <div class="flex items-center">
                    <button @click="startEdit(index)"
                        class="px-3 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors text-sm">
                        Editar
                    </button>
                    <button @click="deleteRevenue(index)"
                        class="px-3 py-2 ml-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors text-sm">
                        Deletar
                    </button>
                </div>
            </li>
        </ul>
    </div>

    <div class="flex justify-center items-center mt-10 h-10">
        <Loader v-if="isLoading" />
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 class="text-center text-xl font-semibold text-gray-800 mb-4">Editar Dívida</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="editingRevenue.description" placeholder="Título" required
                    class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                <input type="number" v-model="editingRevenue.amount" placeholder="Valor" required
                    class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                <div class="flex flex-col sm:flex-row justify-end gap-2">
                    <button type="submit"
                        class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Salvar</button>
                    <button @click.prevent="closeModal"
                        class="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-md">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import authService from "../services/authService";
import revenueService from "../services/revenueService";
import Loader from "../components/Loader.vue";
import Swal from "sweetalert2";

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
            await this.fetchRevenues();
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
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando busca de receitas.");
                    return;
                }
                this.isLoading = true;
                const response = await revenueService.getRevenuesByUserId(userId);
                this.isLoading = false;
                this.revenues = response || [];
            } catch (error) {
                console.error("Erro ao buscar receitas:", error);
            }
        },

        async saveRevenue() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando salvamento de receita.");
                    return;
                }

                const revenueData = { ...this.newRevenue, userId };
                this.isLoading = true;
                await revenueService.createRevenue(revenueData);
                await this.fetchRevenues();
                this.resetForm();
            } catch (error) {
                console.error("Erro ao salvar receita:", error);
            }
        },

        async updateRevenue() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) {
                    console.warn("ID do usuário não encontrado. Abortando atualização de receita.");
                    return;
                }

                const { id, ...rest } = this.editingRevenue;

                if (!id) {
                    console.warn("ID da receita não encontrado.");
                    return;
                }

                const updatedData = { ...rest, userId };
                await revenueService.updateRevenue(id, updatedData);
                await this.fetchRevenues();
                this.closeModal();
                await Swal.fire("Sucesso!", "A receita foi atualizada.", "success");
            } catch (error) {
                console.error("Erro ao atualizar receita:", error);
                await Swal.fire("Erro", "Ocorreu um erro ao tentar atualizar a receita.", "error");
            }
        },

        async deleteRevenue(index) {
            const id = this.revenues[index]?.id;
            if (!id) {
                console.warn("ID da receita não encontrado. Abortando exclusão.");
                return;
            }

            const result = await Swal.fire({
                title: "Tem certeza?",
                text: "Essa receita será deletada e não poderá ser recuperada!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim, deletar!",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded',
                    cancelButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded ml-2'
                },
                buttonsStyling: false,
            });

            if (result.isConfirmed) {
                try {
                    await revenueService.deleteRevenue(id);
                    await this.fetchRevenues();

                    await Swal.fire({
                        icon: 'success',
                        title: 'Deletado!',
                        text: 'A receita foi removida com sucesso.',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
                        },
                        buttonsStyling: false
                    });
                } catch (error) {
                    console.error('Erro ao deletar receita:', error);

                    let message = 'Ocorreu um erro ao tentar deletar a receita. Tente novamente mais tarde.';

                    if (error.response && error.response.data) {
                        message =
                            typeof error.response.data === 'string'
                                ? error.response.data
                                : error.response.data.message || message;
                    }

                    await Swal.fire({
                        icon: 'error',
                        title: 'Erro ao deletar receita!',
                        text: message,
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded'
                        },
                        buttonsStyling: false
                    });
                }
            }
        },

        startEdit(index) {
            this.editingIndex = index;
            this.editingRevenue = {
                ...this.revenues[index],
                amount: Number(this.revenues[index].amount).toFixed(2)
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