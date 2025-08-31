import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const auth = getAuth()
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
