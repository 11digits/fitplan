<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../../firebase'
import { ref as dbRef, push, set, update, get } from 'firebase/database'

const route = useRoute()

const questionnaire = ref({ title: '', description: '', status: 'draft' })
const sections = ref([])
const newSectionTitle = ref('')

onMounted(async () => {
  if (route.params.id) {
    const qSnap = await get(dbRef(db, `questionnaires/${route.params.id}`))
    if (qSnap.exists()) questionnaire.value = qSnap.val()
    const sSnap = await get(dbRef(db, 'sections'))
    if (sSnap.exists()) {
      sections.value = Object.entries(sSnap.val())
        .filter(([id, s]) => s.questionnaireId === route.params.id)
        .map(([id, s]) => ({ id, ...s }))
        .sort((a, b) => a.order - b.order)
    }
  }
})

async function saveQuestionnaire() {
  if (route.params.id) {
    await update(dbRef(db, `questionnaires/${route.params.id}`), {
      ...questionnaire.value,
      updatedAt: Date.now()
    })
  } else {
    const newRef = push(dbRef(db, 'questionnaires'))
    await set(newRef, { ...questionnaire.value, createdAt: Date.now(), updatedAt: Date.now() })
  }
}

async function addSection() {
  if (!route.params.id || !newSectionTitle.value) return
  const newRef = push(dbRef(db, 'sections'))
  await set(newRef, {
    questionnaireId: route.params.id,
    title: newSectionTitle.value,
    order: sections.value.length + 1,
    adminOnly: false
  })
  sections.value.push({ id: newRef.key, title: newSectionTitle.value, order: sections.value.length + 1 })
  newSectionTitle.value = ''
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Questionnaire Builder</h1>
    <div class="mb-4">
      <label class="block mb-1">Title</label>
      <input v-model="questionnaire.title" class="border rounded p-2 w-full" />
    </div>
    <div class="mb-4">
      <label class="block mb-1">Description</label>
      <textarea v-model="questionnaire.description" class="border rounded p-2 w-full" />
    </div>
    <div class="mb-4">
      <label class="block mb-1">Status</label>
      <select v-model="questionnaire.status" class="border rounded p-2 w-full">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
    </div>
    <button class="bg-green-600 text-white px-4 py-2 rounded" @click="saveQuestionnaire">Save</button>

    <div class="mt-8">
      <h2 class="font-semibold mb-2">Sections</h2>
      <ul class="mb-4">
        <li v-for="s in sections" :key="s.id" class="mb-2">{{ s.title }}</li>
      </ul>
      <div class="flex gap-2">
        <input v-model="newSectionTitle" placeholder="New section title" class="border p-2 flex-1" />
        <button class="bg-blue-600 text-white px-3 rounded" @click="addSection">Add</button>
      </div>
    </div>
  </div>
</template>
