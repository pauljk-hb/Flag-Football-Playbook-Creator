# --- STAGE 1: Build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Workspace Konfiguration kopieren
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY apps/frontend/package*.json ./apps/frontend/

# Abhängigkeiten installieren
RUN npm ci

# Quellcode kopieren
COPY packages/core ./packages/core
COPY apps/frontend ./apps/frontend

# Core und dann Frontend bauen
RUN npm run build -w @playbook/core
RUN npm run build -w frontend

# --- STAGE 2: Nginx Webserver ---
FROM nginx:alpine

# Nginx so konfigurieren, dass React Router funktioniert (SPA Fallback)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Gebaute Dateien aus Stage 1 in den Webserver kopieren
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]