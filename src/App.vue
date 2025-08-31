<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>

<template>
  <div>
    <nav class="bg-gray-800 text-white p-4 flex gap-4 items-center">
      <RouterLink to="/" class="hover:underline">Home</RouterLink>
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
      >Add Questionnaire</RouterLink>

      <div class="ml-auto flex gap-4 items-center">
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
          @click="userStore.logout"
          class="hover:underline"
        >Logout</button>
        <span v-if="userStore.authUser">{{ userStore.profile?.email }}</span>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
