import Vue from "vue";
import Vuex from "vuex";
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/services/api";
import { loginRequest, registerRequest } from "@/services/login/auth";

Vue.use(Vuex);

interface AuthState {
  token: string | null;
  user: Record<string, unknown> | null;
}

function displayNameFromUser(user: Record<string, unknown> | null): string {
  if (!user) {
    return "Usuário";
  }
  const displayName = user.displayName;
  if (typeof displayName === "string" && displayName.trim()) {
    return displayName.trim();
  }
  const email = user.email;
  if (typeof email === "string" && email.includes("@")) {
    return email.split("@")[0]?.trim() || "Usuário";
  }
  if (typeof email === "string" && email.trim()) {
    return email.trim();
  }
  return "Usuário";
}

function initialsFromDisplayLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return "?";
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0] ?? "";
    const last = parts[parts.length - 1][0] ?? "";
    return (first + last).toUpperCase();
  }
  const word = parts[0] ?? "";
  if (word.length >= 2) {
    return word.slice(0, 2).toUpperCase();
  }
  return word.toUpperCase();
}

export default new Vuex.Store({
  state: {
    token: getStoredToken(),
    user: getStoredUser(),
  } as AuthState,
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
    accountDisplayName: (state): string => displayNameFromUser(state.user),
    accountInitials(_state, getters): string {
      return initialsFromDisplayLabel(getters.accountDisplayName as string);
    },
  },
  mutations: {
    SET_AUTH(
      state,
      payload: { token: string; user: Record<string, unknown> | null }
    ): void {
      state.token = payload.token;
      state.user = payload.user;
      setStoredToken(payload.token);
      setStoredUser(payload.user);
    },
    CLEAR_AUTH(state): void {
      state.token = null;
      state.user = null;
      setStoredToken(null);
      setStoredUser(null);
    },
  },
  actions: {
    async login(
      { commit },
      { email, password }: { email: string; password: string }
    ): Promise<void> {
      const result = await loginRequest(email, password);
      commit("SET_AUTH", {
        token: result.token,
        user: result.user,
      });
    },
    async register(
      { commit },
      payload: {
        email: string;
        password: string;
        displayName: string;
      }
    ): Promise<{ loggedIn: boolean }> {
      const result = await registerRequest(payload);
      if (result) {
        commit("SET_AUTH", {
          token: result.token,
          user: result.user,
        });
        return { loggedIn: true };
      }
      return { loggedIn: false };
    },
    logout({ commit }): void {
      commit("CLEAR_AUTH");
    },
  },
  modules: {},
});
