<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  <div class="p-4 max-w-2xl mx-auto" v-if="qStore.current">
  <div v-if="started">
    <h1 class="text-2xl font-bold mb-4">{{ qStore.current.title }}</h1>
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
        <input
          type="text"
          class="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :value="section.adminOnly ? rStore.adminAnswers[question.id] : rStore.answers[question.id]"
          @input="saveAnswer(question.id, $event.target.value, section.adminOnly)"
        />
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
