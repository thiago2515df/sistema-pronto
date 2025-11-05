# 🐳 Guia de Implantação com Docker

Este guia mostra como implantar o Sistema de Propostas de Viagem usando Docker em um servidor VPS.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado no seu servidor:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)
- **Git** (para clonar o repositório)

### Instalar Docker e Docker Compose

#### Ubuntu/Debian:

```bash
# Atualizar pacotes
sudo apt update

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

#### CentOS/RHEL:

```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalação
docker --version
docker compose version
```

---

## 🚀 Implantação Rápida

### 1️⃣ Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/thiago2515df/sistema-pronto.git
cd sistema-pronto
```

### 2️⃣ Configurar Variáveis de Ambiente

Edite o arquivo `docker-compose.yml` e altere as seguintes variáveis:

```yaml
environment:
  # ALTERE ISTO para uma chave secreta forte
  - JWT_SECRET=sua-chave-secreta-super-forte-aqui
  
  # ALTERE ISTO para o domínio ou IP do seu servidor
  - PUBLIC_URL=http://seu-dominio.com
  # ou
  - PUBLIC_URL=http://seu-ip:3000
```

**Exemplo:**

```yaml
environment:
  - JWT_SECRET=minha-chave-super-secreta-12345
  - PUBLIC_URL=http://propostas.meusite.com
```

### 3️⃣ Iniciar o Sistema

```bash
# Iniciar apenas a aplicação (sem Nginx)
docker compose up -d

# OU iniciar com Nginx (recomendado para produção)
docker compose --profile with-nginx up -d
```

### 4️⃣ Verificar Status

```bash
# Ver containers rodando
docker compose ps

# Ver logs
docker compose logs -f

# Ver logs apenas da aplicação
docker compose logs -f app
```

### 5️⃣ Acessar o Sistema

Abra seu navegador em:

```
http://seu-servidor:3000
```

Ou se estiver usando Nginx:

```
http://seu-servidor
```

---

## 🔐 Login Administrador

Para fazer login como administrador, acesse:

```
http://seu-servidor:3000/api/auto-login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbiIsImFwcElkIjoicHJvcG9zdGEtdmlhZ2VtLXJpbyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzkzNTcyMjE4fQ.JNRnpXVXiVhTTt4hBeoTr_aL495tKkDWDVumg8Fi3-Y
```

---

## 🛠️ Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar containers
docker compose up -d

# Parar containers
docker compose down

# Reiniciar containers
docker compose restart

# Ver logs em tempo real
docker compose logs -f

# Ver status dos containers
docker compose ps

# Executar comando dentro do container
docker compose exec app sh
```

### Atualização do Sistema

```bash
# Parar containers
docker compose down

# Atualizar código do repositório
git pull origin main

# Reconstruir imagem
docker compose build --no-cache

# Iniciar novamente
docker compose up -d
```

### Backup do Banco de Dados

```bash
# Criar backup
docker compose exec app cp /app/data/proposta-viagem.db /app/data/backup-$(date +%Y%m%d).db

# Copiar backup para o host
docker compose cp app:/app/data/backup-$(date +%Y%m%d).db ./backup-$(date +%Y%m%d).db
```

### Limpeza

```bash
# Remover containers, redes e volumes
docker compose down -v

# Remover imagens não utilizadas
docker image prune -a

# Remover tudo (cuidado!)
docker system prune -a --volumes
```

---

## 🌐 Configuração com Nginx (Recomendado)

### Opção 1: Usar Nginx incluído

O projeto já inclui configuração do Nginx. Para usá-lo:

```bash
# Iniciar com Nginx
docker compose --profile with-nginx up -d
```

O sistema estará disponível na porta 80 (HTTP).

### Opção 2: Nginx externo

Se você já tem Nginx instalado no servidor, adicione esta configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Configuração SSL/HTTPS

### Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

### Usando certificado próprio

1. Coloque seus certificados em `./ssl/`:
   - `cert.pem` - Certificado
   - `key.pem` - Chave privada

2. Descomente a seção HTTPS no `nginx.conf`

3. Reinicie o Nginx:
   ```bash
   docker compose restart nginx
   ```

---

## 📊 Monitoramento

### Verificar saúde do container

```bash
# Ver status de saúde
docker compose ps

# Ver logs de saúde
docker inspect proposta-viagem-app | grep -A 10 Health
```

### Verificar recursos

```bash
# Ver uso de recursos
docker stats

# Ver uso de disco
docker system df
```

---

## 🔧 Solução de Problemas

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs app

# Verificar configuração
docker compose config

# Reconstruir do zero
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Erro de permissão

```bash
# Ajustar permissões
sudo chown -R 1001:1001 data/ uploads/
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :3000

# Alterar porta no docker-compose.yml
ports:
  - "8080:3000"  # Usar porta 8080 no host
```

### Banco de dados corrompido

```bash
# Restaurar backup
docker compose down
cp backup-YYYYMMDD.db data/proposta-viagem.db
docker compose up -d
```

---

## 📁 Estrutura de Volumes

Os seguintes diretórios são persistidos:

```
./data/          # Banco de dados SQLite
./uploads/       # Imagens enviadas pelos usuários
```

**IMPORTANTE:** Faça backup regular destes diretórios!

---

## 🚀 Implantação em Diferentes VPS

### DigitalOcean

```bash
# Criar droplet Ubuntu 22.04
# Conectar via SSH
ssh root@seu-ip

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Clonar e iniciar
git clone https://github.com/thiago2515df/sistema-pronto.git
cd sistema-pronto
# Editar docker-compose.yml
docker compose up -d
```

### AWS EC2

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ip

# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin -y

# Clonar e iniciar
git clone https://github.com/thiago2515df/sistema-pronto.git
cd sistema-pronto
# Editar docker-compose.yml
sudo docker compose up -d
```

### Linode

```bash
# Conectar via SSH
ssh root@seu-ip

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Clonar e iniciar
git clone https://github.com/thiago2515df/sistema-pronto.git
cd sistema-pronto
# Editar docker-compose.yml
docker compose up -d
```

---

## 🔐 Segurança

### Recomendações de Segurança:

1. **Altere o JWT_SECRET** para uma chave forte e única
2. **Use HTTPS** em produção (SSL/TLS)
3. **Configure firewall** (UFW, iptables)
4. **Atualize regularmente** o sistema e Docker
5. **Faça backups** regulares do banco de dados
6. **Limite acesso SSH** (use chaves, desabilite root)
7. **Use Fail2ban** para proteção contra ataques

### Configurar Firewall (UFW):

```bash
# Instalar UFW
sudo apt install ufw

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable

# Ver status
sudo ufw status
```

---

## 📝 Variáveis de Ambiente

Todas as variáveis disponíveis no `docker-compose.yml`:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente de execução | `production` |
| `PORT` | Porta interna do container | `3000` |
| `DATABASE_URL` | Caminho do banco SQLite | `file:./data/proposta-viagem.db` |
| `JWT_SECRET` | Chave secreta para JWT | **ALTERE ISTO** |
| `OWNER_OPEN_ID` | ID do proprietário | `admin` |
| `PUBLIC_URL` | URL pública do site | **ALTERE ISTO** |

---

## ✅ Checklist de Implantação

- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] `JWT_SECRET` alterado no docker-compose.yml
- [ ] `PUBLIC_URL` configurado corretamente
- [ ] Firewall configurado (portas 80, 443, 22)
- [ ] Sistema iniciado com `docker compose up -d`
- [ ] Acesso ao sistema verificado
- [ ] Login administrador testado
- [ ] Backup configurado
- [ ] SSL/HTTPS configurado (produção)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs: `docker compose logs -f`
2. Consulte esta documentação
3. Verifique o README.md do projeto

---

**Versão:** 1.0.0  
**Data:** Novembro 2025  
**Compatibilidade:** Docker 20.10+, Docker Compose 2.0+
