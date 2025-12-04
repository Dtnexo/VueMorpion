<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
// CORRECTION : Utilisation de esm.sh pour éviter les erreurs CORS
import { Chess } from 'https://esm.sh/chess.js@1.0.0-beta.8'

// --- ÉTAT DU JEU ---
const game = ref(new Chess())
const board = ref([])
const selectedSquare = ref(null)
const possibleMoves = ref([])
const gameStatus = ref('config') // config, playing, finished
const winner = ref(null) // 'white', 'black', 'draw'
const difficulty = ref('medium') // easy, medium, hard
const playerColor = 'w' // Le joueur est toujours les Blancs pour l'instant
const aiThinking = ref(false)
const capturedByPlayer = ref([])
const capturedByAI = ref([])

// Dictionnaire des pièces Unicode
const pieceIcons = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
}

// Valeur des pièces pour l'IA
const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 }

// --- INITIALISATION ---
const initGame = () => {
  game.value = new Chess()
  updateBoard()
  gameStatus.value = 'playing'
  winner.value = null
  capturedByPlayer.value = []
  capturedByAI.value = []
  selectedSquare.value = null
  possibleMoves.value = []
}

const updateBoard = () => {
  board.value = game.value.board()
}

// --- GESTION DU CLIC ---
const handleSquareClick = (rowIndex, colIndex) => {
  if (gameStatus.value !== 'playing' || aiThinking.value) return

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
  const square = files[colIndex] + ranks[rowIndex]

  // Si on clique sur une de nos pièces
  const piece = game.value.get(square)

  // 1. Sélectionner une pièce
  if (piece && piece.color === playerColor) {
    if (selectedSquare.value === square) {
      // Désélectionner si on clique dessus à nouveau
      selectedSquare.value = null
      possibleMoves.value = []
    } else {
      selectedSquare.value = square
      // Récupérer les coups possibles pour cette case
      const moves = game.value.moves({ square: square, verbose: true })
      possibleMoves.value = moves.map((m) => m.to)
    }
    return
  }

  // 2. Déplacer vers une case vide ou capturer
  if (selectedSquare.value) {
    const moveAttempt = {
      from: selectedSquare.value,
      to: square,
      promotion: 'q', // Toujours promouvoir en Reine pour simplifier
    }

    try {
      const move = game.value.move(moveAttempt)
      if (move) {
        // Coup valide !
        handleCapture(move)
        updateBoard()
        selectedSquare.value = null
        possibleMoves.value = []

        if (checkGameOver()) return

        // Tour de l'IA
        aiThinking.value = true
        setTimeout(() => makeAiMove(), 500) // Petit délai pour le réalisme
      }
    } catch (e) {
      // Coup invalide, on ne fait rien (ou on désélectionne)
      selectedSquare.value = null
      possibleMoves.value = []
    }
  }
}

const handleCapture = (move) => {
  if (move.captured) {
    if (move.color === playerColor) {
      capturedByPlayer.value.push(move.captured)
    } else {
      capturedByAI.value.push(move.captured)
    }
  }
}

const checkGameOver = () => {
  if (game.value.isGameOver()) {
    gameStatus.value = 'finished'
    if (game.value.isCheckmate()) {
      winner.value = game.value.turn() === 'w' ? 'black' : 'white'
    } else {
      winner.value = 'draw'
    }
    return true
  }
  return false
}

// --- INTELLIGENCE ARTIFICIELLE ---
const makeAiMove = () => {
  const moves = game.value.moves({ verbose: true })
  if (moves.length === 0) return

  let chosenMove = null

  if (difficulty.value === 'easy') {
    // Hasard total
    chosenMove = moves[Math.floor(Math.random() * moves.length)]
  } else if (difficulty.value === 'medium') {
    // Essaie de capturer, sinon hasard
    // Trie les coups par valeur de capture
    moves.sort((a, b) => {
      const valA = a.captured ? pieceValues[a.captured] : 0
      const valB = b.captured ? pieceValues[b.captured] : 0
      return valB - valA
    })
    // Prend un des meilleurs coups (pour varier un peu)
    chosenMove = moves[0]
  } else {
    // "Hard" (Minimax simple profondeur 2)
    let bestScore = -Infinity
    for (const move of moves) {
      game.value.move(move)
      const score = -evaluateBoard(1) // On regarde la réponse de l'adversaire
      game.value.undo()
      if (score > bestScore) {
        bestScore = score
        chosenMove = move
      }
    }
  }

  // Exécuter le coup choisi
  const moveResult = game.value.move(chosenMove)
  handleCapture(moveResult)
  updateBoard()
  checkGameOver()
  aiThinking.value = false
}

// Fonction d'évaluation simple pour l'IA
const evaluateBoard = (depth) => {
  if (depth === 0) {
    let score = 0
    const boardArr = game.value.board()
    for (let row of boardArr) {
      for (let piece of row) {
        if (piece) {
          const val = pieceValues[piece.type]
          score += piece.color === 'b' ? val : -val
        }
      }
    }
    return score
  }

  const moves = game.value.moves()
  let bestVal = -Infinity
  for (const move of moves) {
    game.value.move(move)
    bestVal = Math.max(bestVal, -evaluateBoard(depth - 1))
    game.value.undo()
  }
  return bestVal
}

const getSquareClass = (r, c) => {
  const isBlackSquare = (r + c) % 2 === 1
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
  const squareId = files[c] + ranks[r]

  return {
    'square-black': isBlackSquare,
    'square-white': !isBlackSquare,
    selected: selectedSquare.value === squareId,
    'possible-move': possibleMoves.value.includes(squareId),
    'last-move': false, // À implémenter si besoin
  }
}
</script>

<template>
  <div class="chess-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">ÉCHECS</span></div>
    </div>

    <!-- CONFIGURATION -->
    <transition name="fade" mode="out-in">
      <div v-if="gameStatus === 'config'" class="card config-card" key="config">
        <h1>Grand Maître</h1>
        <p>Choisissez la difficulté de l'IA</p>

        <div class="difficulty-selector">
          <button
            @click="difficulty = 'easy'"
            class="diff-btn"
            :class="{ active: difficulty === 'easy' }"
          >
            🌱 Débutant
          </button>
          <button
            @click="difficulty = 'medium'"
            class="diff-btn"
            :class="{ active: difficulty === 'medium' }"
          >
            ⚖️ Intermédiaire
          </button>
          <button
            @click="difficulty = 'hard'"
            class="diff-btn"
            :class="{ active: difficulty === 'hard' }"
          >
            😈 Expert
          </button>
        </div>

        <button class="etml-btn start-btn" @click="initGame">COMMENCER</button>
      </div>

      <!-- JEU -->
      <div v-else class="game-area" key="game">
        <!-- HUD -->
        <div class="game-hud">
          <div class="player-info" :class="{ 'turn-active': game.turn() === 'b' }">
            <span class="avatar">🤖</span>
            <div class="captures">
              <span v-for="(p, i) in capturedByAI" :key="i">{{ pieceIcons['w'][p] }}</span>
            </div>
          </div>

          <div class="vs-badge">
            <span v-if="aiThinking" class="thinking">L'IA réfléchit...</span>
            <span v-else-if="game.inCheck()">ÉCHEC !</span>
            <span v-else>VS</span>
          </div>

          <div class="player-info" :class="{ 'turn-active': game.turn() === 'w' }">
            <span class="avatar">👤</span>
            <div class="captures">
              <span v-for="(p, i) in capturedByPlayer" :key="i">{{ pieceIcons['b'][p] }}</span>
            </div>
          </div>
        </div>

        <!-- PLATEAU -->
        <div class="board-frame">
          <div class="chess-board">
            <div v-for="(row, rIndex) in board" :key="rIndex" class="rank">
              <div
                v-for="(piece, cIndex) in row"
                :key="cIndex"
                class="square"
                :class="getSquareClass(rIndex, cIndex)"
                @click="handleSquareClick(rIndex, cIndex)"
              >
                <!-- Indice de coup possible (petit point) -->
                <div
                  v-if="
                    possibleMoves.includes(
                      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][cIndex] +
                        ['8', '7', '6', '5', '4', '3', '2', '1'][rIndex],
                    )
                  "
                  class="move-dot"
                ></div>

                <!-- Pièce -->
                <span v-if="piece" class="piece" :class="piece.color">
                  {{ pieceIcons[piece.color][piece.type] }}
                </span>

                <!-- Coordonnées (optionnel, pour faire pro) -->
                <span v-if="cIndex === 0" class="coord-rank">{{ 8 - rIndex }}</span>
                <span v-if="rIndex === 7" class="coord-file">{{
                  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][cIndex]
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <button @click="gameStatus = 'config'" class="etml-btn secondary quit-btn">
          Abandonner
        </button>

        <!-- OVERLAY FIN -->
        <transition name="pop">
          <div v-if="gameStatus === 'finished'" class="result-modal">
            <div class="modal-content">
              <h2 v-if="winner === 'white'">🏆 Vous avez gagné !</h2>
              <h2 v-else-if="winner === 'black'">💀 Échec et Mat...</h2>
              <h2 v-else>🤝 Pat / Match Nul</h2>

              <p v-if="winner === 'black'">L'IA a dominé la partie.</p>

              <div class="modal-actions">
                <button @click="initGame" class="etml-btn">Revanche</button>
                <button @click="gameStatus = 'config'" class="etml-btn secondary">
                  Changer Difficulté
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <RouterLink to="/" class="back-link">Retour au menu</RouterLink>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap');

.chess-container {
  --square-white: #f0d9b5;
  --square-black: #b58863;
  --highlight: rgba(255, 255, 0, 0.5);
  --move-dot: rgba(0, 0, 0, 0.2);
  --etml-blue: #005596;

  text-align: center;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.brand-header {
  margin-bottom: 20px;
}
.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--etml-blue);
  letter-spacing: -1px;
}
.subtitle {
  color: #666;
  font-weight: 600;
  font-size: 1.2rem;
  display: block;
  letter-spacing: 2px;
}

/* --- CONFIGURATION --- */
.config-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}
.difficulty-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 30px 0;
}
.diff-btn {
  padding: 15px;
  border: 2px solid #eee;
  background: white;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}
.diff-btn:hover {
  background: #f9f9f9;
  border-color: #ddd;
}
.diff-btn.active {
  border-color: var(--etml-blue);
  background: #e3f2fd;
  color: var(--etml-blue);
}

/* --- HUD --- */
.game-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin-bottom: 15px;
}
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s;
  opacity: 0.7;
}
.player-info.turn-active {
  opacity: 1;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}
.avatar {
  font-size: 2rem;
}
.captures {
  font-size: 0.8rem;
  height: 20px;
  display: flex;
  gap: 2px;
}
.vs-badge {
  font-weight: 800;
  color: #ccc;
  min-width: 100px;
}
.thinking {
  color: var(--etml-blue);
  animation: pulse 1s infinite;
  font-size: 0.9rem;
}
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* --- PLATEAU --- */
.board-frame {
  padding: 10px;
  background: #333;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.chess-board {
  display: flex;
  flex-direction: column;
  user-select: none;
}
.rank {
  display: flex;
}
.square {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  cursor: pointer;
  position: relative;
}
.square-white {
  background-color: var(--square-white);
  color: var(--square-white);
}
.square-black {
  background-color: var(--square-black);
  color: var(--square-black);
}

/* Highlight & Moves */
.square.selected {
  background-color: #bbc766 !important;
}
.square.possible-move::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
}
.square:hover.possible-move {
  background-color: #dfe695;
}

/* Pièces */
.piece {
  z-index: 2;
  /* Utilisation d'une police symboles si besoin, sinon standard */
  font-family: 'Noto Sans Symbols 2', sans-serif;
  line-height: 1;
}
.piece.w {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.piece.b {
  color: black;
}

/* Coordonnées */
.coord-rank {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.6rem;
  font-weight: bold;
  opacity: 0.7;
  color: inherit;
  filter: invert(1) grayscale(1);
}
.coord-file {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.6rem;
  font-weight: bold;
  opacity: 0.7;
  color: inherit;
  filter: invert(1) grayscale(1);
}

/* --- BOUTONS --- */
.etml-btn {
  background: var(--etml-blue);
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
}
.etml-btn:hover {
  background: #003f73;
}
.quit-btn {
  max-width: 200px;
  margin-top: 20px;
}
.etml-btn.secondary {
  background: transparent;
  border: 2px solid var(--etml-blue);
  color: var(--etml-blue);
}
.etml-btn.secondary:hover {
  background: #e3f2fd;
}

/* --- MODAL --- */
.result-modal {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
  border-radius: 20px;
}
.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: pop 0.3s;
}
@keyframes pop {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

.back-link {
  display: inline-block;
  margin-top: 30px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
}
.back-link:hover {
  color: var(--etml-blue);
}

@media (max-width: 500px) {
  .square {
    width: 40px;
    height: 40px;
    font-size: 2rem;
  }
}
</style>
