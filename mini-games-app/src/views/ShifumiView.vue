<script setup>
import { ref } from 'vue'

const choices = [
  { name: 'Pierre', emoji: '✊', beats: 'Ciseaux' },
  { name: 'Feuille', emoji: '✋', beats: 'Pierre' },
  { name: 'Ciseaux', emoji: '✌️', beats: 'Feuille' },
]

const playerChoice = ref(null)
const computerChoice = ref(null)
const result = ref(null) // 'win', 'lose', 'draw'
const score = ref({ player: 0, computer: 0 })

const play = (choice) => {
  playerChoice.value = choice
  const random = choices[Math.floor(Math.random() * choices.length)]
  computerChoice.value = random

  if (choice.name === random.name) {
    result.value = 'draw'
  } else if (choice.beats === random.name) {
    result.value = 'win'
    score.value.player++
  } else {
    result.value = 'lose'
    score.value.computer++
  }
}

const reset = () => {
  playerChoice.value = null
  computerChoice.value = null
  result.value = null
}
</script>

<template>
  <div class="game-wrapper">
    <div class="scoreboard">
      <div class="score-box">
        <span>Vous</span>
        <strong>{{ score.player }}</strong>
      </div>
      <div class="vs">VS</div>
      <div class="score-box">
        <span>Ordi</span>
        <strong>{{ score.computer }}</strong>
      </div>
    </div>

    <div class="game-area">
      <div v-if="!playerChoice" class="choices-container">
        <h2>Faites votre choix</h2>
        <div class="buttons">
          <button
            v-for="choice in choices"
            :key="choice.name"
            @click="play(choice)"
            class="choice-card"
          >
            <span class="emoji">{{ choice.emoji }}</span>
            <span class="name">{{ choice.name }}</span>
          </button>
        </div>
      </div>

      <div v-else class="result-container">
        <div class="battle">
          <div class="fighter winner-anim" :class="{ win: result === 'win' }">
            <span>Vous</span>
            <div class="big-emoji">{{ playerChoice.emoji }}</div>
          </div>
          <div class="fighter" :class="{ win: result === 'lose' }">
            <span>Ordi</span>
            <div class="big-emoji">{{ computerChoice.emoji }}</div>
          </div>
        </div>

        <div class="message">
          <h2 v-if="result === 'draw'" style="color: #f6bd60">Égalité !</h2>
          <h2 v-else-if="result === 'win'" style="color: #2a9d8f">Gagné ! 🎉</h2>
          <h2 v-else style="color: #e63946">Perdu... 🤖</h2>
          <button @click="reset" class="btn">Rejouer</button>
        </div>
      </div>
    </div>

    <RouterLink to="/" class="back-link">Quitter</RouterLink>
  </div>
</template>

<style scoped>
.game-wrapper {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.scoreboard {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 2rem;
  background: white;
  padding: 15px;
  border-radius: 50px;
  box-shadow: var(--shadow);
}
.score-box {
  display: flex;
  flex-direction: column;
  width: 60px;
}
.score-box span {
  font-size: 0.8rem;
  color: var(--text-light);
  text-transform: uppercase;
}
.score-box strong {
  font-size: 1.5rem;
  color: var(--etml-blue);
}
.vs {
  font-weight: bold;
  color: #ddd;
}

.choices-container .buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
.choice-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow);
}
.choice-card:hover {
  transform: translateY(-5px);
  border-color: var(--etml-blue);
}
.choice-card .emoji {
  font-size: 2.5rem;
  margin-bottom: 5px;
}
.choice-card .name {
  font-weight: bold;
  color: var(--text-main);
}

.battle {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}
.fighter {
  padding: 20px;
  background: white;
  border-radius: 12px;
  min-width: 120px;
  border: 2px solid transparent;
}
.fighter.win {
  border-color: #2a9d8f;
  background: #e8f8f5;
}
.big-emoji {
  font-size: 4rem;
  margin-top: 10px;
}
.message h2 {
  font-size: 2rem;
  margin: 10px 0 20px;
}

.back-link {
  display: inline-block;
  margin-top: 30px;
  color: var(--text-light);
  text-decoration: none;
}
</style>
