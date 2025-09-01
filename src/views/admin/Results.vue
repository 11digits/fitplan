<script setup>
import { ref, onMounted, computed } from 'vue'
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
      const val = typeof ans === 'object' && ans !== null && 'value' in ans ? ans.value : ans
      if (!map[qid]) map[qid] = {}
      map[qid][val] = (map[qid][val] || 0) + 1
    }
  }
  return map
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Rezultate</h1>
    <div class="max-w-xl grid gap-4 sm:grid-cols-2">
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

    <div v-if="selectedQuestionnaire" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Răspunsuri agregate</h2>
      <div v-if="responses.length === 0" class="text-slate-600">Niciun răspuns deocamdată.</div>
      <div v-for="q in qStore.questions" :key="q.id" class="mb-6">
        <h3 class="font-medium mb-2">{{ q.prompt }}</h3>
        <ul class="pl-4 list-disc">
          <li v-for="(count, val) in aggregated[q.id] || {}" :key="val">{{ val }}: {{ count }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
