# Deploy - Finance Control

Publicação em `https://jw.eroservice.com.br/finance-control/` usando Docker Compose.

## Arquitetura

```
Servidor web do host (Apache/Nginx + HTTPS)
  └─ /finance-control/  →  127.0.0.1:8081
       └─ front  (nginx: SPA + /finance-control/api/ → api:8080)
            └─ api  (Spring Boot, profile prod)
                 └─ db  (PostgreSQL 17, volume pgdata, sem porta exposta)
```

Somente a porta `127.0.0.1:8081` é publicada. O banco roda isolado na rede interna do Docker.

## 1. Verificações iniciais na VPS

```bash
systemctl status apache2 --no-pager
systemctl status nginx --no-pager
ss -tlnp | grep -E ':8081|:80 |:443 '
free -h
df -h /
docker --version && docker compose version
```

## 2. Código e variáveis de ambiente

```bash
sudo mkdir -p /opt/finance-control
sudo chown $USER:$USER /opt/finance-control
git clone <url-do-repositorio> /opt/finance-control
cd /opt/finance-control
cp .env.example .env
chmod 600 .env
nano .env
```

Gerar valores seguros:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 24   # DB_PASSWORD
```

O arquivo `.env` nunca deve ser versionado.

## 3. Subir os containers

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
curl -I http://127.0.0.1:8081/finance-control/
```

O Liquibase cria as tabelas e o superadmin é criado na primeira inicialização.

## 4. (Opcional) Restaurar um banco existente

Na máquina local:

```bash
pg_dump -U postgres -Fc -d financecontrol -f financecontrol.dump
scp financecontrol.dump usuario@vps:/opt/finance-control/
```

Na VPS, com o banco ainda vazio:

```bash
docker compose up -d db
docker compose cp financecontrol.dump db:/tmp/financecontrol.dump
docker compose exec db sh -c 'pg_restore -U "$POSTGRES_USER" -d financecontrol --no-owner --clean --if-exists /tmp/financecontrol.dump'
docker compose up -d --build
```

## 5. Proxy no servidor web do host

Faça backup do arquivo do site antes de editar.

### Apache

Habilitar os módulos (uma vez):

```bash
sudo a2enmod proxy proxy_http headers
```

Dentro do `<VirtualHost *:443>` do domínio:

```apache
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
ProxyPass        /finance-control/ http://127.0.0.1:8081/finance-control/
ProxyPassReverse /finance-control/ http://127.0.0.1:8081/finance-control/
RedirectMatch ^/finance-control$ /finance-control/
```

```bash
sudo apachectl configtest && sudo systemctl reload apache2
```

### Nginx

Dentro do `server { listen 443 ... }` do domínio:

```nginx
location = /finance-control {
    return 301 /finance-control/;
}

location /finance-control/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Atualizar a aplicação

```bash
cd /opt/finance-control
git pull
docker compose up -d --build
docker image prune -f
```

## Comandos úteis

```bash
docker compose logs -f api
docker compose restart api
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d financecontrol'
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc financecontrol' > backup_$(date +%F).dump
```

## Desenvolvimento local

Nada muda: o front usa `VITE_API_URL` de `financecontrol-front/.env.development` (`http://localhost:8080`)
e a API continua no profile `dev`.
