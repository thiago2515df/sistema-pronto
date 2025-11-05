#!/bin/bash

# Script de Instalação Automática
# Sistema de Propostas de Viagem
# Hostinger VPS - IP: 72.61.42.184

set -e

echo "============================================"
echo "  Sistema de Propostas de Viagem"
echo "  Instalação Automática"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (use: sudo bash install.sh)"
    exit 1
fi

# Passo 1: Atualizar sistema
print_info "Passo 1/5: Atualizando sistema..."
apt update -qq > /dev/null 2>&1
print_success "Sistema atualizado"

# Passo 2: Instalar Docker
print_info "Passo 2/5: Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
    apt install docker-compose-plugin -y > /dev/null 2>&1
    print_success "Docker instalado"
else
    print_success "Docker já está instalado"
fi

# Passo 3: Instalar Git
print_info "Passo 3/5: Verificando Git..."
if ! command -v git &> /dev/null; then
    apt install git -y > /dev/null 2>&1
    print_success "Git instalado"
else
    print_success "Git já está instalado"
fi

# Passo 4: Baixar sistema
print_info "Passo 4/5: Baixando sistema do GitHub..."
cd /root
if [ -d "sistema-pronto" ]; then
    print_info "Diretório já existe, atualizando..."
    cd sistema-pronto
    git pull > /dev/null 2>&1
else
    git clone https://github.com/thiago2515df/sistema-pronto.git > /dev/null 2>&1
    cd sistema-pronto
fi
print_success "Sistema baixado"

# Passo 5: Configurar variáveis
print_info "Passo 5/5: Configurando sistema..."

# Gerar JWT_SECRET aleatório
JWT_SECRET=$(openssl rand -base64 32)

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me)

# Criar arquivo .env
cat > .env << EOF
# Variáveis de Ambiente para o Frontend (Vite)
VITE_APP_ID=proposta-viagem-rio
VITE_APP_TITLE=Sistema de Propostas de Viagem
VITE_APP_LOGO=/logo-excursao-brasilia.png
VITE_OAUTH_PORTAL_URL=https://api.manus.im

# Variáveis de Ambiente para o Backend
DATABASE_URL=file:./data/proposta-viagem.db
JWT_SECRET=${JWT_SECRET}
OWNER_OPEN_ID=admin
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=production

# URL pública do seu site
PUBLIC_URL=http://${PUBLIC_IP}:3000
EOF

# Atualizar docker-compose.yml
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" docker-compose.yml
sed -i "s|PUBLIC_URL=.*|PUBLIC_URL=http://${PUBLIC_IP}:3000|g" docker-compose.yml

print_success "Sistema configurado"

# Passo 6: Liberar porta no firewall
print_info "Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp > /dev/null 2>&1 || true
    print_success "Porta 3000 liberada"
fi

# Passo 7: Iniciar sistema
print_info "Iniciando sistema..."
docker compose up -d

echo ""
echo "============================================"
echo -e "${GREEN}✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "============================================"
echo ""
echo "🎉 Seu sistema está rodando em:"
echo ""
echo -e "${BLUE}   http://${PUBLIC_IP}:3000${NC}"
echo ""
echo "🔐 Login Administrador:"
echo ""
echo "   http://${PUBLIC_IP}:3000/api/auto-login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbiIsImFwcElkIjoicHJvcG9zdGEtdmlhZ2VtLXJpbyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzkzNTcyMjE4fQ.JNRnpXVXiVhTTt4hBeoTr_aL495tKkDWDVumg8Fi3-Y"
echo ""
echo "📊 Comandos úteis:"
echo ""
echo "   Ver logs:      docker compose logs -f"
echo "   Parar:         docker compose down"
echo "   Reiniciar:     docker compose restart"
echo "   Status:        docker compose ps"
echo ""
echo "============================================"
