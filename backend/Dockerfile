# Production Dockerfile for Backend
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies needed for SQLite and Prisma
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

# Final stage
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/index.js ./
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/src ./src

EXPOSE 5000

# Script to run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
