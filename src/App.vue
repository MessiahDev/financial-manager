<template>
  <div id="app">
    <NavbarView />
    <router-view />
    <FooterView />
  </div>
</template>


<script setup>
import { useAuthStore } from './stores/authStore';
import FooterView from './views/FooterView.vue';
import NavbarView from './views/NavbarView.vue';
import { onMounted } from 'vue';

const auth = useAuthStore();

onMounted(() => {
  auth.fetchUserProfile();
});
</script>
