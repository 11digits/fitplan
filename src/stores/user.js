import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { ref as dbRef, set, get } from 'firebase/database'

export const useUserStore = defineStore('user', () => {
  const authUser = ref(null)
  const profile = ref(null)

  async function fetchProfile(uid) {
    const snap = await get(dbRef(db, `users/${uid}`))
    profile.value = snap.exists() ? snap.val() : null
  }

  async function ensureDefaultAdmin() {
    try {
      await signInWithEmailAndPassword(auth, 'dorubrad@gmail.com', '123456')
      await set(dbRef(db, `users/${auth.currentUser.uid}`), {
        email: 'dorubrad@gmail.com',
        role: 'admin'
      })
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        await createUserWithEmailAndPassword(auth, 'dorubrad@gmail.com', '123456')
        await set(dbRef(db, `users/${auth.currentUser.uid}`), {
          email: 'dorubrad@gmail.com',
          role: 'admin'
        })
      }
    } finally {
      if (auth.currentUser) await signOut(auth)
    }
  }

  onAuthStateChanged(auth, async (u) => {
    authUser.value = u
    if (u) await fetchProfile(u.uid)
    else profile.value = null
  })

  ensureDefaultAdmin()

  async function register(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await set(dbRef(db, `users/${cred.user.uid}`), { email, role: 'customer' })
    await fetchProfile(cred.user.uid)
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await fetchProfile(cred.user.uid)
  }

  async function logout() {
    await signOut(auth)
    authUser.value = null
    profile.value = null
  }

  const isAdmin = computed(() => profile.value?.role === 'admin')

  return { authUser, profile, isAdmin, register, login, logout }
})
