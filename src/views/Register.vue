<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const userStore = useUserStore()

async function submit() {
  try {
    await userStore.register(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-4">
    <h1 class="text-2xl mb-4">Register</h1>
    <form @submit.prevent="submit" class="space-y-4">
      <input v-model="email" type="email" placeholder="Email" class="w-full border p-2" required />
      <input v-model="password" type="password" placeholder="Password" class="w-full border p-2" required />
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2">Register</button>
    </form>
  </div>
</template>
