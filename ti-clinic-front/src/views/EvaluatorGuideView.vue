<template>
  <div class="evaluator-page">
    <div class="evaluator-shell">
      <header class="evaluator-header">
        <router-link class="back-link" :to="{ name: 'login' }">← Voltar ao login</router-link>
        <h1 class="title">Informações para o avaliador</h1>
        <p class="lead">
          TI Clinic — como subir o ambiente, URLs e ordem sugerida para exercitar o sistema no
          front-end.
        </p>
      </header>

      <section class="card">
        <h2>Subir front-end, API e banco (Docker)</h2>
        <p>
          Na <strong>raiz do monorepo</strong> (pasta que contém <code>ti-clinic-front</code> e
          <code>ti-clinic-test</code>):
        </p>
        <pre class="code-block"><code>docker compose --env-file ./ti-clinic-test/.env.docker up --build</code></pre>
        <p>Com o arquivo padrão <code>.env.docker</code> do back-end, em geral:</p>
        <ul>
          <li><strong>Front:</strong> <code>http://localhost:8080</code> (porta <code>WEB_PORT_EXPOSE</code> se alterada)</li>
          <li><strong>API:</strong> <code>http://localhost:3001</code> (porta <code>API_PORT_EXPOSE</code>)</li>
          <li><strong>Swagger:</strong> <code>http://localhost:3001/api</code></li>
          <li><strong>MySQL (host):</strong> porta <code>DB_PORT_EXPOSE</code> (ex.: 3307)</li>
        </ul>
        <p class="note">
          Sem Docker: suba o MySQL, na pasta <code>ti-clinic-test</code> rode
          <code>yarn install</code> e <code>yarn start:dev</code>; em
          <code>ti-clinic-front</code> defina <code>VUE_APP_API_BASE_URL</code> se a API não estiver
          em <code>http://localhost:3001</code> e rode <code>yarn serve</code>.
        </p>
      </section>

      <section class="card">
        <h2>Ordem sugerida no front (fluxo do autor)</h2>
        <p class="muted">
          Caminho mínimo que o autor do projeto costuma seguir para demonstrar o uso fim a fim.
        </p>
        <ol class="steps">
          <li><strong>Cadastro</strong> — na tela de login, use <em>Cadastre-se</em> e crie uma conta (e-mail, senha forte, nome de exibição).</li>
          <li><strong>Login</strong> — entre com o mesmo e-mail e senha.</li>
          <li><strong>Pacientes</strong> — cadastre pelo menos um paciente (dados e, se for usar convênio, plano e contrato conforme a tela).</li>
          <li><strong>Agendamentos</strong> — marque uma consulta (paciente, data/hora, médico e especialidade alinhados, convênio ou particular, procedimentos se aplicável).</li>
          <li><strong>Fluxo “normal” de cadastros</strong> — em seguida explore o restante do menu: planos de saúde, especialidades, médicos, procedimentos, início, etc., na ordem que preferir.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Ordem útil para cadastros mestres (evitar bloqueios)</h2>
        <p class="muted">
          O sistema não obriga essa ordem no menu, mas algumas telas dependem de dados já existentes.
        </p>
        <ol class="steps">
          <li><strong>Planos de saúde</strong> — se for vincular paciente a convênio.</li>
          <li><strong>Especialidades</strong> — antes de cadastrar médicos (cada médico tem uma especialidade).</li>
          <li><strong>Médicos</strong> — exige especialidade cadastrada.</li>
          <li><strong>Procedimentos</strong> — para aparecer na hora de montar a consulta, se a tela de agendamento usar procedimentos.</li>
          <li><strong>Pacientes</strong> — com ou sem plano.</li>
          <li><strong>Agendamentos</strong> — consulta com paciente e profissional (e regras de convênio da própria tela).</li>
        </ol>
      </section>

      <section class="card">
        <h2>Documentação da API</h2>
        <p>
          Com a API no ar, a documentação interativa fica em
          <strong><code>/api</code></strong> na mesma base URL da API (ex. link acima).
        </p>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EvaluatorGuideView",
});
</script>

<style lang="scss" scoped>
.evaluator-page {
  min-height: 100vh;
  padding: 1.5rem 1rem 2.5rem;
  background: linear-gradient(145deg, #e8f4fc 0%, #d4e8f2 40%, #b8d9ea 100%);
  color: #1a2f3d;
}

.evaluator-shell {
  max-width: 720px;
  margin: 0 auto;
}

.evaluator-header {
  margin-bottom: 1.25rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f6f96;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d3d5c;
  letter-spacing: -0.02em;
}

.lead {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #3d5a6c;
}

.card {
  margin-top: 1rem;
  padding: 1.25rem 1.35rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(15, 60, 90, 0.08);
  border: 1px solid #d4e5ee;

  h2 {
    margin: 0 0 0.65rem;
    font-size: 1.05rem;
    font-weight: 700;
    color: #0d3d5c;
  }

  p {
    margin: 0 0 0.65rem;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #2c4a5c;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    margin: 0 0 0.5rem;
    padding-left: 1.2rem;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #2c4a5c;
  }

  li {
    margin: 0.35rem 0;
  }
}

.steps li strong {
  color: #0d3d5c;
}

.muted {
  font-size: 0.85rem !important;
  color: #5a7a8c !important;
}

.note {
  margin-top: 0.75rem !important;
  padding: 0.65rem 0.75rem;
  font-size: 0.82rem !important;
  line-height: 1.45 !important;
  color: #3d5a6c !important;
  background: #f4f8fb;
  border-radius: 8px;
  border: 1px solid #d8e6ee;
}

.code-block {
  margin: 0.5rem 0 0.75rem;
  padding: 0.85rem 1rem;
  overflow-x: auto;
  font-size: 0.82rem;
  line-height: 1.45;
  background: #0d3d5c;
  color: #e8f4fc;
  border-radius: 8px;
}

.code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.88em;
  padding: 0.1em 0.35em;
  background: #f0f6fa;
  border-radius: 4px;
  color: #0d3d5c;
  word-break: break-word;
}

@media (max-width: 480px) {
  .evaluator-page {
    padding: 1rem 0.75rem 2rem;
  }

  .title {
    font-size: 1.3rem;
  }

  .card {
    padding: 1rem 1rem;
  }
}
</style>
