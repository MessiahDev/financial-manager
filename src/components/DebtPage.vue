<template>
    <div class="max-w-5xl mx-auto py-24 font-sans px-4">
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-12">
        Gerenciador de Dívidas
        </h1>

        <form
        @submit.prevent="saveDebt"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
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
            v-model="newDebt.amount"
            type="number"
            placeholder="Valor"
            required
            class="input"
            aria-label="Valor da dívida"
        />
        <input
            v-model="newDebt.dueDate"
            type="text"
            v-mask="'##/##/####'"
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
        <label class="flex items-center gap-2 text-gray-700 col-span-full">
            <input type="checkbox" v-model="newDebt.isPaid" class="scale-125 accent-blue-600" />
            Dívida já foi quitada?
        </label>
        <div class="col-span-full flex justify-end">
            <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary"
            >
            Salvar
            </button>
        </div>
        </form>

        <ul class="space-y-2">
        <li
            v-for="(debt, index) in debts"
            :key="debt.id"
            class="flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-zinc-100"
        >
            <span class="text-sm text-gray-700">
            <strong>{{ debt.description }}</strong> - 
            {{ Number(debt.amount).toMoeda(true) }} - 
            Vence em {{ new Date(debt.dueDate).toLocaleDateString() }} - 
            Credora: {{ debt.creditor }} - 
            <span :class="debt.isPaid ? 'text-green-600' : 'text-red-600'">
                <strong>{{ debt.isPaid ? 'Quitada' : 'Em aberto' }}</strong>
            </span>
            </span>
            <div class="flex gap-2">
            <button @click="startEdit(index)" class="btn-green">Editar</button>
            <button @click="deleteDebt(index)" class="btn-red">Deletar</button>
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
            Editar Dívida
            </h2>
            <form @submit.prevent="submitEdit">
            <input v-model="editingDebt.description" placeholder="Título" required class="input mb-4" />
            <input v-model="editingDebt.amount" type="number" placeholder="Valor" required class="input mb-4" />
            <input v-model="editingDebt.dueDate" type="text" v-mask="'##/##/####'" placeholder="Data de vencimento" required class="input text-right mb-4" />
            <input v-model="editingDebt.creditor" placeholder="Credora" required class="input mb-4" />
            <label class="flex items-center gap-2 text-gray-600 mb-4">
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
                dueDate: '',
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
        };
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
                const [day, month, year] = this.newDebt.dueDate.split('/');
                const isoDate = new Date(year, month - 1, day);
                const debtData = { ...this.newDebt, userId: this.userId, dueDate: isoDate.toISOString() };
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
            const isoDate = new Date(year, month - 1, day);

            const updatedDebt = {
                ...this.editingDebt,
                userId: this.userId,
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
