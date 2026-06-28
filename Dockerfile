# Savora — production image
# Works on any Docker host (Railway, Render, Fly.io, a VPS, etc.)
# Node 22 satisfies Vite 7's engine requirement.
FROM node:22-bookworm-slim

# Build tools for the native SQLite module (better-sqlite3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (build tooling included — needed for the build step)
COPY package*.json ./
RUN npm ci

# Build client + server
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Hosts inject PORT; default to 5000 locally.
ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.cjs"]
