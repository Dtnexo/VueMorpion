<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLeaderboard } from '../composables/useLeaderboard'

const { addScore } = useLeaderboard('morpion')

// --- ÉTAT DU JEU ---
const gameStatus = ref('config')
const board = ref(Array(9).fill(null))
// Lecture automatique du pseudo
const playerPseudo = localStorage.getItem('playerPseudo') || 'Joueur'
const difficulty = ref('medium')
const currentPlayer = ref('X')
const winner = ref(null)
const winningLine = ref([])
const aiThinking = ref(false)

const startGame = () => {
  gameStatus.value = 'playing'
  resetBoard()
}

// ... (Reste de la logique de jeu identique : makeMove, makeAiMove, checkWin, etc.) ...
// Pour gagner de la place, je garde la logique IA identique à la version précédente
const makeMove = (index) => {
  if (board.value[index] || winner.value || aiThinking.value) return
  board.value[index] = 'X'
  if (checkWin('X')) {
    endGame('X')
  } else if (!board.value.includes(null)) {
    endGame('draw')
  } else {
    currentPlayer.value = 'O'
    aiThinking.value = true
    setTimeout(makeAiMove, 500)
  }
}

const makeAiMove = () => {
  let moveIndex = -1
  if (difficulty.value === 'easy') moveIndex = getRandomMove()
  else if (difficulty.value === 'medium') moveIndex = findBestMove(false)
  else moveIndex = getMinimaxMove()

  if (moveIndex !== -1) {
    board.value[moveIndex] = 'O'
    if (checkWin('O')) endGame('O')
    else if (!board.value.includes(null)) endGame('draw')
  }
  currentPlayer.value = 'X'
  aiThinking.value = false
}

// IA Logic helpers
const getRandomMove = () => {
  const available = board.value.map((v, i) => (v === null ? i : null)).filter((v) => v !== null)
  return available[Math.floor(Math.random() * available.length)]
}
const findBestMove = (useMinimax) => {
  for (let i = 0; i < 9; i++) {
    if (!board.value[i]) {
      board.value[i] = 'O'
      if (checkWin('O')) {
        board.value[i] = null
        return i
      }
      board.value[i] = null
    }
  }
  for (let i = 0; i < 9; i++) {
    if (!board.value[i]) {
      board.value[i] = 'X'
      if (checkWin('X')) {
        board.value[i] = null
        return i
      }
      board.value[i] = null
    }
  }
  return getRandomMove()
}
const getMinimaxMove = () => {
  let bestScore = -Infinity
  let move = -1
  for (let i = 0; i < 9; i++) {
    if (board.value[i] === null) {
      board.value[i] = 'O'
      let score = minimax(board.value, 0, false)
      board.value[i] = null
      if (score > bestScore) {
        bestScore = score
        move = i
      }
    }
  }
  return move
}
const minimax = (currentBoard, depth, isMaximizing) => {
  if (checkWin('O')) return 10 - depth
  if (checkWin('X')) return -10 + depth
  if (!currentBoard.includes(null)) return 0
  if (isMaximizing) {
    let bestScore = -Infinity
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O'
        bestScore = Math.max(minimax(currentBoard, depth + 1, false), bestScore)
        currentBoard[i] = null
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'X'
        bestScore = Math.min(minimax(currentBoard, depth + 1, true), bestScore)
        currentBoard[i] = null
      }
    }
    return bestScore
  }
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
const checkWin = (player) => {
  return winPatterns.some((pattern) => {
    if (pattern.every((index) => board.value[index] === player)) {
      if (gameStatus.value === 'playing' && !aiThinking.value && currentPlayer.value === player)
        winningLine.value = pattern
      return true
    }
    return false
  })
}

const endGame = async (result) => {
  winner.value = result
  gameStatus.value = 'finished'
  if (result === 'X') {
    let points = 50
    if (difficulty.value === 'medium') points = 100
    if (difficulty.value === 'hard') points = 200
    await addScore(playerPseudo, points, { difficulty: difficulty.value })
  }
}
const resetBoard = () => {
  board.value = Array(9).fill(null)
  currentPlayer.value = 'X'
  winner.value = null
  winningLine.value = []
}
</script>

<template>
  <div class="morpion-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">MORPION</span></div>
    </div>

    <!-- CONFIG (Plus d'input pseudo) -->
    <transition name="fade" mode="out-in">
      <div v-if="gameStatus === 'config'" class="card config-card" key="config">
        <h1>
          Bonjour, <span class="pseudo-display">{{ playerPseudo }}</span>
        </h1>
        <p class="subtitle-config">Prêt à affronter l'IA ?</p>

        <p class="label-diff">Choisis ta difficulté :</p>
        <div class="diff-select">
          <button @click="difficulty = 'easy'" :class="{ active: difficulty === 'easy' }">
            Facile
          </button>
          <button @click="difficulty = 'medium'" :class="{ active: difficulty === 'medium' }">
            Moyen
          </button>
          <button @click="difficulty = 'hard'" :class="{ active: difficulty === 'hard' }">
            Impossible
          </button>
        </div>
        <button class="etml-btn start-btn" @click="startGame">LANCER LE MATCH</button>
      </div>

      <!-- JEU -->
      <div v-else class="card game-card" key="game">
        <div class="hud">
          <div class="player p1 active">👤 {{ playerPseudo }} (X)</div>
          <div class="vs">VS</div>
          <div class="player p2" :class="{ thinking: aiThinking }">🤖 IA (O)</div>
        </div>

        <div class="board" :class="{ 'game-over': winner }">
          <div
            v-for="(cell, i) in board"
            :key="i"
            class="cell"
            :class="{ taken: cell, winner: winningLine.includes(i) }"
            @click="makeMove(i)"
          >
            <span v-if="cell">{{ cell === 'X' ? '❌' : '⭕' }}</span>
          </div>
        </div>

        <button @click="gameStatus = 'config'" class="etml-btn secondary">Abandonner</button>

        <div v-if="winner" class="overlay">
          <div class="modal">
            <h2 v-if="winner === 'X'">🎉 Gagné !</h2>
            <h2 v-else-if="winner === 'O'">💀 Perdu...</h2>
            <h2 v-else>🤝 Égalité</h2>
            <div class="actions">
              <button @click="startGame" class="etml-btn">Rejouer</button>
              <RouterLink to="/leaderboard" class="etml-btn outline">Classement</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <RouterLink to="/games" class="back-link">Retour Menu</RouterLink>
  </div>
</template>

<style scoped>
.morpion-container {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  font-family: sans-serif;
  padding: 20px;
}
.card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.pseudo-display {
  color: #005596;
  font-weight: bold;
}
.subtitle-config {
  color: #666;
  margin-bottom: 20px;
}
.label-diff {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.diff-select {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.diff-select button {
  flex: 1;
  padding: 12px;
  border: 2px solid #eee;
  background: #fff;
  cursor: pointer;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s;
}
.diff-select button:hover {
  border-color: #005596;
}
.diff-select button.active {
  background: #005596;
  color: white;
  border-color: #005596;
  box-shadow: 0 4px 10px rgba(0, 85, 150, 0.2);
}
.etml-btn {
  width: 100%;
  padding: 12px;
  background: #005596;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}
.etml-btn.secondary {
  background: transparent;
  color: #005596;
  border: 2px solid #005596;
  margin-top: 15px;
}
.etml-btn.outline {
  background: transparent;
  border: 1px solid #005596;
  color: #005596;
  margin-top: 5px;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0;
}
.cell {
  background: #f4f6f8;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border-radius: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.cell.winner {
  background: #d4edda;
  animation: pulse 1s infinite;
}
.hud {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: bold;
  color: #333;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  backdrop-filter: blur(2px);
}
.modal {
  background: white;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  min-width: 250px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
