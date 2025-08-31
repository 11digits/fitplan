import { createRouter, createWebHistory } from 'vue-router'

import Questionnaires from '../views/Questionnaires.vue'
import QuestionnaireRunner from '../views/QuestionnaireRunner.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminQuestionnaire from '../views/admin/QuestionnaireBuilder.vue'
import AdminResponses from '../views/admin/Responses.vue'
import AdminUsers from '../views/admin/Users.vue'

const routes = [
  { path: '/', name: 'questionnaires', component: Questionnaires },
  { path: '/run/:id', name: 'run', component: QuestionnaireRunner },
  { path: '/admin', name: 'admin-dashboard', component: AdminDashboard },
  { path: '/admin/questionnaires/:id?', name: 'admin-questionnaire', component: AdminQuestionnaire },
  { path: '/admin/responses', name: 'admin-responses', component: AdminResponses },
  { path: '/admin/users', name: 'admin-users', component: AdminUsers }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
