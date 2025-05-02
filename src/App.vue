<template>
  <NavbarView />
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/authStore';
import NavbarView from './views/NavbarView.vue';
import { onMounted } from 'vue';

const auth = useAuthStore();

onMounted(() => {
  auth.fetchUserProfile();
});
</script>
