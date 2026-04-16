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

```bash
docker compose up --build
```

### Subir em background

```bash
docker compose up --build -d
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

```bash
# API em 3001 e MySQL em 3307
# PowerShell:
$env:PORT=3001
$env:DB_PORT_EXPOSE=3307
docker compose up --build -d
```

## Acesso rapido (com Docker ligado)

- API: `http://localhost:3001` (ou a porta em `PORT`)
- Swagger: `http://localhost:3001/api`
- MySQL: `localhost:3307` (ou a porta em `DB_PORT_EXPOSE`)

