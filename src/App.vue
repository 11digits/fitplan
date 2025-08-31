<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>

<template>
  <div>
    <nav class="bg-gray-800 text-white p-4 flex gap-4 items-center">
      <RouterLink to="/" class="hover:underline">Home</RouterLink>
      <RouterLink to="/admin" class="hover:underline" v-if="userStore.user">Admin</RouterLink>
      <RouterLink
        v-if="userStore.user"
        to="/admin/questionnaires"
        class="hover:underline"
      >Add Questionnaire</RouterLink>

      <div class="ml-auto flex gap-4 items-center">
        <button
          v-if="!userStore.user"
          @click="userStore.signInAnon"
          class="hover:underline"
        >Login</button>
        <button
          v-else
          @click="userStore.signOut"
          class="hover:underline"
        >Logout</button>
        <span v-if="userStore.user">{{ userStore.user.email || 'Guest' }}</span>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
