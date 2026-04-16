#
# Multi-stage Dockerfile for NestJS + Yarn
# - dev: runs `yarn start:dev` (watch) for local Docker usage
# - prod: builds and runs compiled JS
#

FROM node:20-alpine AS base
WORKDIR /app

# Enable corepack (yarn)
RUN corepack enable

COPY package.json yarn.lock ./

FROM base AS deps
RUN yarn install --frozen-lockfile

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["yarn", "start:dev"]

FROM deps AS build
COPY . .
RUN yarn build

FROM node:20-alpine AS prod
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]

