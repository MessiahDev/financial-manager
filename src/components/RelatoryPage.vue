<template>
  <div class="max-w-5xl mx-auto py-24 font-sans px-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <h1 class="text-center text-3xl font-bold text-gray-800 mb-12">Relatório Financeiro</h1>

      <div class="bg-white p-4 rounded-xl shadow space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label class="text-sm text-gray-600">De:</label>
            <input type="date" v-model="filters.from" class="input" />
          </div>
          <div>
            <label class="text-sm text-gray-600">Até:</label>
            <input type="date" v-model="filters.to" class="input" />
          </div>
          <div>
            <label class="text-sm text-gray-600">Categoria:</label>
            <select v-model="filters.category" class="input h-11">
              <option value="all">Todas</option>
              <option v-for="cat in categories" :key="cat.name" :value="cat.name">
                {{ cat.name }}
              </option>
              <option v-if="hasDebts" value="Dívida">Dívida</option>
              <option v-if="hasRevenues" value="Receita">Receita</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600">Status:</label>
            <select v-model="filters.status" class="input h-11">
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="overdue">Vencidos</option>
              <option value="open">Em aberto</option>
              <option value="gain">Ganho</option>
              <option value="buy">Compra</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600">Buscar:</label>
            <input v-model="filters.search" placeholder="Descrição ou categoria" class="input" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-700">Lançamentos</h2>
          <div class="space-x-2">
            <button @click="download('pdf')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">PDF</button>
            <button @click="download('excel')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Excel</button>
            <button @click="download('docx')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Word</button>
          </div>
        </div>

        <table class="w-full text-sm text-left text-gray-700">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="px-4 py-2">Data</th>
              <th class="px-4 py-2">Descrição</th>
              <th class="px-4 py-2">Categoria</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredTransactions"
              :key="index"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-4 py-2">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</td>
              <td class="px-4 py-2">{{ item.description }}</td>
              <td class="px-4 py-2">{{ item.category }}</td>
              <td class="px-4 py-2">
                <span :class="{
                    'text-green-600': item.status === 'paid',
                    'text-red-500': item.status === 'overdue',
                    'text-yellow-500': item.status === 'open',
                    'text-blue-600': item.status === 'gain',
                    'text-orange-500': item.status === 'buy',
                }">
                    {{ 
                    item.category === 'Dívida' ? (
                        item.status === 'paid' ? 'Pago' : 
                        item.status === 'overdue' ? 'Vencido' : 
                        'Em aberto'
                    ) : item.status === 'paid' ? 'Pago' : 
                    item.status === 'overdue' ? 'Vencido' : 
                    item.status === 'open' ? 'Em aberto' : 
                    item.status === 'gain' ? 'Ganho' : 
                    'Compra' 
                    }}
                </span>
                </td>
              <td class="px-4 py-2 font-medium" :class="item.amount > 0 ? 'text-green-600' : 'text-red-500'">
                {{ item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </td>
            </tr>
            <tr class="font-bold bg-gray-50">
              <td colspan="4" class="px-4 py-2 text-right">Total</td>
              <td class="px-4 py-2 text-blue-700">
                {{ totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';
import userService from '../services/userService';

export default {
  name: 'RelatoryPage',
  data() {
    return {
      userId: null,
      filters: {
        from: '',
        to: '',
        status: 'all',
        search: '',
        category: 'all',
      },
      hasDebts: false,
      hasRevenues: false,
      categories: [],
      user: {
        id: null,
        description: '',
        amount: null,
        date: new Date().toISOString().split('T')[0],
        expenses: [],
        revenues: [],
        debts: [],
      },
    };
  },
  computed: {
    filteredTransactions() {
      const today = new Date();

      const allTransactions = [
        ...this.user.revenues.map(r => ({
          ...r,
          category: r.categoryName || 'Receita',
          status: 'gain',
        })),
        ...this.user.expenses.map(e => ({
          ...e,
          category: e.categoryName || 'Despesa',
          status: 'buy',
          amount: -Math.abs(e.amount),
        })),
        ...this.user.debts.map(d => {
          const dueDate = new Date(d.dueDate);
          let status = 'paid';
          if (!d.isPaid) {
            status = dueDate < today ? 'overdue' : 'open';
          }
          return {
            ...d,
            date: d.dueDate,
            category: d.categoryName || 'Dívida',
            status,
            amount: -Math.abs(d.amount),
          };
        }),
      ];

      return allTransactions.filter((t) => {
        const inDateRange =
          (!this.filters.from || new Date(t.date) >= new Date(this.filters.from)) &&
          (!this.filters.to || new Date(t.date) <= new Date(this.filters.to));

        const inStatus =
          this.filters.status === 'all' || t.status === this.filters.status;

        const matchesSearch =
          t.description.toLowerCase().includes(this.filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(this.filters.search.toLowerCase());

        const matchesCategory =
          this.filters.category === 'all' || t.category === this.filters.category;

        return inDateRange && inStatus && matchesSearch && matchesCategory;
      });
    },
    totalAmount() {
      return this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    },
  },
  async mounted() {
    try {
      this.userId = await this.fetchUserId();
      if (this.userId) {
        await this.fetchReportData();
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
        console.error("Erro ao obter perfil do usuário:", error);
        return null;
      }
    },
    async fetchReportData() {
      try {
        const userWithDetails = await userService.getUserByIdAllIncludes(this.userId);
        this.user.revenues = userWithDetails.revenues;
        this.user.expenses = userWithDetails.expenses;
        this.user.debts = userWithDetails.debts;
        this.categories = userWithDetails.categories;
        this.hasDebts = userWithDetails.debts.length > 0;
        this.hasRevenues = userWithDetails.revenues.length > 0;
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
      }
    },
    download(format) {
      alert(`Exportação ${format.toUpperCase()} ainda não implementada.`);
    },
  },
};
</script>
