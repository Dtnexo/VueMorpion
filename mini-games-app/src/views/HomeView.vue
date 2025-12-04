<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const currentPseudo = ref('')

onMounted(() => {
  // Récupération depuis le localStorage
  const stored = localStorage.getItem('playerPseudo')
  if (!stored) {
    router.push('/') // Retour login si pas de pseudo
  } else {
    currentPseudo.value = stored
  }
})

const logout = () => {
  localStorage.removeItem('playerPseudo')
  router.push('/')
}

const games = [
  {
    id: 'morpion',
    title: 'Morpion',
    desc: 'Le classique Tic-Tac-Toe.',
    icon: '❌',
    link: '/morpion',
    color: '#e63946',
  },
  {
    id: 'connect4',
    title: 'Puissance 4',
    desc: 'Aligne 4 jetons.',
    icon: '🔴',
    link: '/connect4',
    color: '#005596',
  },
  {
    id: 'chess',
    title: 'Échecs',
    desc: "Défie l'IA.",
    icon: '♟️',
    link: '/chess',
    color: '#333333',
  },
  {
    id: 'shifumi',
    title: 'Shifumi',
    desc: 'Pierre, Feuille, Ciseaux.',
    icon: '✂️',
    link: '/shifumi',
    color: '#005596',
  },
  {
    id: 'reflex',
    title: 'Réflexe',
    desc: 'Teste ta vitesse !',
    icon: '⚡',
    link: '/reflex',
    color: '#f6bd60',
  },
  {
    id: 'justeprix',
    title: 'Juste Prix',
    desc: 'Trouve le nombre.',
    icon: '🎯',
    link: '/justeprix',
    color: '#2a9d8f',
  },
  {
    id: 'mot-mystere',
    title: 'Mot Mystère',
    desc: 'Devine le mot.',
    icon: '🔠',
    link: '/mot-mystere',
    color: '#9b5de5',
  },
  {
    id: 'memory',
    title: 'Memory',
    desc: 'Trouve les paires.',
    icon: '🧠',
    link: '/memory',
    color: '#9b5de5',
  },
  {
    id: 'snake',
    title: 'Snake',
    desc: 'Mange les pommes !',
    icon: '🐍',
    link: '/snake',
    color: '#2a9d8f',
  },
]
</script>

<template>
  <div class="home-container">
    <div class="hero">
      <h1>
        Bonjour, <span class="pseudo-highlight">{{ currentPseudo }}</span> !
      </h1>
      <p>À quel jeu veux-tu jouer aujourd'hui ?</p>

      <div class="actions">
        <button @click="logout" class="logout-btn">Se déconnecter</button>
        <RouterLink to="/leaderboard" class="lb-btn">🏆 Voir les Classements</RouterLink>
      </div>
    </div>

    <div class="games-grid">
      <!-- Plus besoin de query params -->
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
  padding: 20px;
}
.hero {
  margin-bottom: 3rem;
}
h1 {
  font-size: 2.5rem;
  color: var(--etml-blue);
  margin-bottom: 0.5rem;
}
.pseudo-highlight {
  color: #e63946;
  text-decoration: underline;
}
.hero p {
  color: var(--text-light);
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}
.logout-btn {
  background: transparent;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  color: #666;
  font-weight: 600;
}
.logout-btn:hover {
  background: #eee;
}

.lb-btn {
  display: inline-block;
  background: #005596;
  color: white;
  padding: 10px 25px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 85, 150, 0.3);
  transition: transform 0.2s;
}
.lb-btn:hover {
  transform: translateY(-3px);
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
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid transparent;
}
.game-card:hover {
  transform: translateY(-5px);
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
