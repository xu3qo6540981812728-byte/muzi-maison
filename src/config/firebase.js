import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCrZX5PnfzLEAyxLBoHpuM59VoW3kXVxBY",
  authDomain: "muzi-maison-db.firebaseapp.com",
  projectId: "muzi-maison-db",
  storageBucket: "muzi-maison-db.firebasestorage.app",
  messagingSenderId: "270446372915",
  appId: "1:270446372915:web:905cd2e7153ab450e8db46"
}

if (!firebase.apps.length && !firebaseConfig.apiKey.includes("請填入")) {
  firebase.initializeApp(firebaseConfig)
}

export const db = firebase.apps.length ? firebase.firestore() : null
export const auth = firebase.apps.length ? firebase.auth() : null
export const storage = firebase.apps.length ? firebase.storage() : null
export default firebase
