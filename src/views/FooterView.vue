<template>
  <footer class="bg-gray-800 text-white w-full h-60 flex items-center justify-center">
    <div class="container mx-auto text-center">
      <p class="text-sm">
        © {{ new Date().getFullYear() }} Financial Manager. Todos os direitos reservados.
      </p>
      <p class="text-sm">
        Desenvolvido por
        <a href="https://linkedin.com/in/alex-alle" target="_blank" class="text-teal-400 hover:underline">Alex Alle</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>

<style scoped>
</style>