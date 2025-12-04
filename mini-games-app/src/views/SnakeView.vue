<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// Config
const boardSize = 20 // 20x20 grille
const initialSpeed = 150

// États
const snake = ref([{ x: 10, y: 10 }])
const food = ref({ x: 5, y: 5 })
const direction = ref({ x: 0, y: 0 })
const score = ref(0)
const gameActive = ref(false)
const gameOver = ref(false)
let gameInterval = null

// Variable tampon pour empêcher le double changement de direction dans le même tour (bug du demi-tour)
let canChangeDirection = true

// Démarrer
const startGame = () => {
  snake.value = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ] // Serpent initial
  direction.value = { x: 0, y: -1 } // Monte par défaut
  score.value = 0
  gameOver.value = false
  gameActive.value = true
  canChangeDirection = true
  spawnFood()

  if (gameInterval) clearInterval(gameInterval)
  gameInterval = setInterval(gameLoop, initialSpeed)
}

// Boucle principale
const gameLoop = () => {
  const head = { ...snake.value[0] }
  head.x += direction.value.x
  head.y += direction.value.y

  // On a bougé, on réactive la possibilité de changer de direction pour le prochain tour
  canChangeDirection = true

  // Collision Murs
  if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
    endGame()
    return
  }

  // Collision Soi-même
  if (snake.value.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame()
    return
  }

  snake.value.unshift(head) // Ajouter la nouvelle tête

  // Manger la pomme
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    spawnFood()
  } else {
    snake.value.pop() // Retirer la queue si pas mangé
  }
}

const spawnFood = () => {
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    }
  } while (snake.value.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
  food.value = newFood
}

const endGame = () => {
  gameActive.value = false
  gameOver.value = true
  clearInterval(gameInterval)
}

// Gestion Clavier avec protection anti-bug
const handleKeydown = (e) => {
  if (!gameActive.value || !canChangeDirection) return

  let handled = false

  // Support des flèches ET de WASD / ZQSD
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
    case 'z': // Pour les claviers AZERTY si la langue n'est pas détectée correctement
    case 'Z':
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: -1 }
        handled = true
      }
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: 1 }
        handled = true
      }
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
    case 'q': // Pour les claviers AZERTY
    case 'Q':
      if (direction.value.x === 0) {
        direction.value = { x: -1, y: 0 }
        handled = true
      }
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (direction.value.x === 0) {
        direction.value = { x: 1, y: 0 }
        handled = true
      }
      break
  }

  // Si on a changé de direction, on bloque tout autre changement jusqu'au prochain mouvement du serpent
  if (handled) {
    canChangeDirection = false
  }
}

// Contrôles tactiles / Boutons
const changeDir = (x, y) => {
  if (gameActive.value && canChangeDirection) {
    // Empêcher le retournement direct
    if (x !== 0 && direction.value.x === 0) {
      direction.value = { x, y }
      canChangeDirection = false
    }
    if (y !== 0 && direction.value.y === 0) {
      direction.value = { x, y }
      canChangeDirection = false
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  clearInterval(gameInterval)
})
</script>

<template>
  <div class="snake-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">SNAKE</span></div>
    </div>

    <div class="card game-panel">
      <div class="score-display">
        Score: <span>{{ score }}</span>
      </div>

      <div class="game-board" :style="{ '--grid-size': boardSize }">
        <!-- Overlay Start/Game Over -->
        <div v-if="!gameActive" class="overlay">
          <h2 v-if="gameOver" class="game-over-text">Perdu !</h2>
          <p v-if="gameOver">Score final: {{ score }}</p>
          <button @click="startGame" class="etml-btn start-btn">
            {{ gameOver ? 'Rejouer' : 'JOUER' }}
          </button>
        </div>

        <!-- Serpent -->
        <div
          v-for="(segment, i) in snake"
          :key="i"
          class="snake-segment"
          :style="{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }"
          :class="{ head: i === 0 }"
        ></div>

        <!-- Pomme -->
        <div class="food" :style="{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }">
          🍎
        </div>
      </div>

      <!-- Contrôles Mobiles -->
      <div class="controls-pad">
        <button class="pad-btn up" @click="changeDir(0, -1)">▲</button>
        <div class="middle-row">
          <button class="pad-btn left" @click="changeDir(-1, 0)">◀</button>
          <button class="pad-btn right" @click="changeDir(1, 0)">▶</button>
        </div>
        <button class="pad-btn down" @click="changeDir(0, 1)">▼</button>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Retour Menu</RouterLink>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.snake-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
  margin: 20px auto;
  font-family: 'Poppins', sans-serif;
  color: #333;
}
.brand-header {
  margin-bottom: 20px;
}
.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: #005596;
}
.subtitle {
  color: #e63946;
}

.game-panel {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.score-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #005596;
  margin-bottom: 15px;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(var(--grid-size), 1fr);
  grid-template-rows: repeat(var(--grid-size), 1fr);
  width: 100%;
  aspect-ratio: 1;
  background: #f4f7f6;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.snake-segment {
  background-color: #005596;
  border-radius: 2px;
}
.snake-segment.head {
  background-color: #003f73;
  border-radius: 4px;
}
.food {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.game-over-text {
  color: #e63946;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.etml-btn {
  background: #005596;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 85, 150, 0.3);
}
.etml-btn:hover {
  transform: scale(1.05);
}

/* Contrôles tactiles */
.controls-pad {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.middle-row {
  display: flex;
  gap: 40px;
}
.pad-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #e3f2fd;
  color: #005596;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.pad-btn:active {
  background: #005596;
  color: white;
  transform: scale(0.95);
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #666;
  text-decoration: none;
}
</style>
