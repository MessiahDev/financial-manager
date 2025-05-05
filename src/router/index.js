import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CategoryView from '../views/CategoryView.vue';
import RevenueView from '../views/RevenueView.vue';
import ExpenseView from '../views/ExpenseView.vue';
import ProfileView from '../views/ProfileView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import ConfirmEmailView from '../views/ConfirmEmailView.vue';
import ResendConfirmationEmailView from '../views/ResendConfirmationEmailView.vue';

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
    {
        path: '/perfil',
        name: 'ProfileView',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/recuperar-senha',
        name: 'ForgotPasswordView',
        component: ForgotPasswordView
    },
    {
        path: '/redefinir-senha',
        name: 'ResetPasswordView',
        component: ResetPasswordView
    },
    {
        path: '/confirmar-email',
        name: 'ConfirmEmailView',
        component: ConfirmEmailView
    },
    {
        path: '/reenviar-confirmacao-email',
        name: 'ResendConfirmationEmailView',
        component: ResendConfirmationEmailView
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (to.meta.requiresAuth && !token) {
        next({ name: 'LoginView' });
    } else if ((to.name === 'LoginView' || to.name === 'RegisterView') && token) {
        next({ name: 'HomeView' });
    } else {
        next();
    }
});

export default router;
