#!/bin/bash

# Script de Instalação Simplificado
# Sistema de Propostas de Viagem

set -e

echo "============================================"
echo "  Instalação do Sistema de Propostas"
echo "============================================"
echo ""

# Instalar Node.js 18
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
apt install -y nodejs > /dev/null 2>&1
npm install -g pnpm > /dev/null 2>&1
echo "✓ Node.js instalado"

# Clonar repositório
echo "📥 Baixando sistema..."
cd /root
if [ -d "sistema-pronto" ]; then
    rm -rf sistema-pronto
fi
git clone https://github.com/thiago2515df/sistema-pronto.git > /dev/null 2>&1
cd sistema-pronto
echo "✓ Sistema baixado"

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install > /dev/null 2>&1
echo "✓ Dependências instaladas"

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me)

# Criar arquivo .env
echo "⚙️  Configurando..."
cat > .env << EOF
DATABASE_URL=file:./data/proposta-viagem.db
JWT_SECRET=$(openssl rand -base64 32)
OWNER_OPEN_ID=admin
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=production
PUBLIC_URL=http://${PUBLIC_IP}:3000
VITE_APP_ID=proposta-viagem-rio
VITE_APP_TITLE=Sistema de Propostas de Viagem
VITE_APP_LOGO=/logo-excursao-brasilia.png
VITE_OAUTH_PORTAL_URL=https://api.manus.im
EOF
echo "✓ Configurado"

# Liberar porta
echo "🔓 Liberando porta 3000..."
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp > /dev/null 2>&1 || true
fi
echo "✓ Porta liberada"

# Matar processos node antigos
pkill -f "node dist/index.js" 2>/dev/null || true

# Iniciar sistema
echo "🚀 Iniciando sistema..."
cd /root/sistema-pronto
NODE_ENV=production nohup node dist/index.js > server.log 2>&1 &
sleep 3

echo ""
echo "============================================"
echo "✓ INSTALAÇÃO CONCLUÍDA!"
echo "============================================"
echo ""
echo "🎉 Seu sistema está rodando em:"
echo ""
echo "   http://${PUBLIC_IP}:3000"
echo ""
echo "🔐 Login Administrador:"
echo ""
echo "   http://${PUBLIC_IP}:3000/api/auto-login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbiIsImFwcElkIjoicHJvcG9zdGEtdmlhZ2VtLXJpbyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzkzNTcyMjE4fQ.JNRnpXVXiVhTTt4hBeoTr_aL495tKkDWDVumg8Fi3-Y"
echo ""
echo "📊 Ver logs:"
echo "   tail -f /root/sistema-pronto/server.log"
echo ""
echo "============================================"
