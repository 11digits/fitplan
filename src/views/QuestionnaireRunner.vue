<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { useResponseStore } from '../stores/responses'
import { useUserStore } from '../stores/user'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const qStore = useQuestionnaireStore()
const rStore = useResponseStore()
const userStore = useUserStore()
const started = ref(false)

onMounted(async () => {
  await qStore.fetchOne(route.params.id)
  if (!userStore.authUser) {
    await Swal.fire('Autentificare necesară', 'Vă rugăm să vă conectați.', 'warning')
    router.push({ name: 'login' })
    return
  }
  await rStore.start(route.params.id)
  started.value = true
})

function saveAnswer(id, value, adminOnly) {
  rStore.save(id, value, adminOnly)
}

function toggleCheckbox(id, option, adminOnly) {
  const source = adminOnly ? rStore.adminAnswers : rStore.answers
  const current = Array.isArray(source[id]) ? [...source[id]] : []
  const idx = current.indexOf(option)
  if (idx > -1) current.splice(idx, 1)
  else current.push(option)
  saveAnswer(id, current, adminOnly)
}

async function submit() {
  await rStore.submit()
  await Swal.fire('Chestionar salvat', 'Puteți imprima sau modifica din lista de chestionare.', 'success')
  router.push({ name: 'questionnaires' })
}

const visibleSections = computed(() =>
  userStore.isAdmin ? qStore.sections : qStore.sections.filter((s) => !s.adminOnly)
)
</script>

<template>
  <div class="p-4" v-if="qStore.current">
    <div class="max-w-2xl mx-auto bg-white p-6 rounded shadow" v-if="started">
      <RouterLink to="/questionnaires" class="text-blue-600 underline mb-4 inline-block">
        &larr; Înapoi
      </RouterLink>
      <h1 class="text-2xl font-bold mb-4 text-center">{{ qStore.current.title }}</h1>
      <div
        v-for="section in visibleSections"
        :key="section.id"
        class="mb-6"
      >
        <h2 class="font-semibold mb-2">{{ section.title }}</h2>
        <div
          v-for="question in qStore.questionsBySection(section.id)"
          :key="question.id"
          class="mb-3"
        >
          <label class="block mb-1">{{ question.prompt }}</label>
          <div v-if="question.type === 'radio'">
            <div v-for="opt in question.options" :key="opt" class="mb-1">
              <label class="inline-flex items-center gap-2">
                <input
                  type="radio"
                  :name="question.id"
                  :value="opt"
                  :checked="(section.adminOnly ? rStore.adminAnswers[question.id] : rStore.answers[question.id]) === opt"
                  @change="saveAnswer(question.id, opt, section.adminOnly)"
                />
                <span>{{ opt }}</span>
              </label>
            </div>
          </div>
          <div v-else-if="question.type === 'checkbox'">
            <div v-for="opt in question.options" :key="opt" class="mb-1">
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  :value="opt"
                  :checked="(section.adminOnly ? rStore.adminAnswers[question.id] : rStore.answers[question.id] || []).includes(opt)"
                  @change="toggleCheckbox(question.id, opt, section.adminOnly)"
                />
                <span>{{ opt }}</span>
              </label>
            </div>
          </div>
          <div v-else>
            <input
              type="text"
              class="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :value="section.adminOnly ? rStore.adminAnswers[question.id] : rStore.answers[question.id]"
              @input="saveAnswer(question.id, $event.target.value, section.adminOnly)"
            />
          </div>
        </div>
      </div>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        @click="submit"
      >
        Trimite
      </button>
    </div>
  </div>
</template>
