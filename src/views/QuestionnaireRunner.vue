<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionnaireStore } from '../stores/questionnaires'
import { useResponseStore } from '../stores/responses'
import { useUserStore } from '../stores/user'
import Swal from 'sweetalert2'
import { db } from '../firebase'
import { ref as dbRef, query, orderByChild, equalTo, get } from 'firebase/database'

const route = useRoute()
const router = useRouter()
const qStore = useQuestionnaireStore()
const rStore = useResponseStore()
const userStore = useUserStore()
const email = ref(route.query.email || '')
const started = ref(false)

onMounted(async () => {
  await qStore.fetchOne(route.params.id)
  if (email.value) {
    await begin()
  }
})

async function begin() {
  if (!email.value) {
    Swal.fire('Email lipsă', 'Vă rugăm introduceți adresa de email.', 'warning')
    return
  }

  const userSnap = await get(
    query(dbRef(db, 'users'), orderByChild('email'), equalTo(email.value))
  )

  if (userSnap.exists() && !userStore.authUser) {
    const { value: password } = await Swal.fire({
      title: 'Parolă necesară',
      input: 'password',
      inputPlaceholder: 'Introduceți parola',
      inputAttributes: { autocapitalize: 'off', autocomplete: 'new-password' },
      showCancelButton: true
    })
    if (!password) return
    try {
      await userStore.login(email.value, password)
    } catch (e) {
      Swal.fire('Autentificare eșuată', e.message, 'error')
      return
    }
  } else if (!userSnap.exists()) {
    const { value: password } = await Swal.fire({
      title: 'Creați cont',
      text: 'Nu există cont pentru acest email. Creați o parolă pentru a continua.',
      input: 'password',
      inputPlaceholder: 'Parolă',
      inputAttributes: { autocapitalize: 'off', autocomplete: 'new-password' },
      showCancelButton: true
    })
    if (!password) return
    try {
      await userStore.register(email.value, password)
    } catch (e) {
      Swal.fire('Înregistrare eșuată', e.message, 'error')
      return
    }
  }

  await rStore.start(route.params.id, email.value)
  started.value = true
}

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
  <div class="p-4" v-if="qStore.current">
    <div
      v-if="!started"
      class="max-w-md mx-auto mt-4 shadow-lg rounded-lg overflow-hidden"
    >
      <div class="bg-slate-800 text-white text-center py-4 text-2xl font-bold">
        Start chestionar
      </div>
      <div class="p-6 bg-white">
        <label class="block mb-2 font-semibold">Email participant</label>
        <input
          v-model="email"
          type="email"
          class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          @click="begin"
        >
          Începe
        </button>
      </div>
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
