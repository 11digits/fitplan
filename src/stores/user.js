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
  // hydrate from localStorage so routing guards work before Firebase init
  const storedUser = localStorage.getItem('authUser')
  const storedProfile = localStorage.getItem('profile')
  const authUser = ref(storedUser ? JSON.parse(storedUser) : null)
  const profile = ref(storedProfile ? JSON.parse(storedProfile) : null)

  async function fetchProfile(uid) {
    const snap = await get(dbRef(db, `users/${uid}`))
    profile.value = snap.exists() ? snap.val() : null
    if (profile.value) {
      localStorage.setItem('profile', JSON.stringify(profile.value))
    }
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
    if (u) {
      localStorage.setItem(
        'authUser',
        JSON.stringify({ uid: u.uid, email: u.email })
      )
      await fetchProfile(u.uid)
    } else {
      profile.value = null
      localStorage.removeItem('authUser')
      localStorage.removeItem('profile')
    }
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
    localStorage.removeItem('authUser')
    localStorage.removeItem('profile')
  }

  const isAdmin = computed(() => profile.value?.role === 'admin')

  return { authUser, profile, isAdmin, register, login, logout }
})
