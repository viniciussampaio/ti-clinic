# TI Clinic

Monorepo com o front-end (`ti-clinic-front`) e a API NestJS (`ti-clinic-test`).

---

## Informações para o avaliador

Como subir o ambiente, URLs e ordem sugerida para exercitar o sistema no front-end.

### Subir front-end, API e banco (Docker)

Na **raiz do monorepo** (pasta que contém `ti-clinic-front` e `ti-clinic-test`):

```bash
docker compose --env-file ./ti-clinic-test/.env.docker up --build
```

Com o arquivo padrão `.env.docker` do back-end, em geral:

- **Front:** `http://localhost:8080` (porta `WEB_PORT_EXPOSE` se alterada)
- **API:** `http://localhost:<API_PORT_EXPOSE>` — no `docker-compose` da API o valor padrão é **3000** se `API_PORT_EXPOSE` não estiver definido; em muitos `.env` de exemplo usa-se **3001**
- **Swagger:** mesma base da API + `/api` (ex.: `http://localhost:3000/api` ou `http://localhost:3001/api`)
- **MySQL (host):** porta `DB_PORT_EXPOSE` (ex.: 3307)

Confira `API_PORT_EXPOSE`, `WEB_PORT_EXPOSE` e `DB_PORT_EXPOSE` no arquivo `ti-clinic-test/.env.docker`.

**Sem Docker:** suba o MySQL; na pasta `ti-clinic-test` rode `yarn install` e `yarn start:dev`; em `ti-clinic-front` defina `VUE_APP_API_BASE_URL` se a API não estiver na URL que o front espera (por padrão o front usa `http://localhost:3001` quando a variável não está definida) e rode `yarn serve`.

### Ordem sugerida no front (fluxo do autor)

Caminho mínimo que o autor do projeto costuma seguir para demonstrar o uso fim a fim.

1. **Cadastro** — na tela de login, use _Cadastre-se_ e crie uma conta (e-mail, senha forte, nome de exibição).
2. **Login** — entre com o mesmo e-mail e senha.
3. **Pacientes** — cadastre pelo menos um paciente (dados e, se for usar convênio, plano e contrato conforme a tela).
4. **Agendamentos** — marque uma consulta (paciente, data/hora, médico e especialidade alinhados, convênio ou particular, procedimentos se aplicável).
5. **Fluxo “normal” de cadastros** — em seguida explore o restante do menu: planos de saúde, especialidades, médicos, procedimentos, início, etc., na ordem que preferir.

### Ordem útil para cadastros mestres (evitar bloqueios)

O sistema não obriga essa ordem no menu, mas algumas telas dependem de dados já existentes.

1. **Planos de saúde** — se for vincular paciente a convênio.
2. **Especialidades** — antes de cadastrar médicos (cada médico tem uma especialidade).
3. **Médicos** — exige especialidade cadastrada.
4. **Procedimentos** — para aparecer na hora de montar a consulta, se a tela de agendamento usar procedimentos.
5. **Pacientes** — com ou sem plano.
6. **Agendamentos** — consulta com paciente e profissional (e regras de convênio da própria tela).

### Documentação da API

Com a API no ar, a documentação interativa fica em **`/api`** na mesma base URL da API (por exemplo `http://localhost:3000/api` ou `http://localhost:3001/api`, conforme a porta publicada).

### Mesmo conteúdo na aplicação

No front-end, a rota **Avaliador** (`/para-avaliador`) repete essas instruções para consulta rápida durante a demonstração.
