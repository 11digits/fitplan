<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { RouterLink } from 'vue-router'
import { db } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useUserStore } from '../stores/user'

const qStore = useQuestionnaireStore()
const userStore = useUserStore()
const email = computed(() => userStore.profile?.email || '')
const statuses = ref({})
const mode = ref(null)

const incomplete = computed(() =>
  qStore.published.filter((q) => !statuses.value[q.id])
)

onMounted(() => {
  qStore.fetchPublished()
  if (email.value) loadStatuses()
})

watch(() => email.value, (val) => {
  if (val) loadStatuses()
})

watch(mode, (val) => {
  if (val && email.value) loadStatuses()
})

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
  if (v === 'admin') return 'administrator'
  if (v === 'customer') return 'completat'
  return 'necompletat'
}
</script>

<template>
  <div class="p-4 max-w-xl mx-auto">
    <div v-if="!mode" class="space-y-6 text-center">
      <h1 class="text-2xl font-bold">Începe chestionarul</h1>
      <div class="flex flex-col gap-4">
        <button
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          @click="mode = 'resume'"
        >
          Reia/Vizualizează chestionar
        </button>
        <button
          class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          @click="mode = 'new'"
        >
          Începe chestionar nou
        </button>
      </div>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-4 text-center">
        {{ mode === 'resume' ? 'Reia/Vizualizează chestionarul' : 'Începe chestionar nou' }}
      </h1>
        <div class="mb-4 max-w-sm mx-auto">
          <RouterLink to="/results" class="text-blue-600 underline"
            >Rezultatele tale</RouterLink
          >
        </div>
      <div v-if="mode === 'resume'">
          <table class="w-full max-w-xl mx-auto text-left border">
            <thead>
              <tr class="border-b">
                <th class="p-2">Chestionar</th>
                <th class="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in qStore.published" :key="q.id" class="border-b last:border-b-0">
                <td class="p-2">
                  <RouterLink :to="`/run/${q.id}`" class="text-blue-600 underline">
                    {{ q.title }}
                  </RouterLink>
                </td>
                <td class="p-2 text-sm text-slate-600">
                  {{ statusText(statuses[q.id]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <ul class="max-w-sm mx-auto">
            <li v-for="q in incomplete" :key="q.id" class="mb-2">
              <RouterLink :to="`/run/${q.id}`" class="text-blue-600 underline">
                {{ q.title }}
              </RouterLink>
            </li>
          </ul>
        </div>
      <button class="mt-4 text-blue-600 underline" @click="mode = null">Înapoi</button>
    </div>
  </div>
</template>
