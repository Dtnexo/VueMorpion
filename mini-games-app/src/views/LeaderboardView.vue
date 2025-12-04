<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useLeaderboard } from '../composables/useLeaderboard'
import { RouterLink } from 'vue-router'

// Liste des jeux supportés
const games = [
  { id: 'chess', name: 'Échecs', unit: 'Victoire' },
  { id: 'snake', name: 'Snake', unit: 'Points' },
  { id: 'memory', name: 'Memory', unit: 'Coups (Moins est mieux)' },
  { id: 'reflex', name: 'Réflexe', unit: 'ms (Moins est mieux)' },
  { id: 'connect4', name: 'Puissance 4', unit: 'Victoire' },
  { id: 'morpion', name: 'Morpion', unit: 'Victoire' },
  { id: 'shifumi', name: 'Shifumi', unit: 'Victoire' },
  { id: 'justeprix', name: 'Juste Prix', unit: 'Essais' },
  { id: 'mot-mystere', name: 'Mot Mystère', unit: 'Victoire' },
]

const activeGame = ref(games[0])
const { scores, fetchScores, loading } = useLeaderboard(activeGame.value.id)
let unsubscribe = null

// Changer de jeu
const selectGame = (game) => {
  activeGame.value = game
  // On recharge le composable pour le nouveau jeu
  if (unsubscribe) unsubscribe()
  const lb = useLeaderboard(game.id)

  // Petit hack pour réutiliser la réactivité : on met à jour la ref scores locale
  // Dans une vraie app, on ferait ça plus proprement, mais ça marche ici
  unsubscribe = lb.fetchScores()

  // On observe manuellement pour mettre à jour notre vue locale
  watch(lb.scores, (newVal) => {
    // Logique de tri spécifique selon le jeu
    if (['memory', 'reflex', 'justeprix'].includes(game.id)) {
      // Tri croissant (le plus petit est le meilleur)
      scores.value = [...newVal].sort((a, b) => a.score - b.score)
    } else {
      // Tri décroissant (le plus grand est le meilleur)
      scores.value = [...newVal].sort((a, b) => b.score - a.score)
    }
  })
}

// Initialisation
import { onMounted } from 'vue'
onMounted(() => {
  selectGame(games[0])
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="lb-container">
    <div class="brand-header">
      <div class="logo-text">ETML <span class="subtitle">CLASSEMENTS</span></div>
    </div>

    <div class="layout">
      <!-- Sidebar Menu des Jeux -->
      <div class="sidebar">
        <button
          v-for="game in games"
          :key="game.id"
          class="game-tab"
          :class="{ active: activeGame.id === game.id }"
          @click="selectGame(game)"
        >
          {{ game.name }}
        </button>
      </div>

      <!-- Liste des Scores -->
      <div class="score-panel">
        <div class="panel-header">
          <h2>🏆 Top {{ activeGame.name }}</h2>
          <span class="unit-badge">{{ activeGame.unit }}</span>
        </div>

        <div v-if="loading" class="loading">Chargement...</div>

        <div v-else-if="scores.length === 0" class="empty">
          Aucun score enregistré pour le moment. Soyez le premier !
        </div>

        <ul v-else class="score-list">
          <li v-for="(entry, index) in scores" :key="entry.id" class="score-item">
            <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
            <div class="pseudo">{{ entry.pseudo }}</div>
            <div class="score-val">
              {{ entry.score }}
              <span class="detail" v-if="entry.difficulty">({{ entry.difficulty }})</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Retour au menu</RouterLink>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

.lb-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
}

.brand-header {
  margin-bottom: 30px;
}
.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: #005596;
  letter-spacing: -1px;
}
.subtitle {
  color: #e63946;
  font-weight: 600;
  font-size: 1.2rem;
  display: block;
  letter-spacing: 2px;
}

.layout {
  display: flex;
  gap: 20px;
  min-height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: left;
}

/* Sidebar */
.sidebar {
  width: 200px;
  background: #f8fafc;
  padding: 20px 0;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.game-tab {
  background: transparent;
  border: none;
  padding: 15px 20px;
  text-align: left;
  font-family: inherit;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}
.game-tab:hover {
  background: #eef2f6;
  color: #005596;
}
.game-tab.active {
  background: white;
  color: #005596;
  border-left-color: #005596;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Score Panel */
.score-panel {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}
h2 {
  margin: 0;
  color: #333;
}
.unit-badge {
  background: #e63946;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.score-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}
.score-item:hover {
  background: #f9f9f9;
}

.rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border-radius: 50%;
  background: #eee;
  color: #666;
  margin-right: 15px;
}
.rank-1 {
  background: #ffd700;
  color: #b45309;
  box-shadow: 0 2px 5px rgba(255, 215, 0, 0.4);
}
.rank-2 {
  background: #c0c0c0;
  color: #555;
}
.rank-3 {
  background: #cd7f32;
  color: #763b08;
}

.pseudo {
  flex: 1;
  font-weight: 600;
  color: #005596;
}
.score-val {
  font-weight: 800;
  color: #333;
}
.detail {
  font-weight: 400;
  color: #888;
  font-size: 0.8rem;
  margin-left: 5px;
}

.loading,
.empty {
  text-align: center;
  color: #888;
  margin-top: 50px;
  font-style: italic;
}

.back-link {
  display: inline-block;
  margin-top: 30px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
}
.back-link:hover {
  color: #005596;
}

@media (max-width: 600px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid #eee;
  }
  .game-tab {
    white-space: nowrap;
    border-left: none;
    border-bottom: 4px solid transparent;
    padding: 10px 15px;
  }
  .game-tab.active {
    border-left-color: transparent;
    border-bottom-color: #005596;
  }
}
</style>
