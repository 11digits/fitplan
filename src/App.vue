<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>

<template>
  <div>
    <nav class="bg-gray-800 text-white p-4 flex gap-4">
      <RouterLink to="/" class="hover:underline">Home</RouterLink>
      <RouterLink to="/admin" class="hover:underline">Admin</RouterLink>
      <button class="ml-auto" @click="userStore.signInAnon" v-if="!userStore.user">Guest</button>
      <span v-else>{{ userStore.user.email || 'Anon' }}</span>
    </nav>
    <RouterView />
  </div>
</template>
