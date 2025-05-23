<template>
  <div class="min-h-screen flex flex-col">
    <div class="max-w-7xl mx-auto mt-12 pt-12 px-4 sm:px-6 lg:px-8 font-sans">
      <h1 class="text-center text-3xl font-bold mb-2"
          :class="isDark ? 'text-gray-100' : 'text-gray-800'"
        >
        Relatório Financeiro
      </h1>

      <div class="p-4 mb-3 sm:p-6 rounded-xl">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-600'">De:</label>
            <input type="date" v-model="filters.from" class="input w-full text-gray-600" />
          </div>
          <div>
            <label class="block text-sm mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-600'">Até:</label>
            <input type="date" v-model="filters.to" class="input w-full text-gray-600" />
          </div>
          <div>
            <label class="block text-sm mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-600'">Categoria:</label>
            <select v-model="filters.category" class="input w-full h-11 text-gray-600">
            <option value="all">Todas</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          </div>
          <div>
            <label class="block text-sm mb-1"
            :class="isDark ? 'text-gray-100' : 'text-gray-600'"
            >Status:</label>
            <select v-model="filters.status" class="input w-full h-11 text-gray-600">
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="overdue">Vencidos</option>
              <option value="open">Em aberto</option>
              <option value="gain">Ganho</option>
              <option value="buy">Compra</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1" :class="isDark ? 'text-gray-100' : 'text-gray-600'">Buscar:</label>
            <input v-model="filters.search" placeholder="Descrição ou categoria" class="input w-full" />
          </div>
        </div>
      </div>
    </div>

    <div class="w-full border-t" :class="isDark ? 'border-gray-700' : 'border-gray-300'"></div>

    <div class="w-full flex-1 py-10 mb-12 border-t-gray-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-xl shadow p-4 sm:p-6 overflow-auto" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 class="text-lg font-semibold"
                :class="isDark ? 'text-gray-100' : 'text-gray-600'">
              Lançamentos
            </h2>
            <div class="flex flex-wrap gap-2" :class="isDark ? 'text-gray-100' : 'text-gray-600'" title="Planilha">
              <span class="flex items-center font-semibold">Baixar</span>
              <button @click="download('excel')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"><i class="fa-solid fa-download"></i></button>
            </div>
          </div>

          <div class="w-full overflow-x-auto" >
            <table class="min-w-full text-sm text-left" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
              <thead>
                <tr class="border-b border-gray-200" :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
                  <th class="px-4 py-2 whitespace-nowrap">Data</th>
                  <th class="px-4 py-2 whitespace-nowrap">Descrição</th>
                  <th class="px-4 py-2 whitespace-nowrap">Categoria</th>
                  <th class="px-4 py-2 whitespace-nowrap">Status</th>
                  <th class="px-4 py-2 whitespace-nowrap">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredTransactions" :key="index" class="border-b border-gray-100" 
                    :class="isDark ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'">
                  <td class="px-4 py-2">{{ item.date.toDateDDMMYYYY() }}</td>
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
                  <td class="px-4 py-2 font-medium" :class="(item.amount > 0 ? 'text-green-600' : 'text-red-500')"> 
                    {{ item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                  </td>
                </tr>
                <tr class="font-bold" :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
                  <td colspan="4" class="px-4 py-2 text-right" :class="isDark ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'">Total</td>
                  <td class="px-4 py-2" :class="totalAmount > 0 ? 'text-blue-700' : 'text-red-700'">
                    {{ totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
import { useThemeStore } from '../stores/themeStore';
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
      themeStore: useThemeStore(),
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
    isDark() {
      return this.themeStore.isDark;
    },

    allTransactions() {
      const today = new Date();

      const revenues = this.user.revenues.map(r => ({
        ...r,
        category: r.categoryName || 'Receita',
        status: 'gain',
      }));

      const expenses = this.user.expenses.map(e => ({
        ...e,
        category: e.categoryName || 'Despesa',
        status: 'buy',
        amount: -Math.abs(e.amount),
      }));

      const debts = this.user.debts.map(d => {
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
      });

      this.hasDebts = debts.length > 0;
      this.hasRevenues = revenues.length > 0;

      return [...revenues, ...expenses, ...debts];
    },

    uniqueCategories() {
      const categories = new Set();

      if (this.hasDebts) categories.add('Dívida');
      if (this.hasRevenues) categories.add('Receita');

      this.allTransactions.forEach(t => {
        if (t.category) {
          categories.add(t.category);
        }
      });

      return Array.from(categories);
    },

    filteredTransactions() {
      return this.allTransactions.filter((t) => {
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

  methods: {
    async fetchUserData() {
      try {
        const user = await authService.getUserInfo();
        this.userId = user.id;

        const userData = await userService.getUserByIdAllIncludes(user.id)

        this.user.revenues = userData.revenues;
        this.user.expenses = userData.expenses;
        this.user.debts = userData.debts;
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    },

    download(format) {
      this.showExport = true;
      this.$nextTick(() => {
        if (format === 'excel') {
          TableToExcel.convert(document.getElementById('exportTable'), {
            name: 'RelatorioFinanceiro.xlsx',
            sheet: { name: 'Relatório' },
          });
        }
        this.showExport = false;
      });
    },
  },

  async mounted() {
    await this.fetchUserData();
  },
};
</script>
