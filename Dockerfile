# Dockerfile para Sistema de Propostas de Viagem
# Multi-stage build para otimizar o tamanho da imagem

# Estágio 1: Build
FROM node:18-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Fazer build de produção
RUN NODE_ENV=production pnpm run build

# Estágio 2: Produção
FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# Copiar arquivos de configuração
COPY ecosystem.config.cjs ./
COPY drizzle.config.sqlite.ts ./
COPY tsconfig.json ./

# Criar diretórios necessários com permissões corretas
RUN mkdir -p data uploads && \
    chown -R nodejs:nodejs /app

# Copiar banco de dados e uploads (se existirem)
COPY --chown=nodejs:nodejs data ./data
COPY --chown=nodejs:nodejs uploads ./uploads

# Mudar para usuário não-root
USER nodejs

# Expor porta 3000
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
