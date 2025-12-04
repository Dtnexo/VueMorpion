import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue' // Nouveau
import HomeView from '../views/HomeView.vue'
import MorpionView from '../views/MorpionView.vue'
import ShifumiView from '../views/ShifumiView.vue'
import ReflexView from '../views/ReflexView.vue'
import JustePrixView from '../views/JustePrixView.vue'
import MotMystereView from '../views/MotMystereView.vue'
import Connect4View from '../views/Connect4View.vue'
import MemoryView from '../views/MemoryView.vue'
import SnakeView from '../views/SnakeView.vue'
import ChessView from '../views/ChessView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'welcome', component: WelcomeView }, // Racine = Login
    { path: '/games', name: 'games', component: HomeView }, // Liste des jeux

    { path: '/morpion', name: 'morpion', component: MorpionView },
    { path: '/shifumi', name: 'shifumi', component: ShifumiView },
    { path: '/reflex', name: 'reflex', component: ReflexView },
    { path: '/justeprix', name: 'justeprix', component: JustePrixView },
    { path: '/mot-mystere', name: 'mot-mystere', component: MotMystereView },
    { path: '/connect4', name: 'connect4', component: Connect4View },
    { path: '/memory', name: 'memory', component: MemoryView },
    { path: '/snake', name: 'snake', component: SnakeView },
    { path: '/chess', name: 'chess', component: ChessView },
    { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
  ],
})

export default router
