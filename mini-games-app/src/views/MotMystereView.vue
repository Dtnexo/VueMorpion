<script setup>
import { ref, reactive, onMounted } from 'vue'

// Liste de mots (Thème : École/Tech/Général) - Mots de 5 lettres pour simplifier
const wordList = [
  'ECOLE',
  'CODEUR',
  'STAGE',
  'SOURIS',
  'ECRAN',
  'ROBOT',
  'PROJET',
  'LIVRE',
  'MATHS',
  'SPORT',
  'PAUSE',
]

const targetWord = ref('')
const currentGuess = ref('')
const guesses = ref([]) // Tableau des essais passés
const maxAttempts = 6
const gameState = ref('playing') // playing, won, lost
const message = ref('')

const initGame = () => {
  // Choisir un mot au hasard
  const random = wordList[Math.floor(Math.random() * wordList.length)]
  targetWord.value = random
  currentGuess.value = ''
  guesses.value = []
  gameState.value = 'playing'
  message.value = `Devinez le mot de ${random.length} lettres`
}

const submitGuess = () => {
  if (gameState.value !== 'playing') return

  const guess = currentGuess.value.toUpperCase()

  // Validation
  if (guess.length !== targetWord.value.length) {
    message.value = `Il faut ${targetWord.value.length} lettres !`
    return
  }

  // Analyse du mot (Vert/Jaune/Gris)
  const result = []
  const targetArr = targetWord.value.split('')
  const guessArr = guess.split('')

  // 1. Vérifier les lettres bien placées (VERT)
  guessArr.forEach((char, i) => {
    if (char === targetArr[i]) {
      result[i] = { char, status: 'correct' }
      targetArr[i] = null // Marquer comme utilisé
    } else {
      result[i] = { char, status: 'pending' } // Temporaire
    }
  })

  // 2. Vérifier les lettres mal placées (JAUNE)
  guessArr.forEach((char, i) => {
    if (result[i].status === 'pending') {
      const foundIndex = targetArr.indexOf(char)
      if (foundIndex !== -1) {
        result[i].status = 'present'
        targetArr[foundIndex] = null
      } else {
        result[i].status = 'absent'
      }
    }
  })

  guesses.value.push(result)
  currentGuess.value = ''

  // Vérification Victoire/Défaite
  if (guess === targetWord.value) {
    gameState.value = 'won'
    message.value = 'BRAVO ! 🎉'
  } else if (guesses.value.length >= maxAttempts) {
    gameState.value = 'lost'
    message.value = `Perdu... Le mot était ${targetWord.value}`
  }
}

onMounted(initGame)
</script>

<template>
  <div class="motus-container">
    <h1>🔡 Mot Mystère</h1>
    <p class="subtitle">Vert = Bien placé | Jaune = Bonne lettre</p>

    <div class="game-area">
      <!-- Grille des essais précédents -->
      <div class="grid">
        <div v-for="(attempt, i) in guesses" :key="i" class="row">
          <div v-for="(letterObj, j) in attempt" :key="j" class="tile" :class="letterObj.status">
            {{ letterObj.char }}
          </div>
        </div>

        <!-- Ligne actuelle (saisie en cours) -->
        <div v-if="gameState === 'playing'" class="row current">
          <div v-for="k in targetWord.length" :key="k" class="tile empty">
            {{ currentGuess[k - 1] || '' }}
          </div>
        </div>
      </div>

      <div class="controls" v-if="gameState === 'playing'">
        <input
          v-model="currentGuess"
          type="text"
          :maxlength="targetWord.length"
          @keyup.enter="submitGuess"
          autofocus
          placeholder="Tapez ici..."
        />
        <button @click="submitGuess" class="btn">Valider</button>
      </div>

      <div v-else class="end-screen">
        <h2>{{ message }}</h2>
        <button @click="initGame" class="btn restart">Rejouer</button>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Retour Menu</RouterLink>
  </div>
</template>

<style scoped>
.motus-container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}
.subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.tile {
  width: 50px;
  height: 50px;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  background: white;
}

/* Couleurs du jeu */
.tile.correct {
  background-color: #2a9d8f;
  color: white;
  border-color: #2a9d8f;
} /* Vert */
.tile.present {
  background-color: #e9c46a;
  color: white;
  border-color: #e9c46a;
} /* Jaune */
.tile.absent {
  background-color: #787c7e;
  color: white;
  border-color: #787c7e;
} /* Gris */
.tile.empty {
  border-color: #ddd;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}
input {
  padding: 10px;
  font-size: 1.2rem;
  width: 150px;
  text-transform: uppercase;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 6px;
}
.btn {
  background: #005596;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 6px;
  cursor: pointer;
}

.end-screen {
  margin-top: 20px;
  animation: pop 0.5s;
}
.btn.restart {
  background: #2a9d8f;
  padding: 10px 30px;
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.back-link {
  display: inline-block;
  margin-top: 30px;
  color: #888;
  text-decoration: none;
}
</style>
