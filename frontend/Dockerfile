# ───────────── Stage 1 : build avec Node ─────────────
FROM node:20-alpine AS build
WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ───────────── Stage 2 : nginx pour servir le SPA ─────────────
FROM nginx:1.25-alpine

# Config custom pour le routing React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80