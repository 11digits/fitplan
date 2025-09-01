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
  if (userStore.isAdmin) {
    await rStore.start(route.params.id, userStore.profile?.email || '')
    started.value = true
  } else if (email.value) {
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
    <div v-if="!started && !userStore.isAdmin" class="mb-4 max-w-sm">
      <label class="block mb-1">Email</label>
      <input v-model="email" type="email" class="border p-2 rounded w-full mb-2" />
      <button class="bg-blue-600 text-white px-4 py-2 rounded" @click="begin">
        Start
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
            class="border rounded w-full p-2"
            :value="section.adminOnly ? rStore.adminAnswers[question.id] : rStore.answers[question.id]"
            @input="saveAnswer(question.id, $event.target.value, section.adminOnly)"
          />
        </div>
      </div>
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded"
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>
