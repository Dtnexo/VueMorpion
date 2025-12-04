<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pseudo = ref('')
const error = ref(false)

onMounted(() => {
  // Si un pseudo existe déjà, on redirige directement
  if (localStorage.getItem('playerPseudo')) {
    router.push('/games')
  }
})

const enterArcade = () => {
  if (pseudo.value.trim().length < 3) {
    error.value = true
    return
  }
  // SAUVEGARDE DANS LE LOCAL STORAGE
  localStorage.setItem('playerPseudo', pseudo.value.trim())
  router.push('/games')
}
</script>

<template>
  <div class="welcome-container">
    <div class="login-card">
      <div class="logo">ETML <span class="accent">ARCADE</span></div>
      <h1>Bienvenue Joueur</h1>
      <p>Entrez votre pseudo pour sauvegarder vos scores</p>

      <div class="input-wrapper">
        <input
          v-model="pseudo"
          type="text"
          placeholder="Votre Pseudo..."
          @keyup.enter="enterArcade"
          :class="{ error: error }"
        />
        <p v-if="error" class="error-msg">Le pseudo doit faire 3 caractères min.</p>
      </div>

      <button @click="enterArcade" class="etml-btn">ENTRER DANS L'ARCADE</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');

.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Poppins', sans-serif;
}

.login-card {
  background: white;
  padding: 50px;
  border-radius: 25px;
  box-shadow: 0 15px 50px rgba(0, 85, 150, 0.15);
  text-align: center;
  max-width: 450px;
  width: 100%;
}

.logo {
  font-size: 2.5rem;
  font-weight: 900;
  color: #005596;
  margin-bottom: 10px;
}
.accent {
  color: #e63946;
}
h1 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 5px;
}
p {
  color: #666;
  margin-bottom: 30px;
}

input {
  width: 100%;
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: bold;
  color: #005596;
  margin-bottom: 20px;
  transition: border 0.3s;
}
input:focus {
  outline: none;
  border-color: #005596;
}
input.error {
  border-color: #e63946;
}
.error-msg {
  color: #e63946;
  font-size: 0.8rem;
  margin-top: -15px;
  margin-bottom: 15px;
}

.etml-btn {
  width: 100%;
  padding: 15px;
  background: #005596;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s;
}
.etml-btn:hover {
  background: #003f73;
  transform: translateY(-3px);
}
</style>
