<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header class="main-header">
    <div class="header-content">
      <RouterLink to="/" class="logo">
        <span class="etml-logo">ETML</span> <span class="app-name">ARCADE</span>
      </RouterLink>
      <nav>
        <RouterLink to="/">Accueil</RouterLink>
      </nav>
    </div>
  </header>

  <main>
    <!-- Animation de transition entre les pages -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="main-footer">
    <p>© Portes Ouvertes ETML - Projet Étudiant</p>
  </footer>
</template>

<style>
/* --- VARIABLES GLOBALES ETML --- */
:root {
  --etml-blue: #005596;
  --etml-dark-blue: #003f73;
  --etml-red: #e63946;
  --bg-color: #f4f6f8;
  --text-main: #333;
  --text-light: #666;
  --white: #ffffff;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

/* --- LAYOUT --- */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center; /* Centre le contenu verticalement */
}

/* --- HEADER --- */
.main-header {
  background-color: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--etml-blue);
}
.app-name {
  color: var(--text-main);
  font-weight: 300;
}

nav a {
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  margin-left: 20px;
  transition: color 0.2s;
}
nav a:hover {
  color: var(--etml-blue);
}

/* --- FOOTER --- */
.main-footer {
  text-align: center;
  padding: 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
  background-color: var(--white);
  border-top: 1px solid #eee;
}

/* --- BOUTONS GLOBAUX --- */
button {
  font-family: inherit;
}
.btn {
  background-color: var(--etml-blue);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}
.btn:hover {
  background-color: var(--etml-dark-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 85, 150, 0.2);
}
.btn-outline {
  background: transparent;
  border: 2px solid var(--etml-blue);
  color: var(--etml-blue);
}
.btn-outline:hover {
  background: #f0f7ff;
}

/* --- TRANSITIONS --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
