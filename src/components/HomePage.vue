<template>
  <div class="home-page">
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      message: "Hello, World!"
    };
  }
};
</script>

<style scoped>
.home-page {
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
}
</style>