<template>
    <nav class="navbar">
        <div class="navbar-container">
            <div v-if="!isMobile" class="navbar-logo-container">
                <a href="/" class="navbar-logo">Financial Manager</a>
            </div>
            <div v-if="isMobile" class="hamburger" @click="toggleMobileMenu" ref="mobileMenuButton">
                <span :class="{ open: showMobileMenu }"><i class="fa-solid fa-bars"></i></span>
            </div>

            <ul v-if="authStore.isAuthenticated" class="navbar-menu">
                <li class="navbar-item">
                    <a href="/home" class="navbar-link">Home</a>
                </li>
                <li class="navbar-item">
                    <a href="/categorias" class="navbar-link">Categorias</a>
                </li>
                <li class="navbar-item">
                    <a href="/settings" class="navbar-link">Settings</a>
                </li>
            </ul>

            <div v-if="authStore.isAuthenticated" class="navbar-user" @click="toggleDropdown" ref="userDropdown">
                <a href="javascript:void(0)" class="navbar-link">
                    <span>{{ authStore.firstName }}</span>
                    <span class="arrow" :class="{ open: showDropdown }"><i class="fa-solid fa-arrow-down"></i></span>
                </a>
                <ul v-if="showDropdown" class="dropdown-menu">
                    <li><a href="/profile" class="dropdown-link"><i class="fa-solid fa-user"></i>Perfil</a></li>
                    <li><a href="/settings" class="dropdown-link"><i class="fa-solid fa-gear"></i>Configurações</a></li>
                    <li><a href="/" class="dropdown-link" @click.prevent="authStore.logout()"><i class="fa-solid fa-right-from-bracket"></i>Sair</a></li>
                </ul>
            </div>

            <div v-else class="navbar-user">
                <a href="/" class="navbar-link"><i class="fa-solid fa-user"></i></a>
            </div>
        </div>

        <ul v-if="isMobile && showMobileMenu" class="mobile-menu">
            <li><a href="/home" class="navbar-link">Home</a></li>
            <li><a href="/categorias" class="navbar-link">Categorias</a></li>
            <li><a href="/settings" class="navbar-link">Settings</a></li>
        </ul>
    </nav>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/authStore';

export default {
    name: "NavbarView",

    setup() {
        const authStore = useAuthStore();
        const showDropdown = ref(false);
        const isMobile = ref(false);
        const showMobileMenu = ref(false);

        const userDropdown = ref(null);
        const mobileMenuButton = ref(null);

        const detectMobile = () => {
            isMobile.value = window.innerWidth <= 768;
        };

        const toggleDropdown = () => {
            showDropdown.value = !showDropdown.value;
        };

        const handleClickOutside = (event) => {
            if (userDropdown.value && !userDropdown.value.contains(event.target)) {
                showDropdown.value = false;
            }
            if (mobileMenuButton.value && !mobileMenuButton.value.contains(event.target)) {
                showMobileMenu.value = false;
            }
        };

        const toggleMobileMenu = () => {
            showMobileMenu.value = !showMobileMenu.value;
        };

        onMounted(() => {
            authStore.fetchUserProfile();
            detectMobile();
            document.addEventListener('click', handleClickOutside);
            window.addEventListener('resize', detectMobile);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('resize', detectMobile);
        });

        return {
            authStore,
            showDropdown,
            mobileMenuButton,
            isMobile,
            showMobileMenu,
            toggleDropdown,
            toggleMobileMenu,
            userDropdown,
        };
    },
};
</script>

<style scoped>
.navbar {
    background-color: #2c3e50;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.navbar-logo-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.navbar-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
}

.hamburger {
    font-size: 1.8rem;
    cursor: pointer;
    display: none;
}

.navbar-menu {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
}

.navbar-link {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
}

.navbar-link:hover {
    text-decoration: underline;
}

.navbar-user {
    position: relative;
    cursor: pointer;
}

.dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background-color: #34495e;
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    border-radius: 4px;
    min-width: 150px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

li i {
    margin: 0 0.5rem 0 0;
}

.dropdown-link {
    display: block;
    padding: 0.5rem 1rem;
    color: white;
    text-decoration: none;
    font-size: 0.9rem;
}

.dropdown-link:hover {
    background-color: #3c5d7c;
}

.navbar-item:hover {
    background-color: #3c5d7c;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    height: 100%;
}

.arrow {
    display: inline-block;
    margin-left: 0.3rem;
    transition: transform 0.1s ease;
}

.arrow.open {
    transform: rotate(180deg);
}

.mobile-menu {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #34495e;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 1;
}

@media (max-width: 768px) {
    .navbar-menu {
        display: none;
    }

    .hamburger {
        display: block;
    }

    .navbar-logo {
        display: none;
    }
}
</style>
