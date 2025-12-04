<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const icons = ['🚀', '🐱', '💀', '🍕', '🦄', '🤖', '🔥', '💎']
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)
const moves = ref(0)
const gameStarted = ref(false)
const gameWon = ref(false)

// Mélanger et initier les cartes
const initGame = () => {
  const pairs = [...icons, ...icons]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }

  cards.value = pairs.map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false,
  }))

  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  gameStarted.value = true
  gameWon.value = false
}

const flipCard = (card) => {
  if (!gameStarted.value || card.isFlipped || card.isMatched || flippedCards.value.length >= 2)
    return

  card.isFlipped = true
  flippedCards.value.push(card)

  if (flippedCards.value.length === 2) {
    moves.value++
    checkForMatch()
  }
}

const checkForMatch = () => {
  const [card1, card2] = flippedCards.value

  if (card1.icon === card2.icon) {
    // Correspondance trouvée
    card1.isMatched = true
    card2.isMatched = true
    // IMPORTANT : On garde isFlipped à true aussi pour être sûr
    card1.isFlipped = true
    card2.isFlipped = true

    matchedPairs.value++
    flippedCards.value = [] // On vide la sélection

    if (matchedPairs.value === icons.length) {
      setTimeout(() => (gameWon.value = true), 500)
    }
  } else {
    // Pas de correspondance, on retourne après un délai
    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      flippedCards.value = []
    }, 1000)
  }
}

onMounted(initGame)
</script>

<template>
  <div class="memory-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">MEMORY</span></div>
    </div>

    <div class="card game-panel">
      <!-- Stats du jeu -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="label">Coups</span>
          <span class="value">{{ moves }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Paires</span>
          <span class="value">{{ matchedPairs }} / {{ icons.length }}</span>
        </div>
        <button @click="initGame" class="reset-icon-btn" title="Recommencer">🔄</button>
      </div>

      <!-- Grille de cartes -->
      <div class="grid-container">
        <div
          v-for="card in cards"
          :key="card.id"
          class="memory-card"
          :class="{ flipped: card.isFlipped || card.isMatched, matched: card.isMatched }"
          @click="flipCard(card)"
        >
          <div class="card-inner">
            <div class="card-front">?</div>
            <div class="card-back">{{ card.icon }}</div>
          </div>
        </div>
      </div>

      <!-- Écran de victoire -->
      <transition name="fade">
        <div v-if="gameWon" class="result-overlay">
          <div class="result-box">
            <h2>🎉 Bravo !</h2>
            <p>
              Tu as tout trouvé en <strong>{{ moves }}</strong> coups.
            </p>
            <button @click="initGame" class="etml-btn">Rejouer</button>
            <RouterLink
              to="/"
              class="etml-btn secondary"
              style="display: inline-block; text-decoration: none; text-align: center"
              >Menu</RouterLink
            >
          </div>
        </div>
      </transition>
    </div>

    <RouterLink to="/" class="back-link">Retour Menu</RouterLink>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

:root {
  --etml-blue: #005596;
  --etml-red: #e63946;
  --card-bg: #ffffff;
}

.memory-container {
  text-align: center;
  max-width: 600px;
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
  color: var(--etml-blue);
}
.subtitle {
  font-weight: 400;
  color: var(--etml-red);
}

.game-panel {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #f4f7f6;
  padding: 10px 20px;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}
.value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--etml-blue);
}

.reset-icon-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}
.reset-icon-btn:hover {
  transform: rotate(180deg);
}

/* Grille */
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  perspective: 1000px;
}

.memory-card {
  background-color: transparent;
  aspect-ratio: 1;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* C'est ici que la magie opère pour garder la carte retournée */
.memory-card.flipped .card-inner,
.memory-card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: bold;
}

.card-front {
  background-color: var(--etml-blue);
  color: white;
  font-size: 2rem;
}

.card-back {
  background-color: white;
  color: #333;
  transform: rotateY(180deg);
  font-size: 2.5rem;
  border: 2px solid var(--etml-blue);
}

/* Style spécifique pour les cartes trouvées */
.memory-card.matched .card-back {
  background-color: #e3f2fd; /* Bleu très clair */
  border-color: #2a9d8f; /* Bordure verte pour valider */
  box-shadow: 0 0 10px rgba(42, 157, 143, 0.3);
}

/* UI Elements */
.etml-btn {
  background: var(--etml-blue);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
  width: 100%;
}
.etml-btn.secondary {
  background: transparent;
  border: 2px solid var(--etml-blue);
  color: var(--etml-blue);
  margin-top: 5px;
}

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
  border-radius: 20px;
  z-index: 10;
}
.result-box {
  text-align: center;
  width: 80%;
}
.result-box h2 {
  color: var(--etml-blue);
  font-size: 2rem;
  margin-bottom: 10px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #666;
  text-decoration: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
