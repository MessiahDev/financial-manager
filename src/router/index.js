import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
    {
        path: '/',
        name: 'loginView',
        component: LoginView,
    },
    {
        path: '/home',
        name: 'homeView',
        component: HomeView,
        meta: { requiresAuth: true },
    },
    {
        path: '/cadastro',
        name: 'registerView',
        component: RegisterView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !localStorage.getItem('token')) {
        next({ name: 'loginView' });
    } else {
        next();
    }
});

export default router;
