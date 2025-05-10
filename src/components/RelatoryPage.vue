<template>
  <div class="max-w-7xl mx-auto mt-12 pt-12 px-4 sm:px-6 lg:px-8 font-sans">
    <h1 class="text-center text-3xl font-bold text-gray-800 mb-2">Relatório Financeiro</h1>

    <div class="p-4 sm:p-6 rounded-xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">De:</label>
          <input type="date" v-model="filters.from" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Até:</label>
          <input type="date" v-model="filters.to" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Categoria:</label>
          <select v-model="filters.category" class="input w-full h-11">
            <option value="all">Todas</option>
            <option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.name }}</option>
            <option v-if="hasDebts" value="Dívida">Dívida</option>
            <option v-if="hasRevenues" value="Receita">Receita</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Status:</label>
          <select v-model="filters.status" class="input w-full h-11">
            <option value="all">Todos</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Vencidos</option>
            <option value="open">Em aberto</option>
            <option value="gain">Ganho</option>
            <option value="buy">Compra</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Buscar:</label>
          <input v-model="filters.search" placeholder="Descrição ou categoria" class="input w-full" />
        </div>
      </div>
    </div>
  </div>

  <div class="bg-gray-200 w-full min-h-screen border border-t-gray-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow p-4 mt-10 sm:p-6 overflow-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 class="text-lg font-semibold text-gray-700">Lançamentos</h2>
          <div class="flex flex-wrap gap-2 text-gray-700" title="Planilha">
            <span class="flex items-center font-semibold">Baixar</span>
            <button @click="download('excel')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"><i class="fa-solid fa-download"></i></button>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="px-4 py-2 whitespace-nowrap">Data</th>
                <th class="px-4 py-2 whitespace-nowrap">Descrição</th>
                <th class="px-4 py-2 whitespace-nowrap">Categoria</th>
                <th class="px-4 py-2 whitespace-nowrap">Status</th>
                <th class="px-4 py-2 whitespace-nowrap">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredTransactions" :key="index" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-2">{{ new Date(item.date).toLocaleDateString('pt-BR') }}</td>
                <td class="px-4 py-2">{{ item.description }}</td>
                <td class="px-4 py-2">{{ item.category }}</td>
                <td class="px-4 py-2">
                  <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-200 text-green-700': item.status === 'paid',
                    'bg-red-200 text-red-700': item.status === 'overdue',
                    'bg-yellow-200 text-yellow-700': item.status === 'open',
                    'bg-blue-200 text-blue-700': item.status === 'gain',
                    'bg-orange-200 text-orange-700': item.status === 'buy'
                  }"
                >
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
  </div>

  <!-- Tabela oculta para exportação em Excel -->
  <table id="exportTable" v-show="showExport" style="position:absolute; left:-9999px;">
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Status</th>
        <th>Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(t, i) in filteredTransactions" :key="'export-' + i">
        <td>{{ new Date(t.date).toLocaleDateString('pt-BR') }}</td>
        <td>{{ t.description }}</td>
        <td>{{ t.category }}</td>
        <td>
          {{
            t.category === 'Dívida'
              ? t.status === 'paid' ? 'Pago' :
                t.status === 'overdue' ? 'Vencido' : 'Em aberto'
              : t.status === 'paid' ? 'Pago' :
                t.status === 'overdue' ? 'Vencido' :
                t.status === 'open' ? 'Em aberto' :
                t.status === 'gain' ? 'Ganho' : 'Compra'
          }}
        </td>
        <td :style="{ color: t.amount < 0 ? 'red' : 'green', textAlign: 'right' }">
          R$ {{ t.amount.toFixed(2) }}
        </td>
      </tr>

      <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">Total</td>
        <td :style="{ color: totalAmount < 0 ? 'red' : 'blue' }">
          R$ {{ totalAmount.toFixed(2) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import authService from '../services/authService';
import userService from '../services/userService';
import { TableToExcel } from '../assets/scripts/helper';

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
      showExport: false,
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
      if (format === 'excel') {
        this.showExport = true;
        this.$nextTick(() => {
          TableToExcel('exportTable', 'Relatorio');
          this.showExport = false;
        });
      } else if (format === 'csv') {
        JSONToCSVConvertor(this.filteredTransactions, 'Relatório Financeiro', true);
      } else {
        alert(`Formato ${format.toUpperCase()} não suportado.`);
      }
    }
  },
};
</script>