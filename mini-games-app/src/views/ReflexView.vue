<script setup>
import { ref } from 'vue'

const state = ref('waiting') // waiting, ready, now, finished, too-early
const message = ref('Cliquez pour commencer')
const startTime = ref(0)
const reactionTime = ref(0)
let timer = null

const startTest = () => {
  state.value = 'ready'
  message.value = 'Attendez le VERT...'

  // Délai aléatoire entre 2 et 5 secondes
  const randomDelay = Math.floor(Math.random() * 3000) + 2000

  timer = setTimeout(() => {
    state.value = 'now'
    message.value = 'CLIQUEZ !'
    startTime.value = Date.now()
  }, randomDelay)
}

const handleClick = () => {
  if (state.value === 'waiting') {
    startTest()
  } else if (state.value === 'ready') {
    // Trop tôt
    clearTimeout(timer)
    state.value = 'too-early'
    message.value = 'Trop tôt ! Attendez le vert.'
  } else if (state.value === 'now') {
    // Succès
    const endTime = Date.now()
    reactionTime.value = endTime - startTime.value
    state.value = 'finished'
    message.value = `${reactionTime.value} ms`
  } else {
    // Reset si fini ou raté
    state.value = 'waiting'
    message.value = 'Cliquez pour réessayer'
  }
}
</script>

<template>
  <div class="reflex-container">
    <h1>Test de Réflexes</h1>
    <p>Cliquez quand l'écran devient VERT</p>

    <div class="reflex-box" :class="state" @mousedown="handleClick">
      <div class="content">
        <div class="icon" v-if="state === 'waiting'">⚡</div>
        <div class="icon" v-if="state === 'too-early'">⚠️</div>
        <div class="score" v-if="state === 'finished'">{{ reactionTime }} ms</div>
        <h2>{{ message }}</h2>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Retour</RouterLink>
  </div>
</template>

<style scoped>
.reflex-container {
  width: 100%;
  max-width: 600px;
  text-align: center;
}
h1 {
  color: var(--etml-blue);
}

.reflex-box {
  height: 300px;
  background-color: var(--etml-blue);
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  box-shadow: var(--shadow);
  margin: 20px 0;
}

.reflex-box.waiting {
  background-color: var(--etml-blue);
}
.reflex-box.ready {
  background-color: #ce2029; /* Rouge */
  cursor: wait;
}
.reflex-box.now {
  background-color: #27ae60; /* Vert */
}
.reflex-box.finished {
  background-color: white;
  color: var(--text-main);
  border: 4px solid var(--etml-blue);
}
.reflex-box.too-early {
  background-color: #f39c12;
}

.content {
  pointer-events: none;
}
.icon {
  font-size: 4rem;
  margin-bottom: 10px;
}
.score {
  font-size: 5rem;
  font-weight: 800;
  color: var(--etml-blue);
}
h2 {
  font-size: 1.5rem;
  margin: 0;
}

.back-link {
  color: var(--text-light);
  text-decoration: none;
}
</style>
