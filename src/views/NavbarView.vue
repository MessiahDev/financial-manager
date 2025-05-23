<template>
  <nav class="bg-gray-800 text-white font-sans fixed top-0 left-0 w-full z-10 shadow-md">
    <div class="flex items-center px-6 py-4 max-w-7xl mx-auto relative">

      <router-link to="/home" class="text-xl font-bold text-white">Financial Manager</router-link>

      <div class="md:hidden text-2xl cursor-pointer mx-10" @click="toggleMobileMenu" ref="mobileMenuButton">
        <i class="fa-solid fa-bars"></i>
      </div>

      <ul
        v-if="authStore.isAuthenticated"
        class="hidden md:flex space-x-6 text-sm font-medium items-center mx-auto"
      >
        <li v-for="item in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="px-3 py-2 rounded hover:bg-white hover:text-[#2c3e50] transition"
            :class="{ 'bg-white text-[#2c3e50] font-semibold': $route.path === item.path }"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>

      <div class="absolute right-0 flex items-center space-x-4">
        <div v-if="authStore.isAuthenticated" class="relative" ref="userDropdown">
          <button class="flex items-center space-x-2 focus:outline-none px-3" @click="toggleDropdown">
            <span>Olá, <b>{{ authStore.name }}</b>!</span>
            <i
              class="fa-solid fa-chevron-down transition-transform duration-200"
              :class="{ 'rotate-180': showDropdown }"
            ></i>
          </button>

          <ul
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-md z-20 py-2 text-sm"
          >
            <li>
              <router-link to="/perfil" class="block px-4 py-2 hover:bg-[#3c5d7c]">
                <i class="fa-solid fa-user mr-2"></i>Perfil
              </router-link>
            </li>
            <li>
              <router-link to="/configuracoes" class="block px-4 py-2 hover:bg-[#3c5d7c]">
                <i class="fa-solid fa-gear mr-2"></i>Configurações
              </router-link>
            </li>
            <li>
              <a href="/" @click.prevent="authStore.logout()" class="block px-4 py-2 hover:bg-[#3c5d7c]">
                <i class="fa-solid fa-right-from-bracket mr-2"></i>Sair
              </a>
            </li>
          </ul>
        </div>

        <div v-else>
          <router-link to="/" class="text-white text-base">
            <i class="fa-solid fa-user"></i>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="isMobile && showMobileMenu" class="md:hidden bg-[#34495e] px-6 py-4">
      <ul class="flex flex-col space-y-4 text-base">
        <li v-for="item in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="block py-2 px-3 rounded hover:bg-[#3c5d7c]"
            :class="{ 'bg-white text-[#2c3e50] font-semibold': $route.path === item.path }"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/authStore';

export default {
  name: 'NavbarView',
  data() {
    return {
      showDropdown: false,
      isMobile: false,
      showMobileMenu: false,
      navItems: [
        { path: '/home', label: 'Home' },
        { path: '/categorias', label: 'Categorias' },
        { path: '/receita', label: 'Receita' },
        { path: '/despesa', label: 'Despesa' },
        { path: '/divida', label: 'Dívida' },
        { path: '/relatorio', label: 'Relatório' },
      ],
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    }
  },
  mounted() {
    this.authStore.fetchUserProfile();
    this.detectMobile();
    window.addEventListener('resize', this.detectMobile);
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.detectMobile);
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    detectMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.userDropdown;
      const menuBtn = this.$refs.mobileMenuButton;

      if (dropdown && !dropdown.contains(event.target)) this.showDropdown = false;
      if (menuBtn && !menuBtn.contains(event.target)) this.showMobileMenu = false;
    },
  },
};
</script>

<style scoped>
</style>
  