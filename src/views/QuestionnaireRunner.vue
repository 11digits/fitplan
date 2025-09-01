<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { useResponseStore } from '../stores/responses'
import { useUserStore } from '../stores/user'

const route = useRoute()
const qStore = useQuestionnaireStore()
const rStore = useResponseStore()
const userStore = useUserStore()
const email = ref(route.query.email || '')
const started = ref(false)

onMounted(async () => {
  await qStore.fetchOne(route.params.id)
  if (email.value) {
    await rStore.start(route.params.id, email.value)
    started.value = true
  }
})

function begin() {
  if (!email.value) return
  rStore.start(route.params.id, email.value)
  started.value = true
}

function saveAnswer(id, value, adminOnly) {
  rStore.save(id, value, adminOnly)
}

function submit() {
  rStore.submit()
}

const visibleSections = computed(() =>
  userStore.isAdmin ? qStore.sections : qStore.sections.filter((s) => !s.adminOnly)
)
</script>

<template>
  <div class="p-4" v-if="qStore.current">
    <div v-if="!started" class="mb-4 max-w-sm">
      <label class="block mb-1">Email participant</label>
      <input
        v-model="email"
        type="email"
        class="border border-gray-300 rounded w-full mb-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        @click="begin"
      >
        Începe
      </button>
    </div>
    <div v-else>
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
