<template>
    <div class="revenue-page">
        <h1>Gerenciador de Receitas</h1>
        <form @submit.prevent="saveRevenue" class="revenue-form">
            <div>
                <input type="text" v-model="newRevenue.description" placeholder="Nome da receita" required />
            </div>
            <div>
                <input type="number" v-model.number="newRevenue.amount" placeholder="Valor da receita" required />
            </div>
            <button type="submit">Salvar</button>
        </form>

        <ul class="revenue-list">
            <li v-for="(revenue, index) in revenues" :key="revenue.id" class="revenue-item">
                <span>{{ revenue.description }} - R$ {{ revenue.amount.toFixed(2) }}</span>
                <div>
                    <button @click="startEdit(index)">Editar</button>
                    <button @click="deleteRevenue(index)">Deletar</button>
                </div>
            </li>
        </ul>
    </div>

    <div v-if="showEditModal" class="modal-backdrop">
        <div class="modal">
            <h2>Editar Receita</h2>
            <form @submit.prevent="submitEdit">
                <input v-model="editingRevenue.description" placeholder="Nome" required />
                <input v-model.number="editingRevenue.amount" type="number" placeholder="Valor" required />
                <div class="modal-actions">
                    <button type="submit">Salvar</button>
                    <button @click.prevent="closeModal">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import authService from "../services/authService";
import revenueService from "../services/revenueService";

export default {
    name: "RevenuePage",
    data() {
        return {
            newRevenue: {
                description: "",
                amount: null,
                date: new Date().toISOString().split("T")[0],
                userId: null,
            },
            revenues: [],
            editingRevenue: null,
            editingIndex: null,
            isEditing: false,
            showEditModal: false,
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
                const response = await revenueService.getRevenuesByUserId(userId);
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
                await revenueService.createRevenue(revenueData);
                await this.fetchRevenues();
                this.resetForm();
            } catch (error) {
                console.error("Erro ao salvar receita:", error);
            }
        },

        async updateRevenue() {
            try {
                const { id, ...data } = this.editingRevenue;
                await revenueService.updateRevenue(id, data);
                await this.fetchRevenues();
                this.closeModal();
            } catch (error) {
                console.error("Erro ao atualizar receita:", error);
            }
        },

        async deleteRevenue(index) {
            try {
                const id = this.revenues[index]?.id;
                if (!id) {
                    console.warn("ID da receita não encontrado. Abortando exclusão.");
                    return;
                }
                await revenueService.deleteRevenue(id);
                await this.fetchRevenues();
            } catch (error) {
                console.error("Erro ao deletar receita:", error);
            }
        },

        startEdit(index) {
            this.editingIndex = index;
            this.editingRevenue = { ...this.revenues[index] };
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
                date: new Date().toISOString().split("T")[0],
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

<style scoped>
.revenue-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 6em 0em 0em 0em;
    font-family: 'Roboto', sans-serif;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.revenue-page h1 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5em;
}

.revenue-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 15px;
    margin-bottom: 2em;
}

.revenue-form div {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 150px;
}

.revenue-form label {
    font-weight: 500;
    margin-bottom: 8px;
    color: #555;
}

.revenue-form input,
.revenue-form button {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.revenue-form input:focus {
    border-color: #007bff;
    outline: none;
}

.revenue-form button {
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    height: 48px;
    padding: 0 20px;
}

.revenue-form button:hover {
    background-color: #0056b3;
}

.revenue-list {
    list-style: none;
    padding: 0;
}

.revenue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.revenue-item span {
    font-size: 16px;
    color: #333;
}

.revenue-item button {
    padding: 8px 12px;
    font-size: 14px;
    color: #fff;
    background-color: #28a745;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-left: 5px;
}

.revenue-item button:hover {
    background-color: #218838;
}

.revenue-item button:nth-child(2) {
    background-color: #dc3545;
}

.revenue-item button:nth-child(2):hover {
    background-color: #c82333;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background-color: #fff;
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
    font-family: 'Roboto', sans-serif;
}

.modal h2 {
    margin-top: 0;
    margin-bottom: 1em;
    color: #333;
    font-size: 1.5em;
    text-align: center;
}

.modal input,
.modal select {
    width: 100%;
    padding: 10px;
    margin-bottom: 1em;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.modal input:focus,
.modal select:focus {
    border-color: #007bff;
    outline: none;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-actions button {
    padding: 10px 16px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-actions button[type="submit"] {
    background-color: #007bff;
    color: #fff;
}

.modal-actions button[type="submit"]:hover {
    background-color: #0056b3;
}

.modal-actions button:not([type="submit"]) {
    background-color: #6c757d;
    color: #fff;
}

.modal-actions button:not([type="submit"]):hover {
    background-color: #5a6268;
}

@media (max-width: 800px) {
    .revenue-page {
        padding: 7em 1em;
    }

    .revenue-form {
        flex-direction: column;
        gap: 10px;
    }

    .revenue-form button,
    .revenue-item input,
    .revenue-item button,
    .revenue-form div {
        width: 100%;
        margin: 3px 0;
    }

    .modal {
        width: 90%;
        padding: 1.5em;
    }
}
</style>