<script setup>
import { onMounted } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { RouterLink } from 'vue-router'

const qStore = useQuestionnaireStore()
onMounted(() => qStore.fetchPublished())
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Start Questionnaire</h1>
    <ul>
      <li v-for="q in qStore.published" :key="q.id" class="mb-2">
        <RouterLink :to="`/run/${q.id}`" class="text-blue-600 underline">
          {{ q.title }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
