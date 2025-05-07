<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-8">Gerenciador de Dívidas</h1>

        <form @submit.prevent="saveDebt"
            class="flex flex-wrap sm:flex-nowrap items-center justify-center items-end gap-4 mb-8">
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="newDebt.description" placeholder="Título da dívida" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="number" v-model="newDebt.amount" placeholder="Valor" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="newDebt.dueDate" v-mask="'##/##/####'" placeholder="Data de vencimento"
                    required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md text-right text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex flex-col flex-1 min-w-[150px]">
                <input type="text" v-model="newDebt.creditor" placeholder="Credora" required
                    class="px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex items-center justify-center text-gray-600">
                <label class="flex items-center font-medium gap-2">
                    <input type="checkbox" v-model="newDebt.isPaid" class="scale-125 accent-blue-600" />
                    Quitada?
                </label>
            </div>
            <button type="submit" :disabled="isLoading"
                class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                Salvar
            </button>
        </form>

        <ul class="list-none p-0">
            <li v-for="(debt, index) in debts" :key="debt.id"
                class="flex justify-between items-center mb-2 p-1 bg-white hover:bg-zinc-200 transition-colors border border-gray-300 rounded-lg shadow-md">
                <span class="px-3 text-gray-600 text-sm">
                    {{ debt.description }} - {{ Number(debt.amount).toMoeda(true) }} - Vence em:
                    {{ new Date(debt.dueDate).toLocaleDateString() }} - Credora: {{ debt.creditor }} - Situação:
                    <strong :class="debt.isPaid ? 'text-green-600' : 'text-red-600'">
                        {{ debt.isPaid ? 'Quitada' : 'Em aberto' }}
                    </strong>
                </span>
                <div class="flex items-center">
                    <button @click="startEdit(index)"
                        class="px-3 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors text-sm">
                        Editar
                    </button>
                    <button @click="deleteDebt(index)"
                        class="px-3 py-2 ml-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors text-sm">
                        Deletar
                    </button>
                </div>
            </li>
        </ul>

        <div class="flex justify-center items-center mt-10 h-10">
            <Loader v-if="isLoading" />
        </div>

        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
                <h2 class="text-center text-xl font-semibold text-gray-800 mb-4">Editar Dívida</h2>
                <form @submit.prevent="submitEdit">
                    <input v-model="editingDebt.description" placeholder="Título" required
                        class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                    <input type="number" v-model="editingDebt.amount" placeholder="Valor" required
                        class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                    <input type="text" v-model="editingDebt.dueDate" v-mask="'##/##/####'"
                        placeholder="Data de vencimento" required
                        class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md text-right" />
                    <input type="text" v-model="editingDebt.creditor" placeholder="Credora" required
                        class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md" />
                    <label class="flex items-center gap-2 text-gray-600 mb-4 px-1">
                        <input type="checkbox" v-model="editingDebt.isPaid" class="scale-125 accent-blue-600" />
                        Quitada?
                    </label>
                    <div class="flex flex-col sm:flex-row justify-end gap-2">
                        <button type="submit"
                            class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Salvar</button>
                        <button @click.prevent="closeModal"
                            class="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-md">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import authService from "../services/authService";
import debtService from "../services/debtService";
import Loader from "../components/Loader.vue";
import Swal from 'sweetalert2';

export default {
    name: "DebtPage",

    components: {
        Loader,
    },

    data() {
        return {
            newDebt: {
                description: '',
                amount: null,
                dueDate: '',
                creditor: '',
                isPaid: false,
                userId: null,
            },
            debts: [],
            editingDebt: null,
            editingIndex: null,
            isEditing: false,
            showEditModal: false,
            isLoading: false,
        };
    },

    async mounted() {
        try {
            await this.fetchDebts();
        } catch (error) {
            console.error("Erro ao montar o componente:", error);
        }
    },

    methods: {
        async fetchUserId() {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return null;
            try {
                const user = await authService.getProfile();
                return user.id;
            } catch (error) {
                console.error("Erro ao obter perfil do usuário:", error);
                return null;
            }
        },

        async fetchDebts() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) return;
                this.isLoading = true;
                const response = await debtService.getDebtsByUserId(userId);
                this.debts = response || [];
                this.isLoading = false;
            } catch (error) {
                console.error("Erro ao buscar dívidas:", error);
            }
        },

        async saveDebt() {
            try {
                const userId = await this.fetchUserId();
                if (!userId) return;
                const [day, month, year] = this.newDebt.dueDate.split('/');
                const isoDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                const debtData = { ...this.newDebt, userId, dueDate: isoDate.toISOString() };
                this.isLoading = true;
                await debtService.createDebt(debtData);
                await this.fetchDebts();
                this.resetForm();
            } catch (error) {
                console.error("Erro ao salvar dívida:", error);
            }
        },

        async updateDebt(updatedDebt) {
            try {
                const { id, ...data } = updatedDebt;
                await debtService.updateDebt(id, data);
                await this.fetchDebts();
                this.closeModal();
                Swal.fire("Sucesso!", "A dívida foi atualizada.", "success");
            } catch (error) {
                console.error("Erro ao atualizar dívida:", error);
                Swal.fire("Erro", "Ocorreu um erro ao tentar atualizar a dívida.", "error");
            }
        },

        async deleteDebt(index) {
            const id = this.debts[index]?.id;
            if (!id) return;

            const result = await Swal.fire({
                title: "Tem certeza?",
                text: "Essa dívida será deletada!",
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
                    await debtService.deleteDebt(id);
                    await this.fetchDebts();
                    Swal.fire("Deletado!", "A dívida foi removida com sucesso.", "success");
                } catch (error) {
                    console.error("Erro ao deletar dívida:", error);
                    Swal.fire("Erro", "Ocorreu um erro ao tentar deletar a dívida.", "error");
                }
            }
        },

        startEdit(index) {
            const debt = this.debts[index];

            const date = new Date(debt.dueDate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');

            this.editingDebt = {
                ...debt,
                amount: Number(debt.amount).toFixed(2),
                dueDate: `${dd}-${mm}-${yyyy}`,
            };
            this.editingIndex = index;
            this.showEditModal = true;
        },

        submitEdit() {
            const [day, month, year] = this.editingDebt.dueDate.split('/');
            const isoDate = new Date(year, month - 1, day, 0, 0, 0, 0);

            const updatedDebt = {
                ...this.editingDebt,
                isPaid: !!this.editingDebt.isPaid,
                dueDate: isoDate.toISOString(),
            };

            this.updateDebt(updatedDebt);
        },

        resetForm() {
            this.newDebt = {
                description: '',
                amount: null,
                dueDate: '',
                creditor: '',
                isPaid: false,
                userId: null,
            };
        },

        closeModal() {
            this.showEditModal = false;
            this.editingDebt = null;
            this.editingIndex = null;
        },
    },
};
</script>

<style scoped></style>
