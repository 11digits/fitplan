<script setup>
import { onMounted, ref } from 'vue'
import { db } from '../../firebase'
import { ref as dbRef, get } from 'firebase/database'
const counts = ref({ questionnaires: 0, responses: 0, users: 0 })

onMounted(async () => {
  const qSnap = await get(dbRef(db, 'questionnaires'))
  counts.value.questionnaires = qSnap.exists() ? Object.keys(qSnap.val()).length : 0
  const rSnap = await get(dbRef(db, 'responses'))
  counts.value.responses = rSnap.exists() ? Object.keys(rSnap.val()).length : 0
  const uSnap = await get(dbRef(db, 'users'))
  counts.value.users = uSnap.exists() ? Object.keys(uSnap.val()).length : 0
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 bg-gray-100 rounded text-center">
        <div class="text-lg font-semibold">Questionnaires</div>
        <div class="text-3xl">{{ counts.questionnaires }}</div>
      </div>
      <div class="p-4 bg-gray-100 rounded text-center">
        <div class="text-lg font-semibold">Responses</div>
        <div class="text-3xl">{{ counts.responses }}</div>
      </div>
      <div class="p-4 bg-gray-100 rounded text-center">
        <div class="text-lg font-semibold">Clients</div>
        <div class="text-3xl">{{ counts.users }}</div>
      </div>
    </div>
  </div>
</template>
