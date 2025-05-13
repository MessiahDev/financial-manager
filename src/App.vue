<template>
  <div id="app">
    <NavbarView />
    <router-view />
    <FooterView />
  </div>
</template>


<script setup>
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import FooterView from './views/FooterView.vue';
import NavbarView from './views/NavbarView.vue';
import { watchEffect } from 'vue';

const themeStore = useThemeStore();

watchEffect(() => {
  document.documentElement.className = themeStore.theme;
});
</script>
