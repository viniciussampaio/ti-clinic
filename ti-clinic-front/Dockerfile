# Desenvolvimento: Vue CLI em 0.0.0.0 para acessar pelo host (Docker Desktop).
FROM node:20-alpine
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8080
ENV HOST=0.0.0.0

CMD ["yarn", "serve", "--", "--host", "0.0.0.0", "--port", "8080"]
