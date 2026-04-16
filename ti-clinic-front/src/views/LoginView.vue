<template>
  <div class="login-page">
    <div class="login-card">
      <header class="login-header">
        <h1 class="title">TI Clinic</h1>
        <p class="subtitle">Gerenciador de consultas médicas</p>
      </header>

      <form class="login-form" @submit.prevent="onSubmit">
        <p v-if="successMessage" class="success" role="status">
          {{ successMessage }}
        </p>

        <label class="field">
          <span class="label">E-mail</span>
          <input
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="username"
            required
            placeholder="seu@email.com"
            :disabled="isSubmitting"
          />
        </label>

        <label class="field">
          <span class="label">Senha</span>
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            :disabled="isSubmitting"
          />
        </label>

        <p v-if="errorMessage" class="error" role="alert">
          {{ errorMessage }}
        </p>

        <button type="submit" class="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Entrando…" : "Entrar" }}
        </button>

        <p class="register-hint">
          Ainda não tem conta?
          <button
            type="button"
            class="link-button"
            :disabled="isSubmitting"
            @click="openRegisterModal"
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </div>

    <div v-if="showRegisterModal" class="modal-backdrop" role="presentation">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
      >
        <div class="modal-header">
          <h2 id="register-title" class="modal-title">Criar conta</h2>
          <button
            type="button"
            class="modal-close"
            aria-label="Fechar"
            :disabled="isRegistering"
            @click="closeRegisterModal"
          >
            ×
          </button>
        </div>

        <form class="modal-form" @submit.prevent="onRegisterSubmit">
          <label class="field">
            <span class="label">Nome de exibição</span>
            <input
              v-model.trim="registerDisplayName"
              type="text"
              name="displayName"
              autocomplete="name"
              required
              placeholder="Como quer ser chamado(a)"
              :disabled="isRegistering"
            />
          </label>

          <label class="field">
            <span class="label">E-mail</span>
            <input
              v-model.trim="registerEmail"
              type="email"
              name="register-email"
              autocomplete="email"
              required
              placeholder="seu@email.com"
              :disabled="isRegistering"
            />
          </label>

          <label class="field">
            <span class="label">Senha</span>
            <input
              v-model="registerPassword"
              type="password"
              name="new-password"
              autocomplete="new-password"
              required
              :minlength="minPasswordLength"
              placeholder="••••••••"
              :disabled="isRegistering"
              aria-describedby="register-password-hints"
            />
          </label>

          <div
            id="register-password-hints"
            class="password-rules"
            aria-live="polite"
          >
            <p class="password-rules-intro">
              Pelo menos, para ser <strong>forte</strong>, a senha deve ter:
            </p>
            <ul class="password-rules-list" role="list">
              <li
                v-for="rule in registerPasswordRules"
                :key="rule.id"
                class="password-rule"
                :class="{ 'password-rule--met': rule.met }"
              >
                <span class="password-rule-icon" aria-hidden="true">{{
                  rule.met ? "✓" : "○"
                }}</span>
                {{ rule.label }}
              </li>
            </ul>
          </div>

          <p v-if="registerErrorMessage" class="error" role="alert">
            {{ registerErrorMessage }}
          </p>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              :disabled="isRegistering"
              @click="closeRegisterModal"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="isRegistering">
              {{ isRegistering ? "Cadastrando…" : "Cadastrar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

const MIN_PASSWORD_LENGTH = 8;

/** Símbolos comuns; letras acentuadas não contam como “especial”. */
function passwordHasSpecialChar(value: string): boolean {
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value);
}

interface PasswordRuleCheck {
  id: string;
  label: string;
  met: boolean;
}

function getRegisterPasswordRules(password: string): PasswordRuleCheck[] {
  return [
    {
      id: "length",
      label: `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      id: "upper",
      label: "Pelo menos 1 letra maiúscula (A–Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: "Pelo menos 1 número (0–9)",
      met: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "Pelo menos 1 caractere especial (por exemplo: ! @ # $ % & * …)",
      met: passwordHasSpecialChar(password),
    },
  ];
}

function isRegisterPasswordStrong(password: string): boolean {
  return getRegisterPasswordRules(password).every((r) => r.met);
}

function formatRequestError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      err.message;
    return msg || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export default Vue.extend({
  name: "LoginView",
  data() {
    return {
      minPasswordLength: MIN_PASSWORD_LENGTH,
      email: "",
      password: "",
      isSubmitting: false,
      errorMessage: "",
      successMessage: "",
      showRegisterModal: false,
      registerEmail: "",
      registerPassword: "",
      registerDisplayName: "",
      isRegistering: false,
      registerErrorMessage: "",
    };
  },
  watch: {
    email(): void {
      this.successMessage = "";
    },
    password(): void {
      this.successMessage = "";
    },
  },
  computed: {
    registerPasswordRules(): PasswordRuleCheck[] {
      return getRegisterPasswordRules(this.registerPassword);
    },
  },
  methods: {
    openRegisterModal(): void {
      this.registerErrorMessage = "";
      this.registerEmail = this.email;
      this.registerPassword = "";
      this.registerDisplayName = "";
      this.showRegisterModal = true;
    },
    closeRegisterModal(): void {
      if (this.isRegistering) return;
      this.showRegisterModal = false;
      this.registerErrorMessage = "";
    },
    async goAfterAuth(): Promise<void> {
      const redirect = this.$route.query.redirect;
      const path =
        typeof redirect === "string" && redirect.startsWith("/")
          ? redirect
          : { name: "home" };
      await this.$router.replace(path);
    },
    async onSubmit(): Promise<void> {
      this.errorMessage = "";
      this.isSubmitting = true;
      try {
        await this.$store.dispatch("login", {
          email: this.email,
          password: this.password,
        });
        await this.goAfterAuth();
      } catch (err: unknown) {
        this.errorMessage = formatRequestError(
          err,
          "Não foi possível entrar. Verifique os dados ou o servidor."
        );
      } finally {
        this.isSubmitting = false;
      }
    },
    async onRegisterSubmit(): Promise<void> {
      this.registerErrorMessage = "";
      if (!isRegisterPasswordStrong(this.registerPassword)) {
        this.registerErrorMessage =
          "A senha ainda não está forte o suficiente. Confira os requisitos acima.";
        return;
      }
      this.isRegistering = true;
      try {
        const { loggedIn } = await this.$store.dispatch("register", {
          email: this.registerEmail,
          password: this.registerPassword,
          displayName: this.registerDisplayName,
        });
        this.showRegisterModal = false;
        this.email = this.registerEmail;
        this.registerPassword = "";
        this.registerDisplayName = "";
        if (loggedIn) {
          await this.goAfterAuth();
        } else {
          this.successMessage =
            "Conta criada com sucesso. Entre com sua senha para continuar.";
        }
      } catch (err: unknown) {
        this.registerErrorMessage = formatRequestError(
          err,
          "Não foi possível concluir o cadastro. Tente novamente."
        );
      } finally {
        this.isRegistering = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(145deg, #e8f4fc 0%, #d4e8f2 40%, #b8d9ea 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem 2rem 2.25rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15, 60, 90, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.title {
  margin: 0 0 0.35rem;
  font-size: 1.65rem;
  font-weight: 700;
  color: #0d3d5c;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #5a7a8c;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  text-align: left;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c5364;
}

.password-rules {
  margin: -0.25rem 0 0;
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  color: #3d5a6c;
  line-height: 1.45;
  background: #f4f8fb;
  border: 1px solid #d8e6ee;
  border-radius: 8px;
}

.password-rules-intro {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: #2c5364;

  strong {
    font-weight: 700;
    color: #0d3d5c;
  }
}

.password-rules-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.password-rule {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #5a7a8c;

  &:first-of-type {
    margin-top: 0;
  }
}

.password-rule-icon {
  flex-shrink: 0;
  width: 1rem;
  text-align: center;
  font-weight: 700;
  color: #94a8b4;
}

.password-rule--met {
  color: #1a5c3a;

  .password-rule-icon {
    color: #1a7f4a;
  }
}

.field input {
  padding: 0.65rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #c5d9e4;
  border-radius: 8px;
  background: #fafcfd;
  color: #1a2f3d;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: #2a8fbd;
    box-shadow: 0 0 0 3px rgba(42, 143, 189, 0.2);
    background: #fff;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.success {
  margin: 0;
  padding: 0.65rem 0.75rem;
  font-size: 0.875rem;
  color: #0d5032;
  background: #e8f5ef;
  border-radius: 8px;
  line-height: 1.35;
}

.error {
  margin: 0;
  font-size: 0.875rem;
  color: #b42318;
  line-height: 1.35;
}

.submit {
  margin-top: 0.25rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(180deg, #2a8fbd 0%, #1f6f96 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.05s ease;

  &:hover:not(:disabled) {
    opacity: 0.95;
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.register-hint {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #5a7a8c;
  text-align: center;
}

.link-button {
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: #1f6f96;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover:not(:disabled) {
    color: #0d3d5c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 45, 65, 0.45);
}

.modal {
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  padding: 1.25rem 1.5rem 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(15, 60, 90, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0d3d5c;
}

.modal-close {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1;
  color: #5a7a8c;
  background: #f0f5f8;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #e2ecf2;
    color: #0d3d5c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.btn-secondary {
  padding: 0.65rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #2c5364;
  background: #fff;
  border: 1px solid #c5d9e4;
  border-radius: 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f4f8fb;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.btn-primary {
  padding: 0.65rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(180deg, #2a8fbd 0%, #1f6f96 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}
</style>
