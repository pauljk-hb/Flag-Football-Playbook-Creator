# Wir nutzen Debian "bookworm-slim" (anstatt alpine), da das Kompilieren 
# von better-sqlite3 und Prisma auf Debian deutlich stabiler läuft.
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# System-Abhängigkeiten für better-sqlite3 und Prisma installieren
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

# Workspace kopieren
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY apps/backend/package*.json ./apps/backend/

# Installieren
RUN npm ci

# Quellcode kopieren
COPY packages/core ./packages/core
COPY apps/backend ./apps/backend

# 1. Core bauen
RUN npm run build -w @playbook/core
# 2. Prisma Client generieren (braucht backend fürs kompilieren)
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
# 3. Backend bauen
RUN npm run build -w backend

# --- STAGE 2: Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Nur OpenSSL wird für die Runtime von Prisma noch gebraucht
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Da npm workspaces intensiv mit Symlinks arbeiten, kopieren wir den gesamten 
# App-Ordner aus dem Builder. Das ist der sicherste Weg im Monorepo.
COPY --from=builder /app ./

# Ordner für SQLite-Volume erstellen
RUN mkdir -p /app/apps/backend/prisma/data

EXPOSE 4000

# Wichtig: "migrate deploy" nutzt die Migrations-Dateien für ein sicheres Update
CMD ["sh", "-c", "cd apps/backend && DATABASE_URL=file:/app/apps/backend/prisma/data/prod.db npx prisma migrate deploy && cd /app && npm run start -w backend"]