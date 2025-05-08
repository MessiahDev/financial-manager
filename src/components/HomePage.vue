<template>
  <section class="container mx-auto py-16 px-4 font-sans">
    <div class="text-center mb-10 mt-10">
      <h1 class="text-3xl font-bold text-gray-800">Resumo Financeiro</h1>
      <p class="text-gray-600 mt-2">
        Acompanhe seus dados financeiros de forma visual e intuitiva.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full mb-10">
      <FinanceCard title="Receitas Totais" :value="totalRevenues.toMoeda(true)" />
      <FinanceCard title="Despesas Totais" :value="totalExpenses.toMoeda(true)" />
      <FinanceCard title="Economias" :value="Number(totalSavings).toMoeda(true)" />
      <FinanceCard title="Dívidas Totais">
        <div class="flex flex-col items-center text-center px-3 break-words">
          <p class="font-medium text-sm text-gray-700">
            Pagas: {{ paidDebtsCount }}
            <span class="text-green-600 font-semibold">
              {{ paidDebtsTotal.toMoeda(true) }}
            </span>
          </p>
          <p class="font-medium text-sm text-gray-700">
            Em aberto: {{ openDebtsCount }}
            <span class="text-red-600 font-semibold">
              {{ openDebtsTotal.toMoeda(true) }}
            </span>
          </p>
        </div>
      </FinanceCard>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      <div class="bg-white border border-gray-200 rounded-xl p-5 bg-gray-100 border border-gray-300 text-gray-800">
        <h3 class="font-semibold text-lg mb-3">Receitas vs Despesas</h3>
        <GChart type="ColumnChart" :data="revenuesVsExpensesData" :options="chartOptionsColumn" />
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-5 bg-gray-100 border border-gray-300 text-gray-800">
        <h3 class="font-semibold text-lg mb-3">Distribuição de Despesas</h3>
        <GChart type="PieChart" :data="expensesDistributionData" :options="chartOptionsPie" />
      </div>
    </div>
  </section>
</template>

<script>
import { GChart } from 'vue-google-charts';
import authService from '../services/authService';
import debtService from '../services/debtService';
import FinanceCard from '../components/FinanceCard.vue';
import revenueService from '../services/revenueService';
import expenseService from '../services/expenseService';

export default {
  name: 'HomePage',
  components: {
    GChart,
    FinanceCard,
  },
  data() {
    return {
      totalRevenues: 0,
      totalExpenses: 0,
      totalDebts: 0,
      totalSavings: 0,
      paidDebtsCount: 0,
      paidDebtsTotal: 0,
      openDebtsCount: 0,
      openDebtsTotal: 0,
      revenuesVsExpensesData: [['Mês', 'Receitas', 'Despesas']],
      expensesDistributionData: [['Categoria', 'Valor']],
      chartOptionsColumn: {
        title: 'Receitas vs Despesas Mensais',
        height: 300,
        legend: { position: 'bottom' },
        bars: 'vertical',
        vAxis: { format: 'currency' },
      },
      chartOptionsPie: {
        title: 'Distribuição de Despesas',
        pieHole: 0.4,
        height: 300,
      },
    };
  },

  mounted() {
    this.fetchChartData();
  },

  methods: {
    async fetchChartData() {
      try {
        const user = await authService.getProfile();
        const userId = user.id;

        const [revenues, expenses, debts] = await Promise.all([
          revenueService.getRevenuesByUserId(userId),
          expenseService.getExpensesByUserId(userId),
          debtService.getDebtsByUserId(userId),
        ]);

        this.calculateTotals(revenues, expenses, debts);
        this.buildRevenuesVsExpensesChart(revenues, expenses);
        this.buildExpensesDistributionChart(expenses, debts);
        this.calculateDebtsSummary(debts);

      } catch (error) {
        console.error('Erro ao buscar dados para gráficos:', error);
      }
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
