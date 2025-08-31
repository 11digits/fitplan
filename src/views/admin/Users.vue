<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { ref as dbRef, get, update } from 'firebase/database'
const users = ref([])

async function loadUsers() {
  const snap = await get(dbRef(db, 'users'))
  users.value = snap.exists()
    ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
    : []
}

async function changeRole(u, role) {
  await update(dbRef(db, `users/${u.id}`), { role })
  u.role = role
}

onMounted(loadUsers)
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
          <td class="p-2 border">
            <select v-model="u.role" @change="changeRole(u, u.role)" class="border p-1">
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
