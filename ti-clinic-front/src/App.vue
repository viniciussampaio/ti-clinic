<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="app-nav">
      <div class="nav-leading">
        <button
          type="button"
          class="nav-burger"
          :class="{ 'nav-burger--open': navDrawerOpen }"
          :aria-expanded="navDrawerOpen ? 'true' : 'false'"
          aria-controls="app-nav-drawer"
          aria-label="Abrir ou fechar menu de navegação"
          @click="toggleNavDrawer"
        >
          <span class="nav-burger-line" aria-hidden="true" />
          <span class="nav-burger-line" aria-hidden="true" />
          <span class="nav-burger-line" aria-hidden="true" />
        </button>
        <div
          class="nav-links nav-links--desktop"
          aria-label="Navegacao principal"
        >
          <router-link
            v-for="item in navItems"
            :key="item.to"
            class="nav-link"
            :class="{ 'nav-link--muted': item.muted }"
            :to="item.to"
            :exact="item.exact"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
      <div class="nav-trailing">
        <span class="nav-greeting" aria-live="polite">
          Olá,
          <span class="nav-greeting-name">{{ accountDisplayName }}</span>
        </span>
        <q-avatar
          rounded
          color="primary"
          text-color="white"
          size="34px"
          font-size="0.78rem"
          class="nav-avatar"
          :aria-label="`Iniciais: ${accountInitials}`"
        >
          {{ accountInitials }}
        </q-avatar>
        <button type="button" class="logout" @click="onLogout">Sair</button>
      </div>
    </nav>

    <transition name="nav-drawer-fade">
      <div
        v-if="isAuthenticated && navDrawerOpen"
        class="nav-drawer-backdrop"
        aria-hidden="true"
        @click="closeNavDrawer"
      />
    </transition>
    <transition name="nav-drawer-slide">
      <aside
        v-if="isAuthenticated && navDrawerOpen"
        id="app-nav-drawer"
        class="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-nav-drawer-title"
      >
        <header class="nav-drawer-header">
          <div class="nav-drawer-brand">
            <span id="app-nav-drawer-title" class="nav-drawer-title"
              >TI Clinic</span
            >
            <span class="nav-drawer-sub">Navegação</span>
          </div>
          <button
            type="button"
            class="nav-drawer-close"
            aria-label="Fechar menu"
            @click="closeNavDrawer"
          >
            <q-icon name="close" size="22px" />
          </button>
        </header>
        <nav class="nav-drawer-body" aria-label="Navegacao principal">
          <router-link
            v-for="item in navItems"
            :key="'drawer-' + item.to"
            class="nav-drawer-link"
            :class="{ 'nav-drawer-link--muted': item.muted }"
            :to="item.to"
            :exact="item.exact"
            @click.native="closeNavDrawer"
          >
            <q-icon
              :name="item.icon"
              class="nav-drawer-link-icon"
              size="22px"
            />
            <span class="nav-drawer-link-text">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>
    </transition>

    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

type NavItem = {
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
  muted?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: "home", exact: true },
  { to: "/pacientes/cadastro", label: "Pacientes", icon: "people" },
  { to: "/planos-saude", label: "Planos de Saúde", icon: "local_hospital" },
  { to: "/agendamentos", label: "Agendamentos", icon: "event" },
  { to: "/especialidades", label: "Especialidades", icon: "category" },
  { to: "/medicos", label: "Médicos", icon: "person" },
  { to: "/procedimentos", label: "Procedimentos", icon: "list_alt" },
  { to: "/para-avaliador", label: "Avaliador", icon: "menu_book", muted: true },
];

export default Vue.extend({
  name: "App",
  data(): {
    navDrawerOpen: boolean;
    navItems: NavItem[];
    navEscHandler: ((e: KeyboardEvent) => void) | null;
    navResizeHandler: (() => void) | null;
  } {
    return {
      navDrawerOpen: false,
      navItems: NAV_ITEMS,
      navEscHandler: null,
      navResizeHandler: null,
    };
  },
  watch: {
    navDrawerOpen(isOpen: boolean): void {
      document.body.style.overflow = isOpen ? "hidden" : "";
    },
    $route(): void {
      this.closeNavDrawer();
    },
  },
  computed: {
    accountDisplayName(): string {
      return this.$store.getters.accountDisplayName as string;
    },
    accountInitials(): string {
      return this.$store.getters.accountInitials as string;
    },
    isAuthenticated(): boolean {
      return this.$store.getters.isAuthenticated;
    },
  },
  mounted(): void {
    this.navEscHandler = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && this.navDrawerOpen) {
        this.closeNavDrawer();
      }
    };
    document.addEventListener("keydown", this.navEscHandler);
    this.navResizeHandler = (): void => {
      if (typeof window === "undefined") {
        return;
      }
      if (window.innerWidth > 992 && this.navDrawerOpen) {
        this.closeNavDrawer();
      }
    };
    window.addEventListener("resize", this.navResizeHandler);
  },
  beforeDestroy(): void {
    document.body.style.overflow = "";
    if (this.navEscHandler) {
      document.removeEventListener("keydown", this.navEscHandler);
    }
    if (this.navResizeHandler) {
      window.removeEventListener("resize", this.navResizeHandler);
    }
  },
  methods: {
    toggleNavDrawer(): void {
      this.navDrawerOpen = !this.navDrawerOpen;
    },
    closeNavDrawer(): void {
      this.navDrawerOpen = false;
    },
    onLogout(): void {
      this.closeNavDrawer();
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
  background: rgba(244, 248, 251, 0.92);
  border-bottom: 1px solid #d4e5ee;
  backdrop-filter: blur(12px);
}

.nav-leading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  min-width: 0;
}

.nav-burger {
  display: none;
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #d4e5ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f5fafd 100%);
  box-shadow: 0 1px 2px rgba(13, 61, 92, 0.06);
  cursor: pointer;
  transition: box-shadow 180ms ease, border-color 180ms ease,
    background 180ms ease;

  &:hover {
    border-color: #b8d4e6;
    box-shadow: 0 2px 8px rgba(31, 111, 150, 0.12);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(42, 143, 189, 0.35);
  }
}

.nav-burger-line {
  position: absolute;
  left: 11px;
  right: 11px;
  height: 2px;
  border-radius: 2px;
  background: #0d3d5c;
  transition: transform 220ms ease, opacity 180ms ease, top 220ms ease;
}

.nav-burger-line:nth-child(1) {
  top: 15px;
}

.nav-burger-line:nth-child(2) {
  top: 21px;
}

.nav-burger-line:nth-child(3) {
  top: 27px;
}

.nav-burger--open .nav-burger-line:nth-child(1) {
  top: 21px;
  transform: rotate(45deg);
}

.nav-burger--open .nav-burger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0.2);
}

.nav-burger--open .nav-burger-line:nth-child(3) {
  top: 21px;
  transform: rotate(-45deg);
}

.nav-trailing {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-left: 0.5rem;
}

.nav-greeting {
  font-size: 0.9rem;
  color: #2c4a5c;
  white-space: nowrap;
  max-width: min(200px, 38vw);
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-greeting-name {
  font-weight: 700;
  color: #0d3d5c;
}

.nav-avatar {
  flex-shrink: 0;
  font-weight: 600;
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

  &--muted {
    font-size: 0.88rem;
    font-weight: 500;
    color: #5a7a8c;

    &:hover {
      color: #1f6f96;
    }

    &.router-link-exact-active {
      color: #0d3d5c;
    }
  }
}

.nav-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1990;
  background: rgba(13, 45, 65, 0.42);
  backdrop-filter: blur(4px);
}

.nav-drawer-fade-enter-active,
.nav-drawer-fade-leave-active {
  transition: opacity 220ms ease;
}

.nav-drawer-fade-enter,
.nav-drawer-fade-leave-to {
  opacity: 0;
}

.nav-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  width: min(300px, 88vw);
  max-width: 100%;
  background: linear-gradient(165deg, #fbfdff 0%, #f2f8fc 55%, #eef5f9 100%);
  border-right: 1px solid #d4e5ee;
  box-shadow: 8px 0 32px rgba(13, 61, 92, 0.14);
}

.nav-drawer-slide-enter-active,
.nav-drawer-slide-leave-active {
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease;
}

.nav-drawer-slide-enter,
.nav-drawer-slide-leave-to {
  transform: translateX(-104%);
  opacity: 0.85;
}

.nav-drawer-slide-enter-to,
.nav-drawer-slide-leave {
  transform: translateX(0);
  opacity: 1;
}

.nav-drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.1rem 1rem 1rem;
  background: linear-gradient(135deg, #e8f4fc 0%, #ffffff 72%);
  border-bottom: 1px solid #d4e5ee;
}

.nav-drawer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.nav-drawer-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0d3d5c;
}

.nav-drawer-sub {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5a7a8c;
}

.nav-drawer-close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  color: #355062;
  background: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: #fff;
    color: #0d3d5c;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(42, 143, 189, 0.45);
  }
}

.nav-drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0.65rem 0.5rem 1.25rem;
  -webkit-overflow-scrolling: touch;
}

.nav-drawer-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin: 0.2rem 0.35rem;
  padding: 0.78rem 0.85rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f6f96;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    background: rgba(31, 111, 150, 0.1);
  }

  &.router-link-exact-active,
  &.router-link-active {
    color: #0d3d5c;
    background: #ffffff;
    box-shadow: 0 1px 0 rgba(13, 61, 92, 0.05),
      0 0 0 1px rgba(212, 229, 238, 0.95);
  }
}

.nav-drawer-link--muted {
  font-size: 0.9rem;
  font-weight: 500;
  color: #5a7a8c;

  &:hover {
    color: #1f6f96;
  }

  &.router-link-exact-active,
  &.router-link-active {
    color: #0d3d5c;
  }
}

.nav-drawer-link-icon {
  flex-shrink: 0;
  color: #2a8fbd;
  opacity: 0.92;
}

.nav-drawer-link--muted .nav-drawer-link-icon {
  color: #7a96a8;
}

.nav-drawer-link.router-link-exact-active .nav-drawer-link-icon,
.nav-drawer-link.router-link-active .nav-drawer-link-icon {
  color: #1f6f96;
}

.nav-drawer-link-text {
  min-width: 0;
  line-height: 1.35;
}

/* Rolagem horizontal para tabelas largas (Quasar) sem estourar a página */
.table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

/* Tabelas estreitas: ocupam a largura do card sem barra horizontal forçada */
.table-scroll .q-table {
  min-width: 0;
}

/* Agendamentos, pacientes, planos: muitas colunas — mantém rolagem só quando necessário */
.table-scroll.table-scroll--wide .q-table {
  min-width: 840px;
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

@media (max-width: 992px) {
  .nav-burger {
    display: inline-flex;
  }

  .nav-links--desktop {
    display: none;
  }

  .nav-leading {
    flex: 0 0 auto;
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

  .nav-greeting {
    display: none;
  }

  .nav-trailing {
    gap: 0.45rem;
    margin-left: 0;
  }

  #app .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    width: 100%;
  }

  #app .form-actions .q-btn {
    width: 100%;
  }
}
</style>
