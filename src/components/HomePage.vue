<template>
  <section class="container mx-auto py-12 px-4 mb-12 font-sans min-h-screen">
    <div class="text-center mt-12 mb-8">
      <h1 class="text-3xl font-bold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">Resumo Financeiro</h1>
      <p class="mt-2" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
        Acompanhe seus dados financeiros de forma visual e intuitiva.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8 w-full">
      <label class="flex flex-col sm:flex-row items-center gap-2 w-full" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
        Início:
        <input type="date" v-model="startDate" class="input w-full text-gray-600" />
      </label>
      <label class="flex flex-col sm:flex-row items-center gap-2 w-full" :class="isDark ? 'text-gray-100' : 'text-gray-600'">
        Fim:
        <input type="date" v-model="endDate" class="input w-full text-gray-600" />
      </label>
      <button
        @click="applyDateFilter"
        class="bg-none font-semibold px-4 py-2 border border-solid rounded w-full sm:w-auto"
        :class="isDark ? 'border-gray-600/50 text-gray-100 hover:bg-gray-800' : 'border-gray-600/50 text-gray-600 hover:bg-gray-300'"
      >
        Filtrar
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 my-8">
      <FinanceCard title="Receitas Totais" :value="totalRevenues.toMoeda(true)" />
      <FinanceCard title="Despesas Totais" :value="totalExpenses.toMoeda(true)" />
      <FinanceCard title="Economias" :value="totalSavings.toMoeda(true)" />
      <FinanceCard title="Dívidas Totais">
        <div class="flex flex-col items-center text-center px-2 space-y-1">
          <p class="text-sm">
            Pagas:
            <span class="text-green-600 font-semibold">
              {{ paidDebtsTotal.toMoeda(true) }}
            </span>
            ({{ paidDebtsCount }})
          </p>
          <p class="text-sm">
            Em aberto:
            <span class="text-red-600 font-semibold">
              {{ openDebtsTotal.toMoeda(true) }}
            </span>
            ({{ openDebtsCount }})
          </p>
        </div>
      </FinanceCard>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="border border-gray-300 shadow rounded-xl p-6 shadow-sm"
            :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
        <h3 class="font-semibold text-lg mb-4"
            :class="isDark ? 'text-gray-100' : 'text-gray-600'"
        >Receitas vs Despesas</h3>
        <GChart type="ColumnChart" :data="revenuesVsExpensesData" :options="chartOptionsColumn" />
      </div>

      <div class="border border-gray-300 shadow rounded-xl p-6 shadow-sm"
            :class="isDark ? 'bg-gray-900' : 'bg-gray-200'">
        <h3 class="font-semibold text-lg mb-4"
            :class="isDark ? 'text-gray-100' : 'text-gray-600'"
        >Distribuição de Despesas</h3>
        <GChart type="PieChart" :data="expensesDistributionData" :options="chartOptionsPie" />
      </div>
    </div>
  </section>
</template>

<script>
import { GChart } from 'vue-google-charts';
import { useThemeStore } from '../stores/themeStore';
import authService from '../services/authService';
import userService from '../services/userService';
import FinanceCard from '../components/FinanceCard.vue';

export default {
  name: 'HomePage',
  components: {
    GChart,
    FinanceCard,
  },
  data() {
    return {
      userId: null,
      startDate: '',
      endDate: '',
      totalRevenues: 0,
      totalExpenses: 0,
      totalDebts: 0,
      totalSavings: 0,
      paidDebtsCount: 0,
      paidDebtsTotal: 0,
      openDebtsCount: 0,
      openDebtsTotal: 0,
      themeStore: useThemeStore(),
      revenuesVsExpensesData: [['Mês', 'Receitas', 'Despesas']],
      expensesDistributionData: [['Categoria', 'Valor']]
    };
  },

  computed: {
    isDark() {
      return this.themeStore.theme === 'dark';
    },
    chartOptionsColumn() {
      return {
        title: 'Receitas vs Despesas Mensais',
        height: 300,
        backgroundColor: this.isDark ? '#1f2937' : '#ffffff',
        titleTextStyle: {
          color: this.isDark ? '#ffffff' : '#000000',
        },
        legend: {
          position: 'bottom',
          textStyle: {
            color: this.isDark ? '#e5e5e5' : '#333333',
          },
        },
        hAxis: {
          textStyle: {
            color: this.isDark ? '#d1d5db' : '#000000',
          },
        },
        vAxis: {
          format: 'currency',
          textStyle: {
            color: this.isDark ? '#d1d5db' : '#000000',
          },
        },
      };
    },

    chartOptionsPie() {
      return {
        title: 'Distribuição de Despesas',
        pieHole: 0.4,
        height: 300,
        backgroundColor: this.isDark ? '#1f2937' : '#ffffff',
        titleTextStyle: {
          color: this.isDark ? '#ffffff' : '#000000',
        },
        legend: {
          textStyle: {
            color: this.isDark ? '#e5e5e5' : '#333333',
          },
        },
      };
    },
  },

  async mounted() {
    try {
      await this.fetchUserProfile();
      if (this.userId) {
        this.fetchChartData();
      }
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },

  methods: {
    async fetchUserProfile() {
      try {
        const user = await authService.getProfile();
        if (user && user.id) {
          this.userId = user.id;
        } else {
          console.warn("Usuário não autenticado.");
          this.userId = null;
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        this.userId = null;
      }
    },

    async fetchChartData(startDate = null, endDate = null) {
      try {
        const user = await userService.getUserByIdAllIncludes(this.userId);
        let { revenues, expenses, debts } = user;

        if (startDate && endDate) {
          let start = new Date(startDate);
          let end = new Date(endDate);

          if (start > end) [start, end] = [end, start];

          const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

          const inRange = date => {
            if (!date) return false;
            const d = formatDate(date);
            const startStr = formatDate(start);
            const endStr = formatDate(end);
            const result = d >= startStr && d <= endStr;
            return result;
          };

          revenues = revenues.filter(r => inRange(r.date));
          expenses = expenses.filter(e => inRange(e.date));
          debts = debts.filter(d => inRange(d.dueDate));
        }

        this.calculateTotals(revenues, expenses, debts);
        this.buildRevenuesVsExpensesChart(revenues, expenses);
        this.buildExpensesDistributionChart(expenses, debts);
        this.calculateDebtsSummary(debts);
      } catch (error) {
        console.error('Erro ao buscar dados para gráficos:', error);
      }
    },

    applyDateFilter() {
      if (!this.startDate || !this.endDate) return;

      this.fetchChartData(this.startDate, this.endDate);
    },

    calculateTotals(revenues, expenses, debts) {
      this.totalRevenues = revenues.reduce((acc, r) => acc + r.amount, 0);
      this.totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
      this.totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
      this.totalSavings = this.totalRevenues - this.totalExpenses;
    },

    buildRevenuesVsExpensesChart(revenues, expenses) {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const monthlyMap = Array.from({ length: 12 }, () => ({
        revenues: 0,
        expenses: 0
      }));

      revenues.forEach(({ date, amount }) => {
        const month = new Date(date).getMonth();
        monthlyMap[month].revenues += amount;
      });

      expenses.forEach(({ date, amount }) => {
        const month = new Date(date).getMonth();
        monthlyMap[month].expenses += amount;
      });

      this.revenuesVsExpensesData = [
        ['Mês', 'Receitas', 'Despesas'],
        ...monthlyMap.map((values, i) => [
          months[i],
          values.revenues,
          values.expenses
        ]),
      ];
    },

    buildExpensesDistributionChart(expenses, debts) {
      const categoryMap = {};

      expenses.forEach(({ categoryName = 'Outros', amount }) => {
        if (!categoryMap[categoryName]) categoryMap[categoryName] = 0;
        categoryMap[categoryName] += amount;
      });

      const openDebtsTotal = debts
        .filter(d => !d.isPaid)
        .reduce((acc, d) => acc + d.amount, 0);

      this.expensesDistributionData = [
        ['Categoria', 'Valor'],
        ...Object.entries(categoryMap),
        ['Dívidas em aberto', openDebtsTotal],
      ];
    },

    calculateDebtsSummary(debts) {
      const paidDebts = debts.filter(d => d.isPaid);
      const openDebts = debts.filter(d => !d.isPaid);

      this.paidDebtsCount = paidDebts.length;
      this.paidDebtsTotal = paidDebts.reduce((acc, d) => acc + d.amount, 0);
      this.openDebtsCount = openDebts.length;
      this.openDebtsTotal = openDebts.reduce((acc, d) => acc + d.amount, 0);
    },
  },
};
</script>
