<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import jsPDF from 'jspdf'
import { db } from '../../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useQuestionnaireStore } from '../../stores/questionnaires'

const questionnaires = ref([])
const selectedQuestionnaire = ref('')
const responses = ref([])
const qStore = useQuestionnaireStore()

onMounted(async () => {
  const qSnap = await get(dbRef(db, 'questionnaires'))
  questionnaires.value = qSnap.exists()
    ? Object.entries(qSnap.val()).map(([id, v]) => ({ id, ...v }))
    : []
})

async function load() {
  if (!selectedQuestionnaire.value) return
  await qStore.fetchOne(selectedQuestionnaire.value)
  const rSnap = await get(dbRef(db, 'responses'))
  const all = rSnap.exists()
    ? Object.entries(rSnap.val()).map(([id, v]) => ({ id, ...v }))
    : []
  responses.value = all.filter(
    (r) => r.questionnaireId === selectedQuestionnaire.value && r.submittedAt
  )
}

const aggregated = computed(() => {
  const map = {}
  for (const r of responses.value) {
    if (!r.answers) continue
    for (const [qid, ans] of Object.entries(r.answers)) {
      const raw = typeof ans === 'object' && ans !== null && 'value' in ans ? ans.value : ans
      const vals = Array.isArray(raw) ? raw : [raw]
      if (!map[qid]) map[qid] = {}
      for (const v of vals) {
        map[qid][v] = (map[qid][v] || 0) + 1
      }
    }
  }
  return map
})

function formatDate(ts) {
  return new Date(ts).toLocaleString()
}

async function printResponse(r) {
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
      const ans = source[q.id]?.value || source[q.id] || ''
      const line = `${q.prompt}: ${Array.isArray(ans) ? ans.join(', ') : ans}`
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
  <div class="p-4">
    <div class="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <RouterLink to="/admin" class="text-blue-600 underline mb-4 inline-block">
        &larr; Înapoi
      </RouterLink>
      <h1 class="text-2xl font-bold mb-4 text-center">Rezultate</h1>
      <div class="grid gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label class="block text-sm mb-1">Chestionar</label>
          <select
            v-model="selectedQuestionnaire"
            @change="load"
            class="border p-2 rounded w-full"
          >
            <option value="" disabled>Selectează...</option>
            <option v-for="q in questionnaires" :key="q.id" :value="q.id">{{ q.title }}</option>
          </select>
        </div>
      </div>

      <div v-if="selectedQuestionnaire">
        <div class="flex justify-end mb-4">
          <RouterLink
            :to="`/admin/questionnaire/${selectedQuestionnaire}`"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Editează chestionarul
          </RouterLink>
        </div>

        <table class="w-full text-left border mb-6" v-if="responses.length">
          <thead>
            <tr class="border-b bg-slate-50">
              <th class="p-2">Client</th>
              <th class="p-2">Data</th>
              <th class="p-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in responses" :key="r.id" class="border-b last:border-b-0">
              <td class="p-2">{{ r.customerEmail || r.userId }}</td>
              <td class="p-2 text-sm text-slate-600">{{ formatDate(r.submittedAt) }}</td>
              <td class="p-2">
                <button
                  class="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm"
                  @click="printResponse(r)"
                >
                  PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-slate-600 mb-6">Niciun răspuns deocamdată.</div>

        <h2 class="text-xl font-semibold mb-4">Răspunsuri agregate</h2>
        <div v-for="q in qStore.questions" :key="q.id" class="mb-6">
          <h3 class="font-medium mb-2">{{ q.prompt }}</h3>
          <ul class="pl-4 list-disc">
            <li v-for="(count, val) in aggregated[q.id] || {}" :key="val">{{ val }}: {{ count }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
