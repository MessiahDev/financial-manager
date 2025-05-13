<template>
    <div class="font-sans bg-stone-250 min-h-screen mb-12 flex flex-col">
        <div class="w-full mx-auto pt-24 pb-8 px-4">
            <div class="max-w-5xl mx-auto px-4">
                <h1 class="text-center text-3xl font-bold mb-12"
                    :class="isDark ? 'text-gray-100' : 'text-gray-800'">
                    Gerenciador de Dívidas
                </h1>

                <form 
                    @submit.prevent="saveDebt" 
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <input
                        v-model="newDebt.description"
                        type="text"
                        placeholder="Título da dívida"
                        required
                        class="input"
                        aria-label="Título da dívida"
                    />
                    <input
                        v-model="formattedAmount"
                        type="text"
                        placeholder="Valor"
                        required
                        class="input text-right"
                        aria-label="Valor da dívida"
                    />
                    <input
                        v-model="newDebt.dueDate"
                        type="date"
                        placeholder="Data de vencimento"
                        required
                        class="input text-right"
                        aria-label="Data de vencimento"
                    />
                    <input
                        v-model="newDebt.creditor"
                        type="text"
                        placeholder="Credora"
                        required
                        class="input"
                        aria-label="Credora"
                    />
                    <label class="flex items-center gap-2 col-span-full" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
                        <input type="checkbox" v-model="newDebt.isPaid" class="scale-125 accent-blue-600" />
                        Dívida já foi quitada?
                    </label>
                    <div class="col-span-full flex justify-end">
                        <button type="submit" :disabled="isLoading" class="btn-primary">
                            <i class="fa-regular fa-floppy-disk mr-1"></i>
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="w-full border-t" :class="isDark ? 'border-gray-700' : 'border-gray-300'"></div>

        <div class="w-full flex-1" :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
            <div class="max-w-5xl mx-auto px-4 py-10">
                <ul class="space-y-4">
                <li
                    v-for="(debt, index) in debts"
                    :key="debt.id"
                    class="p-4 border border-gray-300 rounded-xl shadow transition hover:shadow-md"
                    :class="isDark ? 'bg-gray-800' : 'bg-white'"
                >
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                        <p class="text-lg font-semibold mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ debt.description }}</p>
                        <p class="text-sm" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
                        Valor: {{ Number(debt.amount).toMoeda(true) }} |
                        Vencimento: {{ debt.dueDate.toDateDDMMYYYY() }} |
                        Credora: {{ debt.creditor }}
                        </p>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span
                        :class="[
                            'px-3 py-1 text-sm rounded-full font-medium',
                            debt.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        ]"
                        >
                        {{ debt.isPaid ? 'Quitada' : 'Em aberto' }}
                        </span>
                        <div class="flex gap-2 mt-1 sm:mt-0">
                        <button @click="startEdit(index)" class="btn-green">
                            <i class="fa-regular fa-pen-to-square mr-1"></i>
                            Editar
                        </button>
                        <button @click="deleteDebt(index)" class="btn-red">
                            <i class="fa-regular fa-trash-can mr-1"></i>
                            Deletar
                        </button>
                        </div>
                    </div>
                    </div>
                </li>
                </ul>
            </div>
            <div class="flex justify-center items-center mt-8 h-10">
                <Loader v-if="isLoading" />
            </div>
        </div>

        <div
            v-if="showEditModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
            <div class="p-8 rounded-lg shadow-lg w-full max-w-md mx-4"
                :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                <h2 class="text-center text-xl font-semibold mb-4"
                    :class="isDark ? 'text-gray-100' : 'text-gray-600'">
                    Editar Dívida
                </h2>
                <form @submit.prevent="submitEdit">
                    <input v-model="editingDebt.description" placeholder="Título" required class="input mb-4" />
                    <input v-model="formattedEditAmount" type="text" placeholder="Valor" class="input text-right mb-4" />
                    <input v-model="editingDebt.dueDate" type="date" placeholder="Data de vencimento" required class="input text-right mb-4" />
                    <input v-model="editingDebt.creditor" placeholder="Credora" required class="input mb-4" />
                    <label class="flex items-center gap-2 mb-4" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
                        <input type="checkbox" v-model="editingDebt.isPaid" class="scale-125 accent-blue-600" />
                        Dívida já foi quitada?
                    </label>
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
import debtService from "../services/debtService";
import { useThemeStore } from '../stores/themeStore';
import { showSuccess, showError, showConfirm } from "../services/alertService";

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
                dueDate: new Date().toISOString().split('T')[0],
                creditor: '',
                isPaid: false,
                userId: null,
            },
            userId: null,
            debts: [],
            editingDebt: null,
            editingIndex: null,
            isEditing: false,
            showEditModal: false,
            isLoading: false,
            formattedAmount: '',
            formattedEditAmount: '',
            themeStore: useThemeStore(),
        };
    },
    computed: {
      isDark() {
        return this.themeStore.theme === 'dark';
      },
    },
    watch: {
        formattedAmount(newVal) {
            const cleaned = newVal.replace(/\D/g, '');
            const number = parseFloat(cleaned) / 100;

            this.newDebt.amount = isNaN(number) ? 0 : number;
            this.formattedAmount = this.newDebt.amount.toMoeda(true);
        },
        formattedEditAmount(newVal) {
            const cleaned = newVal.replace(/\D/g, '');
            const number = parseFloat(cleaned) / 100;

            this.editingDebt.amount = isNaN(number) ? 0 : number;
            this.formattedEditAmount = this.editingDebt.amount.toMoeda(true);
        }
    },
    async mounted() {
        try {
            this.userId = await this.fetchUserId();
            if (this.userId) {
                await this.fetchDebts();
            }
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
                if (!this.userId) return;
                this.isLoading = true;
                const response = await debtService.getDebtsByUserId(this.userId);
                this.debts = response || [];
                this.isLoading = false;
            } catch (error) {
                console.error("Erro ao buscar dívidas:", error);
            }
        },

        async saveDebt() {
            try {
                if (!this.userId) return;
                const debtData = { ...this.newDebt, userId: this.userId, dueDate: new Date(this.newDebt.dueDate).toISOString()};
                this.isLoading = true;
                await debtService.createDebt(debtData);
                await this.fetchDebts();
                this.resetForm();
            } catch (error) {
                await showError('Erro ao salvar dívida:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async updateDebt(updatedDebt) {
            try {
                const { id, ...data } = updatedDebt;
                await debtService.updateDebt(id, data);
                await this.fetchDebts();
                this.closeModal();
                await showSuccess('Sucesso!', 'A dívida foi atualizada.');
            } catch (error) {
                console.error('Erro ao atualizar dívida:', error);
                await showError('Erro ao atualizar!', error);
            }
        },

        async deleteDebt(index) {
            const id = this.debts[index]?.id;
            if (!id) return;

            const result = await showConfirm();

            if (result.isConfirmed) {
                try {
                    await debtService.deleteDebt(id);
                    await this.fetchDebts();
                    await showSuccess('Deletado!', 'A dívida foi removida com sucesso.');
                } catch (error) {
                    await showError('Erro ao deletar!', error);
                }
            }
        },

        startEdit(index) {
            const debt = this.debts[index];
            const date = new Date(debt.dueDate).toISOString().split('T')[0];

            this.editingDebt = {
                ...debt,
                amount: Number(debt.amount).toFixed(2),
                dueDate: date,
            };
            this.formattedEditAmount = Number(debt.amount).toMoeda(true);

            this.editingIndex = index;
            this.showEditModal = true;
        },

        submitEdit() {
            const updatedDebt = {
                ...this.editingDebt,
                userId: this.userId,
                isPaid: !!this.editingDebt.isPaid,
                dueDate: new Date(this.editingDebt.dueDate).toISOString(),
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
