# Sistema de Propostas de Viagem

Sistema completo para criação e gerenciamento de propostas de viagem personalizadas.

## 📦 Requisitos

- Node.js 18 ou superior
- pnpm (gerenciador de pacotes)
- 2GB RAM mínimo
- 10GB espaço em disco

## 🚀 Instalação Rápida

### 1. Instalar dependências

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` e configure:

```bash
# URL pública do seu site
PUBLIC_URL=http://seu-dominio.com

# Ou use seu IP
PUBLIC_URL=http://seu-ip:3000
```

### 3. Fazer build de produção

```bash
NODE_ENV=production pnpm run build
```

### 4. Iniciar o servidor

#### Opção A: Com PM2 (recomendado para produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.cjs

# Ver status
pm2 status

# Ver logs
pm2 logs proposta-viagem-rio
```

#### Opção B: Direto com Node

```bash
NODE_ENV=production node dist/index.js
```

### 5. Acessar o sistema

Abra seu navegador em: `http://localhost:3000`

## 🔐 Login Administrador

Para fazer login como administrador, acesse:

```
http://seu-site:3000/api/auto-login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbiIsImFwcElkIjoicHJvcG9zdGEtdmlhZ2VtLXJpbyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzkzNTcyMjE4fQ.JNRnpXVXiVhTTt4hBeoTr_aL495tKkDWDVumg8Fi3-Y
```

## 📁 Estrutura do Projeto

```
proposta-viagem-rio/
├── client/          # Frontend React + TypeScript
├── server/          # Backend Node.js + Express
├── drizzle/         # Schema e migrações do banco
├── data/            # Banco de dados SQLite
├── uploads/         # Arquivos enviados (fotos)
├── dist/            # Build de produção
├── package.json     # Dependências
└── .env             # Variáveis de ambiente
```

## ✨ Funcionalidades

- ✅ Criação de propostas de viagem personalizadas
- ✅ Upload de foto de capa (sem limite de tamanho)
- ✅ Upload de múltiplas fotos do hotel
- ✅ Cálculo automático de valores e parcelas
- ✅ Compartilhamento de propostas com clientes
- ✅ Painel administrativo completo
- ✅ Sistema de autenticação
- ✅ Design responsivo (mobile e desktop)

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm run dev

# Build de produção
NODE_ENV=production pnpm run build

# Iniciar produção
NODE_ENV=production pnpm start

# Verificar tipos TypeScript
pnpm run check

# Formatar código
pnpm run format
```

## 🔒 Segurança

**IMPORTANTE:** Antes de colocar em produção:

1. Altere `JWT_SECRET` no arquivo `.env` para uma chave forte
2. Configure firewall do servidor
3. Configure SSL/HTTPS (recomendado)
4. Faça backup regular do banco de dados

## 📊 Banco de Dados

O sistema usa SQLite com dados de exemplo incluídos. O arquivo do banco está em:

```
data/proposta-viagem.db
```

Para backup:

```bash
cp data/proposta-viagem.db data/proposta-viagem.db.backup
```

## 🌐 Hospedagem

O sistema pode ser hospedado em:

- VPS (DigitalOcean, Linode, AWS EC2, etc)
- Servidor dedicado
- Localhost (para testes)

**Porta padrão:** 3000 (configurável no `ecosystem.config.cjs`)

## 📝 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + tRPC
- **Banco de Dados:** SQLite + Drizzle ORM
- **Gerenciador:** PM2
- **Autenticação:** JWT

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
pnpm install
```

### Erro: "Port 3000 already in use"
```bash
# Altere a porta no ecosystem.config.cjs
# Ou mate o processo:
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Erro: "Permission denied"
```bash
chmod -R 755 .
chmod -R 777 uploads/ data/
```

### Site não carrega
```bash
# Verifique se o servidor está rodando
pm2 status

# Veja os logs
pm2 logs proposta-viagem-rio

# Verifique firewall
sudo ufw status
```

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.

---

**Versão:** 1.0.0  
**Data:** Novembro 2025
