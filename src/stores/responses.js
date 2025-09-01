import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase'
import {
  ref as dbRef,
  push,
  set,
  update
} from 'firebase/database'
import { useUserStore } from './user'

export const useResponseStore = defineStore('responses', () => {
  const userStore = useUserStore()
  const responseId = ref(null)
  const customerEmail = ref('')
  const answers = ref({})
  const adminAnswers = ref({})

  async function start(questionnaireId) {
    const email = userStore.profile?.email || ''
    const resRef = push(dbRef(db, 'responses'))
    responseId.value = resRef.key
    customerEmail.value = email
    answers.value = {}
    adminAnswers.value = {}
    await set(resRef, {
      questionnaireId,
      userId: userStore.authUser?.uid || null,
      customerEmail: email,
      createdAt: Date.now(),
      submittedAt: null,
      answers: {},
      adminAnswers: {}
    })
  }

  async function save(questionId, value, adminOnly = false) {
    if (!responseId.value) return
    const target = adminOnly ? adminAnswers : answers
    target.value[questionId] = value
    await update(
      dbRef(
        db,
        `responses/${responseId.value}/${adminOnly ? 'adminAnswers' : 'answers'}/${questionId}`
      ),
      {
        value,
        updatedAt: Date.now()
      }
    )
  }

  async function submit() {
    if (!responseId.value) return
    await update(dbRef(db, `responses/${responseId.value}`), {
      submittedAt: Date.now()
    })
  }

  return {
    responseId,
    customerEmail,
    answers,
    adminAnswers,
    start,
    save,
    submit
  }
})
