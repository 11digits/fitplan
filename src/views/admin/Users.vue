<script setup>
import { ref, onMounted } from 'vue'
import { getDatabase, ref as dbRef, get } from 'firebase/database'

const db = getDatabase()
const users = ref([])

onMounted(async () => {
  const snap = await get(dbRef(db, 'users'))
  users.value = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Users</h1>
    <table class="min-w-full text-left">
      <thead>
        <tr>
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Email</th>
          <th class="p-2 border">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td class="p-2 border">{{ u.id }}</td>
          <td class="p-2 border">{{ u.email }}</td>
          <td class="p-2 border">{{ u.role }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
