# ============================================
# BUILD STAGE
# ============================================
FROM node:20-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# ============================================
# PRODUCTION STAGE
# ============================================
FROM node:20-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Instalar apenas runtime necessário
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar node_modules e build do stage anterior
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Usar usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

