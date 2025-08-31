<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
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
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="p-4 rounded shadow flex items-center justify-between text-white bg-emerald-500">
        <div>
          <div class="text-sm">Questionnaires</div>
          <div class="text-3xl font-bold">{{ counts.questionnaires }}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-10 h-10 opacity-75"
        >
          <path
            fill-rule="evenodd"
            d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.904a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="p-4 rounded shadow flex items-center justify-between text-white bg-rose-500">
        <div>
          <div class="text-sm">Responses</div>
          <div class="text-3xl font-bold">{{ counts.responses }}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-10 h-10 opacity-75"
        >
          <path
            fill-rule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="p-4 rounded shadow flex items-center justify-between text-white bg-amber-500">
        <div>
          <div class="text-sm">Clients</div>
          <div class="text-3xl font-bold">{{ counts.users }}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-10 h-10 opacity-75"
        >
          <path
            d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
          />
        </svg>
      </div>
    </div>
    <div class="mt-4 space-x-4">
      <RouterLink to="/admin/questionnaires" class="text-blue-600 underline"
        >New Questionnaire</RouterLink
      >
      <RouterLink to="/admin/users" class="text-blue-600 underline"
        >Manage Clients</RouterLink
      >
      <RouterLink to="/admin/results" class="text-blue-600 underline"
        >View Results</RouterLink
      >
    </div>
  </div>
</template>
