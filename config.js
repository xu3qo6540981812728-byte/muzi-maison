// config.js
const firebaseConfig = {
    apiKey: "AIzaSyCrZX5PnfzLEAyxLBoHpuM59VoW3kXVxBY",
    authDomain: "muzi-maison-db.firebaseapp.com",
    projectId: "muzi-maison-db",
    storageBucket: "muzi-maison-db.firebasestorage.app",
    messagingSenderId: "270446372915",
    appId: "1:270446372915:web:905cd2e7153ab450e8db46"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();