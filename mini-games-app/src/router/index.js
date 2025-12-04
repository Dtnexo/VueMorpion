import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MorpionView from '../views/MorpionView.vue'
import ShifumiView from '../views/ShifumiView.vue'
import ReflexView from '../views/ReflexView.vue'
import JustePrixView from '../views/JustePrixView.vue'
import MotMystereView from '../views/MotMystereView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/morpion', name: 'morpion', component: MorpionView },
    { path: '/shifumi', name: 'shifumi', component: ShifumiView },
    { path: '/reflex', name: 'reflex', component: ReflexView },
    { path: '/justeprix', name: 'justeprix', component: JustePrixView },
    { path: '/mot-mystere', name: 'mot-mystere', component: MotMystereView },
  ],
})

export default router
