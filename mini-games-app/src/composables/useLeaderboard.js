import { ref } from 'vue'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

// --- CONFIGURATION FIREBASE ---
// 1. Si vous êtes en local, collez vos clés Firebase ici :
const localConfig = {
  apiKey: 'VOTRE_API_KEY',
  authDomain: 'VOTRE_PROJET.firebaseapp.com',
  projectId: 'VOTRE_PROJECT_ID', // L'erreur vient du fait que ceci est manquant
  storageBucket: 'VOTRE_PROJET.firebasestorage.app',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID',
}

// 2. Détection de l'environnement (Preview vs Local)
let firebaseConfig
try {
  // Essaie de charger la config de l'environnement (Preview)
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config)
  } else {
    // Sinon utilise la config locale (à remplir)
    console.warn('Utilisation de la configuration Firebase locale.')
    firebaseConfig = localConfig
  }
} catch (e) {
  console.error('Erreur de configuration Firebase:', e)
  firebaseConfig = localConfig
}

// Initialisation
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'

// État utilisateur
const currentUser = ref(null)

// Connexion anonyme automatique
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
})

const initAuth = async () => {
  if (!currentUser.value) {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      // Logique spécifique si token fourni
    } else {
      try {
        await signInAnonymously(auth)
      } catch (e) {
        console.error("Erreur d'authentification anonyme:", e)
      }
    }
  }
}

initAuth()

// --- FONCTIONS DU CLASSEMENT ---

export function useLeaderboard(gameId) {
  const scores = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Récupérer les scores en temps réel
  const fetchScores = () => {
    // Si la config est invalide (ex: pas de projectId), on arrête ici pour éviter le crash
    if (
      !firebaseConfig ||
      !firebaseConfig.projectId ||
      firebaseConfig.projectId === 'VOTRE_PROJECT_ID'
    ) {
      console.warn('Firebase non configuré. Les scores ne seront pas chargés.')
      return () => {}
    }

    if (!currentUser.value) return () => {} // Attendre l'auth ou retourner fonction vide

    loading.value = true
    try {
      const scoresRef = collection(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        `leaderboard_${gameId}`,
      )

      const unsubscribe = onSnapshot(
        scoresRef,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          // Tri simple côté client
          data.sort((a, b) => b.score - a.score)

          scores.value = data.slice(0, 50)
          loading.value = false
        },
        (err) => {
          console.error('Erreur lecture scores:', err)
          error.value = 'Impossible de charger le classement.'
          loading.value = false
        },
      )

      return unsubscribe
    } catch (err) {
      console.error('Erreur connexion Firestore:', err)
      return () => {}
    }
  }

  // Ajouter un score
  const addScore = async (pseudo, score, extraData = {}) => {
    if (
      !firebaseConfig ||
      !firebaseConfig.projectId ||
      firebaseConfig.projectId === 'VOTRE_PROJECT_ID'
    ) {
      console.warn('Score non sauvegardé (Firebase non configuré)')
      return false
    }

    if (!currentUser.value) await initAuth()

    try {
      const scoresRef = collection(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        `leaderboard_${gameId}`,
      )
      await addDoc(scoresRef, {
        pseudo: pseudo || 'Anonyme',
        score: score,
        userId: currentUser.value ? currentUser.value.uid : 'anon',
        timestamp: serverTimestamp(),
        ...extraData,
      })
      return true
    } catch (err) {
      console.error('Erreur ajout score:', err)
      error.value = 'Erreur lors de la sauvegarde.'
      return false
    }
  }

  return {
    scores,
    loading,
    error,
    fetchScores,
    addScore,
    currentUser,
  }
}
