<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLeaderboard } from '../composables/useLeaderboard'

const { addScore } = useLeaderboard('connect4')

// --- CONFIG ---
const ROWS = 6
const COLS = 7
const EMPTY = 0
const P1 = 1
const AI = 2

// --- ÉTAT ---
const gameStarted = ref(false)
const board = ref([])
// Récupération automatique du pseudo
const playerPseudo = localStorage.getItem('playerPseudo') || 'Joueur'
const difficulty = ref('medium')
const currentPlayer = ref(P1)
const winner = ref(null)
const winningCells = ref([])
const aiThinking = ref(false)

const startGame = () => {
  // Reset complet
  board.value = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY))
  gameStarted.value = true
  winner.value = null
  winningCells.value = []
  currentPlayer.value = P1
  aiThinking.value = false
}

const backToSetup = () => {
  gameStarted.value = false
}

// --- JEU ---
const dropPiece = (col) => {
  // Sécurités anti-clic
  if (!gameStarted.value || winner.value || aiThinking.value || currentPlayer.value !== P1) return

  if (placeToken(col, P1)) {
    if (checkWin(P1)) {
      handleWin(P1)
    } else if (checkDraw()) {
      handleWin('draw')
    } else {
      // Tour IA
      currentPlayer.value = AI
      aiThinking.value = true
      setTimeout(aiTurn, 600)
    }
  }
}

const placeToken = (col, player) => {
  // On cherche la case vide la plus basse
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board.value[r][col] === EMPTY) {
      board.value[r][col] = player
      return true
    }
  }
  return false
}

// --- IA ---
const aiTurn = () => {
  let col = -1

  if (difficulty.value === 'easy') {
    col = getRandomValidCol()
  } else {
    // Tente de gagner ou bloquer
    col = findBestCol()
  }

  // Si aucune colonne trouvée par stratégie, random
  if (col === -1) col = getRandomValidCol()

  if (col !== -1) {
    placeToken(col, AI)
    if (checkWin(AI)) handleWin(AI)
    else if (checkDraw()) handleWin('draw')
    else currentPlayer.value = P1
  }

  aiThinking.value = false
}

const getRandomValidCol = () => {
  const valids = []
  for (let c = 0; c < COLS; c++) if (board.value[0][c] === EMPTY) valids.push(c)
  if (valids.length === 0) return -1
  return valids[Math.floor(Math.random() * valids.length)]
}

const findBestCol = () => {
  // 1. Gagner immédiatement
  for (let c = 0; c < COLS; c++) {
    if (canPlay(c)) {
      placeToken(c, AI)
      if (checkWin(AI)) {
        undo(c)
        return c
      }
      undo(c)
    }
  }
  // 2. Bloquer le joueur
  for (let c = 0; c < COLS; c++) {
    if (canPlay(c)) {
      placeToken(c, P1)
      if (checkWin(P1)) {
        undo(c)
        return c
      }
      undo(c)
    }
  }
  return -1
}

const canPlay = (c) => board.value[0][c] === EMPTY
const undo = (c) => {
  for (let r = 0; r < ROWS; r++)
    if (board.value[r][c] !== EMPTY) {
      board.value[r][c] = EMPTY
      return
    }
}

// --- VICTOIRE ---
const checkWin = (p) => {
  // Horizontale, Verticale, Diagonales
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board.value[r][c] === p) {
        for (let [dr, dc] of dirs) {
          if (
            r + 3 * dr < ROWS &&
            r + 3 * dr >= 0 &&
            c + 3 * dc < COLS &&
            c + 3 * dc >= 0 &&
            board.value[r + dr][c + dc] === p &&
            board.value[r + 2 * dr][c + 2 * dc] === p &&
            board.value[r + 3 * dr][c + 3 * dc] === p
          ) {
            winningCells.value = [
              [r, c],
              [r + dr, c + dc],
              [r + 2 * dr, c + 2 * dc],
              [r + 3 * dr, c + 3 * dc],
            ]
            return true
          }
        }
      }
    }
  }
  return false
}

const checkDraw = () => board.value[0].every((c) => c !== EMPTY)

const handleWin = async (res) => {
  winner.value = res
  if (res === P1) {
    let pts = difficulty.value === 'hard' ? 300 : difficulty.value === 'medium' ? 150 : 50
    await addScore(playerPseudo, pts, { difficulty: difficulty.value })
  }
}

const isWinningCell = (r, c) => {
  return winningCells.value.some(([wr, wc]) => wr === r && wc === c)
}
</script>

<template>
  <div class="c4-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">PUISSANCE 4</span></div>
    </div>

    <transition name="fade" mode="out-in">
      <!-- SETUP -->
      <div v-if="!gameStarted" class="card setup-card" key="setup">
        <h1>Duel Arc-en-ciel</h1>
        <p class="intro-text">
          Bonjour <strong>{{ playerPseudo }}</strong>
        </p>

        <p class="label-diff">Choisis ta difficulté :</p>
        <div class="diff-select">
          <button @click="difficulty = 'easy'" :class="{ active: difficulty === 'easy' }">
            Facile
          </button>
          <button @click="difficulty = 'medium'" :class="{ active: difficulty === 'medium' }">
            Moyen
          </button>
          <button @click="difficulty = 'hard'" :class="{ active: difficulty === 'hard' }">
            Difficile
          </button>
        </div>

        <button class="etml-btn start-btn" @click="startGame">LANCER LE MATCH</button>
      </div>

      <!-- JEU -->
      <div v-else class="game-area" key="game">
        <div class="game-hud">
          <div class="player-tag p1" :class="{ active: currentPlayer === P1 }">
            <span class="dot"></span> {{ playerPseudo }}
          </div>
          <div class="game-status">{{ winner ? 'FINI' : 'VS' }}</div>
          <div class="player-tag p2" :class="{ active: currentPlayer === AI }">
            <span class="dot"></span> IA {{ aiThinking ? '...' : '' }}
          </div>
        </div>

        <div class="board-container">
          <!-- COUCHE CLIC : Z-INDEX TRÈS ÉLEVÉ POUR PASSER AU DESSUS -->
          <div class="click-layer">
            <div
              v-for="col in COLS"
              :key="col"
              class="col-trigger"
              @click="dropPiece(col - 1)"
            ></div>
          </div>

          <div class="board-visual">
            <div v-for="(row, rIndex) in board" :key="rIndex" class="row">
              <div v-for="(cell, cIndex) in row" :key="cIndex" class="cell">
                <div class="hole-mask"></div>
                <transition name="drop">
                  <div
                    v-if="cell !== EMPTY"
                    class="piece"
                    :class="{
                      'is-p1': cell === P1,
                      'is-p2': cell === AI,
                      'is-winner': isWinningCell(rIndex, cIndex),
                    }"
                    :style="{ '--row-depth': rIndex }"
                  ></div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <transition name="pop">
          <div v-if="winner" class="result-modal">
            <div class="modal-content">
              <h2 v-if="winner === 'draw'">🤝 Match Nul !</h2>
              <h2 v-else-if="winner === P1">🏆 Victoire !</h2>
              <h2 v-else>🤖 L'IA a gagné</h2>
              <div class="modal-actions">
                <button @click="startGame" class="etml-btn">Rejouer</button>
                <button @click="backToSetup" class="etml-btn secondary">Menu Principal</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
    <RouterLink to="/games" class="back-link">Retour au menu</RouterLink>
  </div>
</template>

<style scoped>
.c4-container {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  padding: 20px;
}
.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 85, 150, 0.15);
}
.diff-select {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}
.diff-select button {
  flex: 1;
  padding: 12px;
  border: 2px solid #eee;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.diff-select button.active {
  background: #005596;
  color: white;
  border-color: #005596;
}
.etml-btn {
  background: #005596;
  color: white;
  padding: 14px 30px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  width: 100%;
  border: none;
}
.etml-btn.secondary {
  background: transparent;
  border: 2px solid #005596;
  color: #005596;
  margin-top: 10px;
}

/* HUD */
.game-hud {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  background: white;
  padding: 10px 30px;
  border-radius: 50px;
  font-weight: bold;
}
.player-tag.active {
  text-decoration: underline;
  color: #005596;
}

/* PLATEAU */
.board-container {
  position: relative;
  display: inline-block;
  padding-top: 20px;
}

/* FIX DU BUG : La couche de clic doit couvrir TOUT et être au dessus */
.click-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 100; /* Très haut pour être sûr de capter le clic */
}
.col-trigger {
  flex: 1;
  cursor: pointer;
}
.col-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.board-visual {
  background-color: #005596;
  padding: 15px;
  border-radius: 20px;
  display: inline-block;
  position: relative;
}
.row {
  display: flex;
}
.cell {
  width: 50px;
  height: 50px;
  margin: 5px;
  position: relative;
  background: #003f73;
  border-radius: 50%;
}
.hole-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 10;
  pointer-events: none;
}
.piece {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  z-index: 1;
}
.piece.is-p1 {
  background: #e63946;
}
.piece.is-p2 {
  background: #f4d35e;
}
.piece.is-winner {
  border: 3px solid white;
  z-index: 20;
  animation: flash 0.5s infinite;
}

.drop-enter-active {
  animation: drop-anim 0.4s cubic-bezier(0.5, 0, 0.5, 1);
}
@keyframes drop-anim {
  0% {
    transform: translateY(-300px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes flash {
  from {
    filter: brightness(1);
  }
  to {
    filter: brightness(1.4);
  }
}

.result-modal {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(2px);
  border-radius: 20px;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  border: 2px solid #005596;
  min-width: 250px;
}
.back-link {
  display: inline-block;
  margin-top: 30px;
  color: #888;
  text-decoration: none;
}
</style>
