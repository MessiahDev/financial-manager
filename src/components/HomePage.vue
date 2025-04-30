<template>
  <section class="home-page">
    <div class="dashboard-header">
      <h1>Resumo Financeiro</h1>
      <p>Bem-vindo ao seu painel financeiro. Aqui está um resumo das suas finanças.</p>
    </div>

    <div class="kpi-container">
      <div class="kpi-card">
        <h3>Receitas Totais</h3>
        <p>{{ formatCurrency(totalRevenues) }}</p>
      </div>
      <div class="kpi-card">
        <h3>Despesas Totais</h3>
        <p>{{ formatCurrency(totalExpenses) }}</p>
      </div>
      <div class="kpi-card">
        <h3>Investimentos</h3>
        <p>{{ formatCurrency(totalInvestments) }}</p>
      </div>
      <div class="kpi-card">
        <h3>Economias</h3>
        <p>{{ formatCurrency(totalSavings) }}</p>
      </div>
    </div>

    <div class="chart-container">
      <div class="card">
        <h3>Receitas vs Despesas</h3>
        <GChart type="ColumnChart" :data="revenuesVsExpensesData" :options="chartOptionsColumn" />
      </div>
      <div class="card">
        <h3>Distribuição de Despesas</h3>
        <GChart type="PieChart" :data="expensesDistributionData" :options="chartOptionsPie" />
      </div>
    </div>
  </section>
</template>

<script>
import { GChart } from 'vue-google-charts';
import revenueService from '../services/revenueService';
import expenseService from '../services/expenseService';
import authService from '../services/authService';

export default {
  name: 'HomePage',
  components: {
    GChart,
  },
  data() {
    return {
      totalRevenues: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      totalSavings: 0,
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
  
  methods: {
    async fetchChartData() {
      try {
        const user = await authService.getProfile();
        const userId = user.id;

        const revenues = await revenueService.getRevenuesByUserId(userId);
        const expenses = await expenseService.getExpensesByUserId(userId);

        this.totalRevenues = revenues.reduce((acc, r) => acc + r.amount, 0);
        this.totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
        this.totalSavings = this.totalRevenues - this.totalExpenses;

        const months = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const monthlyMap = {};
        for (let i = 0; i < 12; i++) {
          monthlyMap[i] = { revenues: 0, expenses: 0 };
        }

        revenues.forEach((r) => {
          const date = new Date(r.date);
          const month = date.getMonth();
          monthlyMap[month].revenues += r.amount;
        });

        expenses.forEach((e) => {
          const date = new Date(e.date);
          const month = date.getMonth();
          monthlyMap[month].expenses += e.amount;
        });

        this.revenuesVsExpensesData = [
          ['Mês', 'Receitas', 'Despesas'],
          ...Object.entries(monthlyMap).map(([monthIndex, values]) => [
            months[monthIndex],
            values.revenues,
            values.expenses,
          ]),
        ];

        const categoryMap = {};
        expenses.forEach((e) => {
          const category = e.categoryName || 'Outros';
          if (!categoryMap[category]) categoryMap[category] = 0;
          categoryMap[category] += e.amount;
        });

        this.expensesDistributionData = [
          ['Categoria', 'Valor'],
          ...Object.entries(categoryMap),
        ];
      } catch (error) {
        console.error('Erro ao buscar dados para gráficos:', error);
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    },
  },

  mounted() {
    this.fetchChartData();
  },
};
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 7em;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.kpi-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  height: 10em;
  width: 20%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 45%;
}

@media screen and (max-width: 1280px) {
  .kpi-container {
    flex-wrap: wrap;
  }

  .kpi-card {
    width: 45%;
    margin-bottom: 10px;
  }

  .chart-container {
    flex-wrap: wrap;
  }

  .card {
    width: 100%;
    margin-bottom: 10px;
  }
}

@media screen and (max-width: 800px) {
  .kpi-container {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .kpi-card {
    width: 90%;
    margin-bottom: 20px;
  }

  .chart-container {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 90%;
    margin-bottom: 20px;
  }
}
</style>