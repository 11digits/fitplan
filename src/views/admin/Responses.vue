<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { ref as dbRef, get } from 'firebase/database'
const responses = ref([])

onMounted(async () => {
  const snap = await get(dbRef(db, 'responses'))
  responses.value = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Responses</h1>
    <table class="min-w-full text-left">
      <thead>
        <tr>
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Questionnaire</th>
          <th class="p-2 border">User</th>
          <th class="p-2 border">Submitted</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in responses" :key="r.id">
          <td class="p-2 border">{{ r.id }}</td>
          <td class="p-2 border">{{ r.questionnaireId }}</td>
          <td class="p-2 border">{{ r.userId }}</td>
          <td class="p-2 border">{{ r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Draft' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
