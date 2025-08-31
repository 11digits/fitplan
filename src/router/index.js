import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import Questionnaires from '../views/Questionnaires.vue'
import QuestionnaireRunner from '../views/QuestionnaireRunner.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminQuestionnaire from '../views/admin/QuestionnaireBuilder.vue'
import AdminResponses from '../views/admin/Responses.vue'
import AdminUsers from '../views/admin/Users.vue'

const routes = [
  { path: '/', name: 'questionnaires', component: Questionnaires },
  { path: '/run/:id', name: 'run', component: QuestionnaireRunner },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/questionnaires/:id?',
    name: 'admin-questionnaire',
    component: AdminQuestionnaire,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/responses',
    name: 'admin-responses',
    component: AdminResponses,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsers,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'login' }
  }
})

export default router
