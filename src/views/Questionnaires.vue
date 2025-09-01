<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { RouterLink } from 'vue-router'
import { db } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useUserStore } from '../stores/user'
import jsPDF from 'jspdf'

const qStore = useQuestionnaireStore()
const userStore = useUserStore()
const email = computed(() => userStore.profile?.email || '')
const statuses = ref({})
const responses = ref({})
const mode = ref(null)

const incomplete = computed(() =>
  qStore.published.filter((q) => !statuses.value[q.id])
)

const started = computed(() =>
  qStore.published.filter((q) => statuses.value[q.id])
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
  const resp = {}
  for (const r of filtered) {
    const hasAdmin = r.adminAnswers && Object.keys(r.adminAnswers).length > 0
    const hasCustomer = r.answers && Object.keys(r.answers).length > 0
    if (hasAdmin || hasCustomer) {
      map[r.questionnaireId] = hasAdmin ? 'admin' : 'customer'
      resp[r.questionnaireId] = r
    }
  }
  statuses.value = map
  responses.value = resp
}

function statusText(v) {
  if (v === 'admin') return 'administrator'
  if (v === 'customer') return 'completat'
  return 'necompletat'
}

async function print(r) {
  if (!r) return
  await qStore.fetchOne(r.questionnaireId)
  const doc = new jsPDF()
  let y = 10
  doc.setFontSize(16)
  doc.text(qStore.current.title || r.questionnaireId, 10, y)
  y += 10
  doc.setFontSize(12)
  for (const section of qStore.sections) {
    doc.setFont(undefined, 'bold')
    doc.text(section.title, 10, y)
    y += 8
    doc.setFont(undefined, 'normal')
    for (const q of qStore.questionsBySection(section.id)) {
      const source = section.adminOnly ? r.adminAnswers || {} : r.answers || {}
      const raw = source[q.id]?.value || source[q.id] || ''
      const ans = Array.isArray(raw) ? raw.join(', ') : raw
      const line = `${q.prompt}: ${ans}`
      const lines = doc.splitTextToSize(line, 190)
      for (const l of lines) {
        if (y > 280) {
          doc.addPage()
          y = 10
        }
        doc.text(l, 10, y)
        y += 7
      }
    }
    y += 4
  }
  doc.save('response.pdf')
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div v-if="!mode" class="space-y-6 text-center bg-white p-6 rounded shadow">
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
    <div v-else class="bg-white p-6 rounded shadow">
      <button class="mb-4 text-blue-600 underline" @click="mode = null">
        &larr; Înapoi
      </button>
      <h1 class="text-2xl font-bold mb-6 text-center">
        {{ mode === 'resume' ? 'Reia/Vizualizează chestionarul' : 'Începe chestionar nou' }}
      </h1>
      <div v-if="mode === 'resume'" class="overflow-x-auto">
        <table class="w-full text-left border">
          <thead>
            <tr class="border-b bg-slate-50">
              <th class="p-2">Chestionar</th>
              <th class="p-2">Status</th>
              <th class="p-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in started" :key="q.id" class="border-b last:border-b-0">
              <td class="p-2">{{ q.title }}</td>
              <td class="p-2 text-sm text-slate-600">{{ statusText(statuses[q.id]) }}</td>
              <td class="p-2 flex gap-2">
                <RouterLink
                  :to="`/run/${q.id}`"
                  class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Editează
                </RouterLink>
                <button
                  v-if="responses[q.id]"
                  class="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm"
                  @click="print(responses[q.id])"
                >
                  PDF
                </button>
              </td>
            </tr>
            <tr v-if="started.length === 0">
              <td colspan="3" class="p-4 text-center text-slate-500">
                Nu există chestionare începute.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border">
          <thead>
            <tr class="border-b bg-slate-50">
              <th class="p-2">Chestionar</th>
              <th class="p-2">Acțiune</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in incomplete" :key="q.id" class="border-b last:border-b-0">
              <td class="p-2">{{ q.title }}</td>
              <td class="p-2">
                <RouterLink
                  :to="`/run/${q.id}`"
                  class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Începe
                </RouterLink>
              </td>
            </tr>
            <tr v-if="incomplete.length === 0">
              <td colspan="2" class="p-4 text-center text-slate-500">
                Nu există chestionare noi.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
