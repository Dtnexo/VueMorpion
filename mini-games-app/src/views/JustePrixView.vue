<script setup>
import { ref } from 'vue'

const targetNumber = ref(Math.floor(Math.random() * 100) + 1)
const userGuess = ref('')
const message = ref('Devinez le nombre entre 1 et 100')
const attempts = ref(0)
const history = ref([])
const won = ref(false)

const checkGuess = () => {
  const guess = parseInt(userGuess.value)
  if (!guess) return

  attempts.value++

  if (guess === targetNumber.value) {
    message.value = `Bravo ! Trouvé en ${attempts.value} coups.`
    won.value = true
    history.value.unshift({ val: guess, res: 'Gagné 🏆' })
  } else if (guess < targetNumber.value) {
    message.value = "C'est plus grand 📈"
    history.value.unshift({ val: guess, res: 'Trop petit' })
  } else {
    message.value = "C'est plus petit 📉"
    history.value.unshift({ val: guess, res: 'Trop grand' })
  }
  userGuess.value = ''
}

const restart = () => {
  targetNumber.value = Math.floor(Math.random() * 100) + 1
  userGuess.value = ''
  message.value = 'Devinez le nombre entre 1 et 100'
  attempts.value = 0
  history.value = []
  won.value = false
}
</script>

<template>
  <div class="jp-container">
    <h1>🎯 Le Juste Prix</h1>

    <div class="game-card">
      <div class="display-area">
        <h2>{{ message }}</h2>
      </div>

      <div class="input-area" v-if="!won">
        <input
          v-model="userGuess"
          type="number"
          placeholder="ex: 42"
          @keyup.enter="checkGuess"
          class="guess-input"
        />
        <button @click="checkGuess" class="btn">Valider</button>
      </div>

      <div v-else class="win-area">
        <div class="big-number">{{ targetNumber }}</div>
        <button @click="restart" class="btn">Rejouer</button>
      </div>

      <div class="history" v-if="history.length > 0">
        <h3>Historique</h3>
        <ul>
          <li v-for="(h, index) in history" :key="index">
            <span class="h-val">{{ h.val }}</span>
            <span class="h-res">{{ h.res }}</span>
          </li>
        </ul>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Retour</RouterLink>
  </div>
</template>

<style scoped>
.jp-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
}
h1 {
  color: var(--etml-blue);
}

.game-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.display-area h2 {
  color: var(--etml-blue);
  margin-bottom: 20px;
  min-height: 1.5em;
}

.input-area {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.guess-input {
  padding: 10px;
  font-size: 1.2rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  width: 100px;
  text-align: center;
}
.guess-input:focus {
  border-color: var(--etml-blue);
  outline: none;
}

.big-number {
  font-size: 4rem;
  color: #27ae60;
  font-weight: bold;
  margin-bottom: 20px;
}

.history {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.history h3 {
  font-size: 1rem;
  color: #888;
}
.history ul {
  list-style: none;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
}
.history li {
  display: flex;
  justify-content: space-between;
  padding: 8px 20px;
  border-bottom: 1px solid #f9f9f9;
}
.h-val {
  font-weight: bold;
}
.h-res {
  color: var(--text-light);
  font-size: 0.9rem;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: var(--text-light);
  text-decoration: none;
}
</style>
