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
    await userStore.login(email.value, password.value)
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      try {
        await userStore.register(email.value, password.value)
      } catch (r) {
        error.value = r.message
        return
      }
    } else {
      error.value = e.message
      return
    }
  }
  router.push(userStore.isAdmin ? '/admin' : '/')
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl mb-4 text-center">Autentificare</h1>
    <form @submit.prevent="submit" class="space-y-4">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Parolă"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        Continuă
      </button>
    </form>
  </div>
</template>
