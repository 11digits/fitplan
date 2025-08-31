import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase'
import {
  ref as dbRef,
  push,
  set,
  update
} from 'firebase/database'
import jsPDF from 'jspdf'
import { useUserStore } from './user'
import { useQuestionnaireStore } from './questionnaires'

export const useResponseStore = defineStore('responses', () => {
  const userStore = useUserStore()
  const qStore = useQuestionnaireStore()
  const responseId = ref(null)
  const answers = ref({})

  async function start(questionnaireId) {
    const resRef = push(dbRef(db, 'responses'))
    responseId.value = resRef.key
    await set(resRef, {
      questionnaireId,
      userId: userStore.authUser?.uid || null,
      createdAt: Date.now(),
      submittedAt: null,
      answers: {}
    })
  }

  async function save(questionId, value) {
    if (!responseId.value) return
    answers.value[questionId] = value
    await update(dbRef(db, `responses/${responseId.value}/answers/${questionId}`), {
      value,
      updatedAt: Date.now()
    })
  }

  async function submit() {
    if (!responseId.value) return
    await update(dbRef(db, `responses/${responseId.value}`), {
      submittedAt: Date.now()
    })

    const doc = new jsPDF()
    let y = 10
    doc.setFontSize(16)
    if (qStore.current) {
      doc.text(qStore.current.title || 'Response', 10, y)
      y += 10
    }
    doc.setFontSize(12)
    for (const section of qStore.sections) {
      if (section.adminOnly && !userStore.isAdmin) continue
      if (y > 270) {
        doc.addPage()
        y = 10
      }
      doc.setFont(undefined, 'bold')
      doc.text(section.title, 10, y)
      y += 8
      doc.setFont(undefined, 'normal')
      for (const q of qStore.questionsBySection(section.id)) {
        const ans = answers.value[q.id] ?? ''
        const line = `${q.prompt}: ${ans}`
        const lines = doc.splitTextToSize(line, 190)
        for (const l of lines) {
          if (y > 280) {
            doc.addPage()
            y = 10
          }
          doc.text(l, 10, y)
          y += 7
        }
      }
      y += 4
    }
    doc.save('response.pdf')
  }

  return { responseId, answers, start, save, submit }
})
