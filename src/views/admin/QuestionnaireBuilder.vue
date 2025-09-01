<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import { db } from '../../firebase'
import { ref as dbRef, push, set, update, get, remove } from 'firebase/database'

const route = useRoute()
const router = useRouter()

const questionnaire = ref({ title: '', description: '', status: 'draft' })
const sections = ref([])
const newSectionTitle = ref('')
const newSectionAdminOnly = ref(false)
const questions = ref([])
const newQuestions = ref({})
const newQuestionTypes = ref({})
const newQuestionOptions = ref({})
const editingQuestions = ref({})

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
    Swal.fire('Salvat', 'Chestionar actualizat', 'success')
  } else {
    const newRef = push(dbRef(db, 'questionnaires'))
    await set(newRef, { ...questionnaire.value, createdAt: Date.now(), updatedAt: Date.now() })
    Swal.fire('Creat', 'Chestionar creat', 'success')
    router.replace({ name: 'admin-questionnaire', params: { id: newRef.key } })
  }
}

async function addSection() {
  if (!route.params.id) {
    Swal.fire('Salvați mai întâi', 'Vă rugăm să salvați chestionarul înainte de a adăuga secțiuni', 'info')
    return
  }
  if (!newSectionTitle.value) {
    Swal.fire('Titlu lipsă', 'Titlul secțiunii este necesar', 'warning')
    return
  }
  const newRef = push(dbRef(db, 'sections'))
  await set(newRef, {
    questionnaireId: route.params.id,
    title: newSectionTitle.value,
    order: sections.value.length + 1,
    adminOnly: newSectionAdminOnly.value
  })
  sections.value.push({
    id: newRef.key,
    title: newSectionTitle.value,
    order: sections.value.length + 1,
    adminOnly: newSectionAdminOnly.value
  })
  newSectionTitle.value = ''
  newSectionAdminOnly.value = false
  Swal.fire('Adăugat', 'Secțiune adăugată', 'success')
}

function questionsBySection(sectionId) {
  return questions.value.filter((q) => q.sectionId === sectionId)
}

async function updateSectionTitle(section) {
  await update(dbRef(db, `sections/${section.id}`), { title: section.title })
}

async function deleteSection(section) {
  await remove(dbRef(db, `sections/${section.id}`))
  sections.value = sections.value.filter((s) => s.id !== section.id)
  questions.value = questions.value.filter((q) => q.sectionId !== section.id)
}

async function addQuestion(sectionId) {
  if (!route.params.id) {
    Swal.fire('Salvați mai întâi', 'Vă rugăm să salvați chestionarul înainte de a adăuga întrebări', 'info')
    return
  }
  const prompt = newQuestions.value[sectionId]
  if (!prompt) {
    Swal.fire('Întrebare lipsă', 'Enunțul întrebării este necesar', 'warning')
    return
  }
  const type = newQuestionTypes.value[sectionId] || 'text'
  const optsStr = newQuestionOptions.value[sectionId] || ''
  const options = type === 'text' ? [] : optsStr.split(',').map((o) => o.trim()).filter((o) => o)
  const newRef = push(dbRef(db, 'questions'))
  await set(newRef, {
    sectionId,
    prompt,
    order: questionsBySection(sectionId).length + 1,
    type,
    options
  })
  questions.value.push({
    id: newRef.key,
    sectionId,
    prompt,
    order: questionsBySection(sectionId).length + 1,
    type,
    options
  })
  newQuestions.value[sectionId] = ''
  newQuestionTypes.value[sectionId] = 'text'
  newQuestionOptions.value[sectionId] = ''
  Swal.fire('Adăugat', 'Întrebare adăugată', 'success')
}

function startEditQuestion(q) {
  editingQuestions.value[q.id] = {
    prompt: q.prompt,
    type: q.type,
    options: q.options.join(', ')
  }
}

function cancelEditQuestion(q) {
  delete editingQuestions.value[q.id]
}

async function saveQuestion(q) {
  const data = editingQuestions.value[q.id]
  if (!data) return
  const options =
    data.type === 'text'
      ? []
      : data.options.split(',').map((o) => o.trim()).filter((o) => o)
  await update(dbRef(db, `questions/${q.id}`), {
    prompt: data.prompt,
    type: data.type,
    options
  })
  Object.assign(q, { prompt: data.prompt, type: data.type, options })
  delete editingQuestions.value[q.id]
}

async function deleteQuestion(q) {
  await remove(dbRef(db, `questions/${q.id}`))
  questions.value = questions.value.filter((x) => x.id !== q.id)
}

async function updateSectionAdmin(section) {
  await update(dbRef(db, `sections/${section.id}`), { adminOnly: section.adminOnly })
}

async function deleteQuestionnaire() {
  if (!route.params.id) return
  const confirm = await Swal.fire({
    title: 'Șterge chestionarul?',
    text: 'Aceasta va elimina toate secțiunile și întrebările',
    showCancelButton: true,
    confirmButtonText: 'Șterge',
    icon: 'warning'
  })
  if (!confirm.isConfirmed) return
  await remove(dbRef(db, `questionnaires/${route.params.id}`))
  for (const s of sections.value) {
    await remove(dbRef(db, `sections/${s.id}`))
  }
  for (const q of questions.value) {
    await remove(dbRef(db, `questions/${q.id}`))
  }
  Swal.fire('Șters', 'Chestionar șters', 'success')
  router.push('/admin')
}
</script>

<template>
  <div class="p-4">
    <div class="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <RouterLink to="/admin" class="text-blue-600 underline mb-4 inline-block">
        &larr; Înapoi
      </RouterLink>
      <h1 class="text-xl font-bold mb-4 text-center">Editor chestionar</h1>
      <div class="mb-4">
        <label class="block mb-1">Titlu</label>
        <input v-model="questionnaire.title" class="border rounded p-2 w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Descriere</label>
        <textarea v-model="questionnaire.description" class="border rounded p-2 w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Stare</label>
        <select v-model="questionnaire.status" class="border rounded p-2 w-full">
          <option value="draft">Schiță</option>
          <option value="published">Publicat</option>
        </select>
      </div>
      <div class="flex gap-2 mb-6">
        <button class="bg-green-600 text-white px-4 py-2 rounded" @click="saveQuestionnaire">Salvează</button>
        <button v-if="route.params.id" class="bg-red-600 text-white px-4 py-2 rounded" @click="deleteQuestionnaire">Șterge</button>
      </div>

      <div class="mt-8">
        <h2 class="font-semibold mb-2">Secțiuni</h2>
        <div v-for="s in sections" :key="s.id" class="mb-4 border rounded p-2">
          <div class="flex items-center justify-between mb-2 gap-2">
            <input
              v-model="s.title"
              @change="updateSectionTitle(s)"
              class="font-medium border-b flex-1"
            />
            <label class="flex items-center text-sm gap-1">
              <input type="checkbox" v-model="s.adminOnly" @change="updateSectionAdmin(s)" />
              Doar admin
            </label>
            <button class="text-red-600 text-xs" @click="deleteSection(s)">Șterge</button>
          </div>
          <ul class="mb-2 pl-4 list-disc">
            <li
              v-for="q in questionsBySection(s.id)"
              :key="q.id"
              class="mb-1"
            >
              <div v-if="!editingQuestions[q.id]" class="flex items-center gap-2">
                <span>
                  {{ q.prompt }}
                  <span class="text-xs text-slate-600">({{ q.type }})</span>
                </span>
                <button class="text-blue-600 text-xs" @click="startEditQuestion(q)">Editează</button>
                <button class="text-red-600 text-xs" @click="deleteQuestion(q)">Șterge</button>
              </div>
              <div v-else class="flex flex-col gap-1">
                <input v-model="editingQuestions[q.id].prompt" class="border p-1" />
                <select v-model="editingQuestions[q.id].type" class="border p-1">
                  <option value="text">Text</option>
                  <option value="radio">Opțiuni (radio)</option>
                  <option value="checkbox">Opțiuni multiple</option>
                </select>
                <input
                  v-if="editingQuestions[q.id].type !== 'text'"
                  v-model="editingQuestions[q.id].options"
                  placeholder="Opțiuni separate prin virgulă"
                  class="border p-1"
                />
                <div class="flex gap-2">
                  <button class="bg-green-600 text-white px-2 rounded text-xs" @click="saveQuestion(q)">Salvează</button>
                  <button class="text-xs" @click="cancelEditQuestion(q)">Renunță</button>
                </div>
              </div>
            </li>
          </ul>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="newQuestions[s.id]"
              placeholder="Enunț întrebare nouă"
              class="border p-2 flex-1"
            />
            <select v-model="newQuestionTypes[s.id]" class="border p-2">
              <option value="text">Text</option>
              <option value="radio">Opțiuni (radio)</option>
              <option value="checkbox">Opțiuni multiple</option>
            </select>
            <input
              v-if="newQuestionTypes[s.id] && newQuestionTypes[s.id] !== 'text'"
              v-model="newQuestionOptions[s.id]"
              placeholder="Opțiuni separate prin virgulă"
              class="border p-2 flex-1"
            />
            <button class="bg-blue-600 text-white px-3 rounded" @click="addQuestion(s.id)">
              Adaugă
            </button>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 mt-4 items-center">
          <input v-model="newSectionTitle" placeholder="Titlu secțiune nouă" class="border p-2 flex-1" />
          <label class="flex items-center text-sm gap-1">
            <input type="checkbox" v-model="newSectionAdminOnly" /> Doar admin
          </label>
          <button class="bg-blue-600 text-white px-3 rounded" @click="addSection">Adaugă secțiune</button>
        </div>
      </div>
    </div>
  </div>
</template>
