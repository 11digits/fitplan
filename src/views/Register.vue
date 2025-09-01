<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Swal from 'sweetalert2'

const email = ref('')
const password = ref('')
const confirm = ref('')
const router = useRouter()
const userStore = useUserStore()

async function submit() {
  if (!email.value || !password.value) {
    Swal.fire('Date lipsă', 'Introduceți emailul și parola.', 'warning')
    return
  }
  if (password.value !== confirm.value) {
    Swal.fire('Parole diferite', 'Parolele nu se potrivesc.', 'warning')
    return
  }
  try {
    await userStore.register(email.value, password.value)
    router.push('/')
  } catch (e) {
    Swal.fire('Înregistrare eșuată', e.message, 'error')
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 shadow-lg rounded-lg overflow-hidden">
    <div class="bg-slate-800 text-white text-center py-4 text-2xl font-bold">
      Înregistrare
    </div>
    <div class="p-6 bg-white">
      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Parolă"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="confirm"
          type="password"
          placeholder="Confirmare parolă"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Creează cont
        </button>
      </form>
    </div>
  </div>
</template>
