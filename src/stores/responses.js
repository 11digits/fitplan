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
import html2canvas from 'html2canvas'
import { useUserStore } from './user'

export const useResponseStore = defineStore('responses', () => {
  const userStore = useUserStore()
  const responseId = ref(null)
  const answers = ref({})

  async function start(questionnaireId) {
    const resRef = push(dbRef(db, 'responses'))
    responseId.value = resRef.key
    await set(resRef, {
      questionnaireId,
      userId: userStore.user?.uid || null,
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
    const element = document.body
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const imgProps = doc.getImageProperties(imgData)
    const pdfWidth = doc.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    doc.save('response.pdf')
  }

  return { responseId, answers, start, save, submit }
})
