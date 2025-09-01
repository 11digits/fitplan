<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useQuestionnaireStore } from '../../stores/questionnaires'
const responses = ref([])
const selected = ref(null)
const qStore = useQuestionnaireStore()

onMounted(async () => {
  const snap = await get(dbRef(db, 'responses'))
  responses.value = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
})

async function viewResponse(r) {
  await qStore.fetchOne(r.questionnaireId)
  selected.value = r
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Răspunsuri</h1>
    <table class="min-w-full text-left">
      <thead>
        <tr>
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Chestionar</th>
          <th class="p-2 border">Utilizator</th>
          <th class="p-2 border">Stare</th>
          <th class="p-2 border">Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in responses" :key="r.id">
          <td class="p-2 border">{{ r.id }}</td>
          <td class="p-2 border">{{ r.questionnaireId }}</td>
          <td class="p-2 border">{{ r.userId }}</td>
          <td class="p-2 border">
            {{
              r.adminAnswers && Object.keys(r.adminAnswers).length > 0
                ? 'administrator'
                : r.submittedAt
                ? 'client'
                : 'niciunul'
            }}
          </td>
          <td class="p-2 border"><button class="text-blue-600 underline" @click="viewResponse(r)">Vezi</button></td>
        </tr>
      </tbody>
    </table>

    <div v-if="selected" class="mt-6">
      <h2 class="text-xl font-bold mb-4">Răspuns {{ selected.id }}</h2>
      <div v-for="section in qStore.sections" :key="section.id" class="mb-4">
        <h3 class="font-semibold mb-2">{{ section.title }}</h3>
        <ul class="pl-4 list-disc">
          <li v-for="q in qStore.questionsBySection(section.id)" :key="q.id">
            <strong>{{ q.prompt }}:</strong>
            {{
              section.adminOnly
                ? selected.adminAnswers?.[q.id]?.value || selected.adminAnswers?.[q.id] || ''
                : selected.answers?.[q.id]?.value || selected.answers?.[q.id] || ''
            }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
