<template>
  <section class="container mx-auto pt-12 px-4 font-sans min-h-screen">
    <div class="text-center my-12">
      <h1 class="text-3xl font-bold text-gray-800">Resumo Financeiro</h1>
      <p class="text-gray-600 mt-2">
        Acompanhe seus dados financeiros de forma visual e intuitiva.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      <FinanceCard title="Receitas Totais" :value="totalRevenues.toMoeda(true)" />
      <FinanceCard title="Despesas Totais" :value="totalExpenses.toMoeda(true)" />
      <FinanceCard title="Economias" :value="Number(totalSavings).toMoeda(true)" />
      <FinanceCard title="Dívidas Totais">
        <div class="flex flex-col items-center text-center px-2 space-y-1">
          <p class="text-sm text-gray-700">
            Pagas:
            <span class="text-green-600 font-semibold">
              {{ paidDebtsTotal.toMoeda(true) }}
            </span>
            ({{ paidDebtsCount }})
          </p>
          <p class="text-sm text-gray-700">
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
      <div class="bg-white border border-gray-300 shadow rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-lg mb-4 text-gray-800">Receitas vs Despesas</h3>
        <GChart type="ColumnChart" :data="revenuesVsExpensesData" :options="chartOptionsColumn" />
      </div>

      <div class="bg-white border border-gray-300 shadow rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-lg mb-4 text-gray-800">Distribuição de Despesas</h3>
        <GChart type="PieChart" :data="expensesDistributionData" :options="chartOptionsPie" />
      </div>
    </div>
  </section>
</template>

<script>
import { GChart } from 'vue-google-charts';
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

  async mounted() {
    try {
      this.userId = await this.fetchUserId();
      if (this.userId) {
        this.fetchChartData();
      }
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },

  methods: {
    async fetchChartData() {
      try {
        const user = await userService.getUserByIdAllIncludes(this.userId);

        const { revenues, expenses, debts } = user;

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

    async fetchUserId() {
      const user = await authService.getProfile();
      return user.id;
    }
  },
};
</script>
