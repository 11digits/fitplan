<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { useUserStore } from '../stores/user'
import jsPDF from 'jspdf'

const responses = ref([])
const questionnaires = ref({})
const qStore = useQuestionnaireStore()
const userStore = useUserStore()
const email = computed(() => userStore.profile?.email || '')

onMounted(async () => {
  const qSnap = await get(dbRef(db, 'questionnaires'))
  questionnaires.value = qSnap.exists() ? qSnap.val() : {}
  if (email.value) load()
})

watch(() => email.value, (val) => {
  if (val) load()
})

function titleOf(id) {
  return questionnaires.value[id]?.title || id
}

async function load() {
  if (!email.value) return
  const snap = await get(dbRef(db, 'responses'))
  const all = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
  responses.value = all.filter((r) => r.customerEmail === email.value && r.submittedAt)
}

async function print(r) {
  await qStore.fetchOne(r.questionnaireId)
  const doc = new jsPDF()
  let y = 10
  doc.setFontSize(16)
  doc.text(titleOf(r.questionnaireId), 10, y)
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
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Rezultatele tale</h1>
    <ul>
      <li
        v-for="r in responses"
        :key="r.id"
        class="mb-2 flex justify-between items-center"
      >
        <span>{{ titleOf(r.questionnaireId) }}</span>
        <button class="text-blue-600 underline" @click="print(r)">PDF</button>
      </li>
    </ul>
  </div>
</template>
