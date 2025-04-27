<template>
  <div class="grid-container">
    <div class="card" v-for="(chart, index) in charts" :key="index">
      <h3>{{ chart.title }}</h3>
      <ul>
        <li v-for="(item, idx) in chart.data" :key="idx">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import NavbarView from '../views/NavbarView.vue';

export default {
  components: {
    NavbarView,
  },
  data() {
    return {
      charts: [
        { title: 'Receitas Mensais', data: [] },
        { title: 'Despesas Mensais', data: [] },
        { title: 'Investimentos', data: [] },
        { title: 'Economias', data: [] },
      ],
    };
  },
  mounted() {
    //this.fetchChartData();
  },
  methods: {
    async fetchChartData() {
      try {
        const response = await fetch('https://api.seubackend.com/financial-data');
        const data = await response.json();
        this.charts[0].data = data.revenues;
        this.charts[1].data = data.expenses;
        this.charts[2].data = data.investments;
        this.charts[3].data = data.savings;
      } catch (error) {
        console.error('Erro ao buscar dados do backend:', error);
      }
    },
  },
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
</style>
