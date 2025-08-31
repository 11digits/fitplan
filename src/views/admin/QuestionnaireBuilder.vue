<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { db } from '../../firebase'
import { ref as dbRef, push, set, update, get } from 'firebase/database'

const route = useRoute()
const router = useRouter()

const questionnaire = ref({ title: '', description: '', status: 'draft' })
const sections = ref([])
const newSectionTitle = ref('')
const questions = ref([])
const newQuestions = ref({})

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
    const qsSnap = await get(dbRef(db, 'questions'))
    if (qsSnap.exists()) {
      questions.value = Object.entries(qsSnap.val())
        .map(([id, q]) => ({ id, ...q }))
        .filter((q) => sections.value.some((s) => s.id === q.sectionId))
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
    Swal.fire('Saved', 'Questionnaire updated', 'success')
  } else {
    const newRef = push(dbRef(db, 'questionnaires'))
    await set(newRef, { ...questionnaire.value, createdAt: Date.now(), updatedAt: Date.now() })
    Swal.fire('Created', 'Questionnaire created', 'success')
    router.replace({ name: 'admin-questionnaire', params: { id: newRef.key } })
  }
}

async function addSection() {
  if (!route.params.id) {
    Swal.fire('Save first', 'Please save the questionnaire before adding sections', 'info')
    return
  }
  if (!newSectionTitle.value) {
    Swal.fire('Missing title', 'Section title is required', 'warning')
    return
  }
  const newRef = push(dbRef(db, 'sections'))
  await set(newRef, {
    questionnaireId: route.params.id,
    title: newSectionTitle.value,
    order: sections.value.length + 1,
    adminOnly: false
  })
  sections.value.push({ id: newRef.key, title: newSectionTitle.value, order: sections.value.length + 1 })
  newSectionTitle.value = ''
  Swal.fire('Added', 'Section added', 'success')
}

function questionsBySection(sectionId) {
  return questions.value.filter((q) => q.sectionId === sectionId)
}

async function addQuestion(sectionId) {
  if (!route.params.id) {
    Swal.fire('Save first', 'Please save the questionnaire before adding questions', 'info')
    return
  }
  const prompt = newQuestions.value[sectionId]
  if (!prompt) {
    Swal.fire('Missing prompt', 'Question prompt is required', 'warning')
    return
  }
  const newRef = push(dbRef(db, 'questions'))
  await set(newRef, {
    sectionId,
    prompt,
    order: questionsBySection(sectionId).length + 1,
    type: 'text'
  })
  questions.value.push({
    id: newRef.key,
    sectionId,
    prompt,
    order: questionsBySection(sectionId).length + 1,
    type: 'text'
  })
  newQuestions.value[sectionId] = ''
  Swal.fire('Added', 'Question added', 'success')
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
      <div v-for="s in sections" :key="s.id" class="mb-4 border rounded p-2">
        <h3 class="font-medium mb-2">{{ s.title }}</h3>
        <ul class="mb-2 pl-4 list-disc">
          <li v-for="q in questionsBySection(s.id)" :key="q.id" class="mb-1">{{ q.prompt }}</li>
        </ul>
        <div class="flex gap-2">
          <input v-model="newQuestions[s.id]" placeholder="New question prompt" class="border p-2 flex-1" />
          <button class="bg-blue-600 text-white px-3 rounded" @click="addQuestion(s.id)">Add</button>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <input v-model="newSectionTitle" placeholder="New section title" class="border p-2 flex-1" />
        <button class="bg-blue-600 text-white px-3 rounded" @click="addSection">Add Section</button>
      </div>
    </div>
  </div>
</template>
