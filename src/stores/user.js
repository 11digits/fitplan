import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  onAuthStateChanged(auth, (u) => (user.value = u))

  function signInAnon() {
    return signInAnonymously(auth)
  }

  function signOutUser() {
    return signOut(auth)
  }

  return { user, signInAnon, signOut: signOutUser }
})
