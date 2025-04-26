<template>
    <div class="home">
        <HelloWorld msg="Welcome to Financial Manager!" />
    </div>
</template>

<script>
import HelloWorld from "../components/HomePage.vue";

export default {
    name: "HomeView",
    components: {
        HelloWorld,
    },
};
</script>

<style scoped>
.home {
    text-align: center;
    margin-top: 20px;
}
</style>