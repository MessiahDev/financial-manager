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
import { onMounted, watchEffect } from 'vue';

const auth = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  auth.fetchUserProfile();
});

watchEffect(() => {
  document.documentElement.className = themeStore.theme;
});
</script>
