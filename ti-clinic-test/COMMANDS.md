# Comandos principais

## Projeto (sem Docker)

### Instalar dependencias

```bash
yarn install
```

### Rodar API

```bash
# desenvolvimento
yarn start:dev

# modo normal
yarn start

# producao (requer build)
yarn build
yarn start:prod
```

### Qualidade e testes

```bash
# lint
yarn lint

# unit tests
yarn test

# testes e2e
yarn test:e2e

# cobertura
yarn test:cov
```

### Banco e migrations

```bash
# executar migrations pendentes
yarn migration:run

# desfazer ultima migration
yarn migration:revert

# listar status das migrations
yarn migration:show
```

## Docker

### Subir stack (API + MySQL)

O Compose le o arquivo `.env` da pasta do projeto para substituir portas no YAML. O arquivo `.env.docker` define ambiente **dentro** dos containers; para usar tambem as portas `API_PORT_EXPOSE` e `DB_PORT_EXPOSE` definidas la, passe o mesmo arquivo na linha de comando:

```bash
docker compose --env-file .env.docker up --build
```

Sem `--env-file`, use `API_PORT_EXPOSE` e `DB_PORT_EXPOSE` no seu `.env` na raiz do `ti-clinic-test`, ou suba assim:

```bash
docker compose up --build
```

### Subir em background

```bash
docker compose --env-file .env.docker up --build -d
```

### Ver containers

```bash
docker compose ps
```

### Ver logs

```bash
# logs de todos os servicos
docker compose logs -f

# logs so da API
docker compose logs -f api

# logs so do banco
docker compose logs -f db
```

### Parar stack

```bash
docker compose down
```

### Parar e remover volumes

```bash
docker compose down -v
```

### Caso as portas padrao estejam ocupadas

Nao use `PORT` para mudar a porta no host: `PORT` e a porta em que o Nest escuta **dentro** do container e deve combinar com o lado direito do mapeamento (`...:3000`).

Use `API_PORT_EXPOSE` (API no host) e `DB_PORT_EXPOSE` (MySQL no host):

```bash
# PowerShell (sessao atual):
$env:API_PORT_EXPOSE=3001
$env:DB_PORT_EXPOSE=3307
docker compose up --build -d
```

Ou defina essas variaveis no arquivo `.env` ao lado de `docker-compose.yml`.

## Acesso rapido (com Docker ligado)

- API: `http://localhost:<API_PORT_EXPOSE>` (padrao **3000** se nao definir nada; `.env.docker` usa **3001** com `--env-file .env.docker`)
- Swagger: mesma base URL + `/api`
- MySQL no host: `localhost:<DB_PORT_EXPOSE>` (padrao **3306**; `.env.docker` usa **3307**)

