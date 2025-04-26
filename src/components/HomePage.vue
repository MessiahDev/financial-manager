<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard Financeiro</h1>
    </header>

    <section class="cards">
      <div class="card">
        <h2>Saldo Atual</h2>
        <p>R$ 5.250,00</p>
      </div>
      <div class="card">
        <h2>Receitas</h2>
        <p>R$ 8.000,00</p>
      </div>
      <div class="card">
        <h2>Despesas</h2>
        <p>R$ 2.750,00</p>
      </div>
    </section>

    <section class="chart">
      <h2>Resumo Mensal</h2>
      <div class="chart-placeholder">
        <p>Gráfico em breve...</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.cards {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.card {
  background-color: #f0f2f5;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

.chart {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #d3d3d3;
  text-align: center;
}

.chart-placeholder {
  margin-top: 20px;
  height: 200px;
  background-color: #f8f8f8;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
}
</style>
