# --- STAGE 1: Build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Package-Dateien kopieren (für Caching)
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY apps/frontend/package*.json ./apps/frontend/

# Dependencies für das gesamte Monorepo installieren
RUN npm ci

# Restlichen Quellcode kopieren
COPY packages/core ./packages/core
COPY apps/frontend ./apps/frontend

# 1. ZUERST den Core bauen (generiert den 'dist'-Ordner und Typen)
RUN npm run build -w @playbook/core

# 2. DANN erst das Frontend bauen
RUN npm run build -w frontend

# --- STAGE 2: Nginx Webserver ---
FROM nginx:alpine

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Nur die fertigen Vite-Dist-Dateien in den Webserver kopieren
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]