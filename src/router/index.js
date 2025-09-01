import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import Questionnaires from '../views/Questionnaires.vue'
import QuestionnaireRunner from '../views/QuestionnaireRunner.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Results from '../views/Results.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminQuestionnaire from '../views/admin/QuestionnaireBuilder.vue'
import AdminResponses from '../views/admin/Responses.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminResults from '../views/admin/Results.vue'

const routes = [
  {
    path: '/',
    name: 'questionnaires',
    component: Questionnaires,
    meta: { requiresAuth: true }
  },
  {
    path: '/run/:id',
    name: 'run',
    component: QuestionnaireRunner,
    meta: { requiresAuth: true }
  },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  {
    path: '/results',
    name: 'results',
    component: Results,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/questionnaires/:id?',
    name: 'admin-questionnaire',
    component: AdminQuestionnaire,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/responses',
    name: 'admin-responses',
    component: AdminResponses,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/results',
    name: 'admin-results',
    component: AdminResults,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.authUser) {
    return { name: 'login' }
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'login' }
  }
})

export default router
