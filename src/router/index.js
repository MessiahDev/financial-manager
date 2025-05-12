import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'LoginView',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/home',
        name: 'HomeView',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/cadastro',
        name: 'RegisterView',
        component: () => import('../views/RegisterView.vue')
    },
    {
        path: '/categorias',
        name: 'CategoryView',
        component: () => import('../views/CategoryView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/receita',
        name: 'RevenueView',
        component: () => import('../views/RevenueView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/despesa',
        name: 'ExpenseView',
        component: () => import('../views/ExpenseView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/divida',
        name: 'DebtView',
        component: () => import('../views/DebtView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/relatorio',
        name: 'RelatoryView',
        component: () => import('../views/RelatoryView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/perfil',
        name: 'ProfileView',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/configuracoes',
        name: 'SettingsView',
        component: () => import('../views/SettingsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/recuperar-senha',
        name: 'ForgotPasswordView',
        component: () => import('../views/ForgotPasswordView.vue')
    },
    {
        path: '/redefinir-senha',
        name: 'ResetPasswordView',
        component: () => import('../views/ResetPasswordView.vue')
    },
    {
        path: '/confirmar-email',
        name: 'ConfirmEmailView',
        component: () => import('../views/ConfirmEmailView.vue')
    },
    {
        path: '/reenviar-confirmacao-email',
        name: 'ResendConfirmationEmailView',
        component: () => import('../views/ResendConfirmationEmailView.vue')
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
