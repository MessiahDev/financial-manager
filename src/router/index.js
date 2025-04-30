import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CategoryView from '../views/CategoryView.vue';
import RevenueView from '../views/RevenueView.vue';
import ExpenseView from '../views/ExpenseView.vue';

const routes = [
    {
        path: '/',
        name: 'LoginView',
        component: LoginView,
    },
    {
        path: '/home',
        name: 'HomeView',
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/cadastro',
        name: 'RegisterView',
        component: RegisterView,
    },
    {
        path: '/categorias',
        name: 'CategoryView',
        component: CategoryView,
        meta: { requiresAuth: true }
    },
    {
        path: '/receita',
        name: 'RevenueView',
        component: RevenueView,
        meta: { requiresAuth: true }
    },
    {
        path: '/despesa',
        name: 'ExpenseView',
        component: ExpenseView,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !localStorage.getItem('token')) {
        next({ name: 'LoginView' });
    } else {
        next();
    }
});

export default router;
