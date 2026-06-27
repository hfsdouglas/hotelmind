# Stage 1: Etapa de Build - Instala dependências e prepara ambiente
FROM node:22-slim AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npm prune --production

# Stage 2: Etapa de Produção - Imagem final otimizada
FROM node:22-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV PORT=${PORT}

EXPOSE $PORT

CMD ["node", "dist/server.js"]