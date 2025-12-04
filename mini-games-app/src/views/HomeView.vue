<script setup>
import { RouterLink } from 'vue-router'

const games = [
  {
    id: 'morpion',
    title: 'Morpion',
    desc: 'Le classique Tic-Tac-Toe. Joue contre un ami !',
    icon: '❌',
    link: '/morpion',
    color: '#e63946', // Rouge accent
  },
  {
    id: 'shifumi',
    title: 'Shifumi',
    desc: "Pierre, Feuille, Ciseaux contre l'ordinateur.",
    icon: '✂️',
    link: '/shifumi',
    color: '#005596', // Bleu ETML
  },
  {
    id: 'reflex',
    title: 'Test Réflexe',
    desc: 'Teste ta vitesse de réaction à la milliseconde !',
    icon: '⚡',
    link: '/reflex',
    color: '#f6bd60', // Jaune
  },
  {
    id: 'justeprix',
    title: 'Le Juste Prix',
    desc: 'Trouve le nombre mystère entre 1 et 100.',
    icon: '🎯',
    link: '/justeprix',
    color: '#2a9d8f', // Vert
  },
  {
    id: 'mot-mystere',
    title: 'Mot Mystère',
    desc: 'Devine le mot caché (Style Wordle/Motus).',
    icon: '🔠',
    link: '/mot-mystere',
    color: '#9b5de5', // Violet
  },
]
</script>

<template>
  <div class="home-container">
    <div class="hero">
      <h1>Bienvenue aux Portes Ouvertes</h1>
      <p>Choisissez un mini-jeu développé par les élèves</p>
    </div>

    <div class="games-grid">
      <RouterLink v-for="game in games" :key="game.id" :to="game.link" class="game-card">
        <div class="icon-circle" :style="{ backgroundColor: game.color + '20', color: game.color }">
          {{ game.icon }}
        </div>
        <h2>{{ game.title }}</h2>
        <p>{{ game.desc }}</p>
        <span class="play-link" :style="{ color: game.color }">Jouer →</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1000px;
  width: 100%;
  text-align: center;
}

.hero {
  margin-bottom: 3rem;
}
h1 {
  font-size: 2.5rem;
  color: var(--etml-blue);
  margin-bottom: 0.5rem;
}
.hero p {
  color: var(--text-light);
  font-size: 1.2rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}

.game-card {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-decoration: none;
  color: var(--text-main);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid transparent;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #eee;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.game-card h2 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}
.game-card p {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 20px;
  flex-grow: 1;
}
.play-link {
  font-weight: bold;
  font-size: 0.9rem;
}
</style>
