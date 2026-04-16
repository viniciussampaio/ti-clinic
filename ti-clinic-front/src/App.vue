<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="app-nav">
      <div class="nav-links" aria-label="Navegacao principal">
        <router-link class="nav-link" to="/">Início</router-link>
        <router-link class="nav-link" to="/pacientes/cadastro"
          >Pacientes</router-link
        >
        <router-link class="nav-link" to="/planos-saude"
          >Planos de Saúde</router-link
        >
        <router-link class="nav-link" to="/agendamentos"
          >Agendamentos</router-link
        >
        <router-link class="nav-link" to="/especialidades"
          >Especialidades</router-link
        >
        <router-link class="nav-link" to="/medicos">Médicos</router-link>
        <router-link class="nav-link" to="/procedimentos"
          >Procedimentos</router-link
        >
      </div>
      <button type="button" class="logout" @click="onLogout">Sair</button>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters.isAuthenticated;
    },
  },
  methods: {
    onLogout(): void {
      this.$store.dispatch("logout");
      if (this.$route.name !== "login") {
        this.$router.push({ name: "login" });
      }
    },
  },
});
</script>

<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

#app {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1a2f3d;
  min-height: 100vh;
}

.app-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(244, 248, 251, 0.9);
  border-bottom: 1px solid #d4e5ee;
  backdrop-filter: blur(10px);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto hidden;
  padding: 0.15rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(155, 181, 196, 0.6);
    border-radius: 999px;
  }
}

.nav-link {
  scroll-snap-align: start;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f6f96;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    background: rgba(31, 111, 150, 0.08);
  }

  &.router-link-exact-active {
    color: #0d3d5c;
    background: #ffffff;
    box-shadow: 0 1px 0 rgba(13, 61, 92, 0.06),
      0 0 0 1px rgba(212, 229, 238, 0.9);
  }
}

.logout {
  flex: 0 0 auto;
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #5a3d3d;
  background: #fff;
  border: 1px solid #e0c8c8;
  border-radius: 999px;
  cursor: pointer;

  &:hover {
    background: #fdf6f6;
  }
}

@media (max-width: 520px) {
  .app-nav {
    padding: 0.65rem 0.75rem;
  }

  .nav-link {
    padding: 0.45rem 0.65rem;
    font-size: 0.92rem;
  }
}
</style>
