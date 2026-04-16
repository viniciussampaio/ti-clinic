import Vue from "vue";
import Vuex from "vuex";
import { getStoredToken, setStoredToken } from "@/services/api";
import { loginRequest, registerRequest } from "@/services/login/auth";

Vue.use(Vuex);

interface AuthState {
  token: string | null;
  user: Record<string, unknown> | null;
}

export default new Vuex.Store({
  state: {
    token: getStoredToken(),
    user: null,
  } as AuthState,
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  mutations: {
    SET_AUTH(
      state,
      payload: { token: string; user: Record<string, unknown> | null }
    ): void {
      state.token = payload.token;
      state.user = payload.user;
      setStoredToken(payload.token);
    },
    CLEAR_AUTH(state): void {
      state.token = null;
      state.user = null;
      setStoredToken(null);
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
