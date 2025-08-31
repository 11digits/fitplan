import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase'
import {
  ref as dbRef,
  get,
  query,
  orderByChild,
  equalTo
} from 'firebase/database'

export const useQuestionnaireStore = defineStore('questionnaires', () => {
  const published = ref([])
  const current = ref(null)
  const sections = ref([])
  const questions = ref([])

  async function fetchPublished() {
    const snap = await get(query(dbRef(db, 'questionnaires'), orderByChild('status'), equalTo('published')))
    published.value = snap.exists()
      ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
      : []
  }

  async function fetchOne(id) {
    const qSnap = await get(dbRef(db, `questionnaires/${id}`))
    if (!qSnap.exists()) return
    current.value = { id, ...qSnap.val() }

    const sSnap = await get(query(dbRef(db, 'sections'), orderByChild('questionnaireId'), equalTo(id)))
    sections.value = sSnap.exists()
      ? Object.entries(sSnap.val()).map(([sid, v]) => ({ id: sid, ...v })).sort((a, b) => a.order - b.order)
      : []

    const qsSnap = await get(query(dbRef(db, 'questions'), orderByChild('sectionId')))
    const all = qsSnap.exists() ? Object.entries(qsSnap.val()).map(([qid, v]) => ({ id: qid, ...v })) : []
    questions.value = all.filter((q) => sections.value.some((s) => s.id === q.sectionId)).sort((a, b) => a.order - b.order)
  }

  function questionsBySection(sectionId) {
    return questions.value.filter((q) => q.sectionId === sectionId)
  }

  return { published, current, sections, questions, fetchPublished, fetchOne, questionsBySection }
})
