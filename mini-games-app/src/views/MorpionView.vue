<script setup>
import { ref, computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'

// --- ÉTAT DU JEU ---
const gameStarted = ref(false)
const board = ref(Array(9).fill(null))
const currentPlayerInternal = ref('X')
const winnerInternal = ref(null)
const winningLine = ref([]) // Pour stocker les indices de la ligne gagnante
const scores = reactive({ p1: 0, p2: 0, draw: 0 })

// --- CONFIGURATION ---
const p1Config = reactive({ name: 'Visiteur', symbol: '❌' })
const p2Config = reactive({ name: 'Élève ETML', symbol: '⭕️' })
const suggestedSymbols = ['❌', '⭕️', '💻', '⚙️', '🎓', '🚀', '⚡', '🤖', '📐', '🧠']

// --- COMPUTED ---
const currentPlayerDisplay = computed(() => {
  return currentPlayerInternal.value === 'X' ? p1Config : p2Config
})

const winnerName = computed(() => {
  if (winnerInternal.value === 'X') return p1Config.name
  if (winnerInternal.value === 'O') return p2Config.name
  return null
})

// --- FONCTIONS ---
const startGame = () => {
  if (!p1Config.name.trim()) p1Config.name = 'Joueur 1'
  if (!p2Config.name.trim()) p2Config.name = 'Joueur 2'
  gameStarted.value = true
  resetBoard()
}

const makeMove = (index) => {
  if (board.value[index] || winnerInternal.value) return
  board.value[index] = currentPlayerInternal.value
  checkWinner()
  if (!winnerInternal.value) {
    currentPlayerInternal.value = currentPlayerInternal.value === 'X' ? 'O' : 'X'
  }
}

const getSymbolForCell = (cellValue) => {
  if (cellValue === 'X') return p1Config.symbol
  if (cellValue === 'O') return p2Config.symbol
  return null
}

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const checkWinner = () => {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winnerInternal.value = board.value[a]
      winningLine.value = pattern // On stocke la ligne gagnante

      // Mise à jour des scores
      if (board.value[a] === 'X') scores.p1++
      else scores.p2++
      return
    }
  }
  if (!board.value.includes(null)) {
    winnerInternal.value = 'Égalité'
    scores.draw++
  }
}

const resetBoard = () => {
  board.value = Array(9).fill(null)
  currentPlayerInternal.value = 'X'
  winnerInternal.value = null
  winningLine.value = []
}

const backToSetup = () => {
  gameStarted.value = false
  resetBoard()
  scores.p1 = 0
  scores.p2 = 0
  scores.draw = 0
}
</script>

<template>
  <div class="morpion-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">ARCADE</span></div>
    </div>

    <!-- CONFIGURATION -->
    <transition name="fade" mode="out-in">
      <div v-if="!gameStarted" class="card setup-card" key="setup">
        <h1>Morpion</h1>
        <p class="intro-text">Qui affrontez-vous ?</p>

        <div class="players-grid">
          <div class="player-input-group">
            <div class="player-label" style="color: var(--etml-blue)">Joueur 1</div>
            <input v-model="p1Config.name" type="text" placeholder="Nom" />
            <select v-model="p1Config.symbol">
              <option v-for="s in suggestedSymbols" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="versus-icon">VS</div>
          <div class="player-input-group">
            <div class="player-label" style="color: var(--etml-red)">Joueur 2</div>
            <input v-model="p2Config.name" type="text" placeholder="Nom" />
            <select v-model="p2Config.symbol">
              <option
                v-for="s in suggestedSymbols.filter((sym) => sym !== p1Config.symbol)"
                :key="s"
                :value="s"
              >
                {{ s }}
              </option>
            </select>
          </div>
        </div>
        <button class="etml-btn start-btn" @click="startGame">Lancer le duel</button>
      </div>

      <!-- JEU -->
      <div v-else class="card game-card" key="game">
        <!-- Tableau des scores -->
        <div class="scoreboard">
          <div class="score-pill p1">{{ p1Config.name }}: {{ scores.p1 }}</div>
          <div class="score-pill draw">Nul: {{ scores.draw }}</div>
          <div class="score-pill p2">{{ p2Config.name }}: {{ scores.p2 }}</div>
        </div>

        <div class="game-header">
          <div class="turn-indicator" :class="{ 'turn-p2': currentPlayerInternal === 'O' }">
            Tour : <strong>{{ currentPlayerDisplay.name }}</strong>
          </div>
        </div>

        <div class="board" :class="{ 'game-over': winnerInternal }">
          <div
            v-for="(cellInternalValue, index) in board"
            :key="index"
            class="cell"
            :class="{
              taken: cellInternalValue,
              'winning-cell': winningLine.includes(index),
            }"
            @click="makeMove(index)"
          >
            <transition name="pop">
              <span v-if="cellInternalValue" class="cell-symbol">{{
                getSymbolForCell(cellInternalValue)
              }}</span>
            </transition>
          </div>
        </div>

        <!-- Overlay Résultats -->
        <transition name="fade">
          <div v-if="winnerInternal" class="result-overlay">
            <div class="result-box">
              <h2 v-if="winnerInternal === 'Égalité'">🤝 Égalité</h2>
              <h2 v-else>🏆 {{ winnerName }} gagne !</h2>

              <div class="actions">
                <button @click="resetBoard" class="etml-btn">Revanche</button>
                <button @click="backToSetup" class="etml-btn secondary">Quitter</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <RouterLink to="/" class="back-link">Retour Menu</RouterLink>
  </div>
</template>

<style scoped>
/* COULEURS ETML */
:root {
  --etml-blue: #005596;
  --etml-red: #e63946;
}
.morpion-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Scoreboard */
.scoreboard {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}
.score-pill {
  background: #eee;
  padding: 5px 10px;
  border-radius: 20px;
}
.score-pill.p1 {
  color: var(--etml-blue);
  background: #e3f2fd;
}
.score-pill.p2 {
  color: var(--etml-red);
  background: #ffebee;
}

/* Config Inputs */
.players-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}
.player-input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 45%;
}
input,
select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
}

/* Jeu */
.turn-indicator {
  padding: 8px 20px;
  background: #f0f7ff;
  color: var(--etml-blue);
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 15px;
}
.turn-indicator.turn-p2 {
  background: #fff0f0;
  color: var(--etml-red);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #eee;
  padding: 8px;
  border-radius: 10px;
}
.cell {
  background: white;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.cell.taken {
  cursor: default;
}

/* Animation Ligne Gagnante */
.cell.winning-cell {
  background-color: #d4edda;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Boutons */
.etml-btn {
  background: var(--etml-blue);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
}
.etml-btn.secondary {
  background: transparent;
  border: 2px solid var(--etml-blue);
  color: var(--etml-blue);
  margin-top: 10px;
}

/* Overlay */
.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.back-link {
  display: block;
  margin-top: 20px;
  color: #666;
  text-decoration: none;
}
</style>
