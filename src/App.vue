<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
const router = useRouter()

async function logout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <nav
      class="bg-slate-800 text-white p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 shadow"
    >
      <RouterLink to="/" class="hover:underline font-semibold text-xl">
          Fit Plan - Alexandra Brad PT
      </RouterLink>
      <template v-if="userStore.authUser">        
        <RouterLink
          to="/admin"
          class="hover:underline"
          v-if="userStore.isAdmin"
          >Admin</RouterLink
        >
        <RouterLink
          v-if="userStore.isAdmin"
          to="/admin/questionnaires"
          class="hover:underline"
          >Add Questionnaire</RouterLink
        >
        <RouterLink
          v-if="userStore.isAdmin"
          to="/admin/results"
          class="hover:underline"
          >Results</RouterLink
        >
      </template>

      <div class="sm:ml-auto flex gap-4 items-center">
        <RouterLink
          v-if="!userStore.authUser"
          to="/login"
          class="hover:underline"
          >Login</RouterLink
        >
        <RouterLink
          v-if="!userStore.authUser"
          to="/register"
          class="hover:underline"
          >Register</RouterLink
        >
        <button
          v-else
          @click="logout"
          class="hover:underline"
        >Logout</button>
        <span v-if="userStore.authUser">{{ userStore.profile?.email }}</span>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
