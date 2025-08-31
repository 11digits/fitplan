<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { useResponseStore } from '../stores/responses'
import { useUserStore } from '../stores/user'

const route = useRoute()
const qStore = useQuestionnaireStore()
const rStore = useResponseStore()
const userStore = useUserStore()

onMounted(async () => {
  await qStore.fetchOne(route.params.id)
  await rStore.start(route.params.id)
})

function saveAnswer(id, value) {
  rStore.save(id, value)
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
          v-model="rStore.answers[question.id]"
          @input="saveAnswer(question.id, rStore.answers[question.id])"
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
</template>
