<script setup>
import { ref, onMounted } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { RouterLink } from 'vue-router'
import { db } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'

const qStore = useQuestionnaireStore()
const email = ref('')
const statuses = ref({})

onMounted(() => qStore.fetchPublished())

async function loadStatuses() {
  if (!email.value) return
  const snap = await get(dbRef(db, 'responses'))
  const all = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
  const filtered = all.filter((r) => r.customerEmail === email.value)
  const map = {}
  for (const r of filtered) {
    map[r.questionnaireId] =
      r.adminAnswers && Object.keys(r.adminAnswers).length > 0 ? 'admin' : 'customer'
  }
  statuses.value = map
}

function statusText(v) {
  if (v === 'admin') return 'admin'
  if (v === 'customer') return 'completat'
  return 'necompletat'
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Începe chestionarul</h1>
    <div class="mb-4 max-w-sm">
      <label class="block mb-1">Email</label>
      <input
        v-model="email"
        type="email"
        class="border border-gray-300 rounded w-full mb-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div class="flex items-center gap-4">
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          @click="loadStatuses"
        >
          Încarcă
        </button>
        <RouterLink to="/results" class="text-blue-600 underline"
          >Rezultatele tale</RouterLink
        >
      </div>
    </div>
    <ul>
      <li v-for="q in qStore.published" :key="q.id" class="mb-2">
        <RouterLink
          :to="`/run/${q.id}?email=${encodeURIComponent(email)}`"
          class="text-blue-600 underline"
        >
          {{ q.title }}
        </RouterLink>
        <span class="ml-2 text-sm text-slate-600">{{ statusText(statuses[q.id]) }}</span>
      </li>
    </ul>
  </div>
</template>
