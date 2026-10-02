# FinanceControl API

API para controle financeiro com autenticação JWT, banco PostgreSQL e documentação Swagger.

## Requisitos

Antes de rodar o projeto, você precisa ter instalado:

- Java 21
- Maven
- PostgreSQL
- Git

## Banco de dados

Crie um banco PostgreSQL para o projeto, por exemplo:

```sql
CREATE DATABASE financecontrol;
```

O projeto usa Liquibase, então as tabelas são criadas automaticamente ao iniciar a aplicação.

## Variáveis de ambiente

O projeto lê as seguintes variáveis quando de ambiente dev em [src/main/resources/application-dev.yml](src/main/resources/application-dev.yml):

```bash
export DB_URL=jdbc:postgresql://localhost:5432/financecontrol
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=uma-chave-secreta-forte
export APP_PUBLIC_URL=http://localhost:8080
export SUPERADMIN_EMAIL=admin@financecontrol.com
export SUPERADMIN_PASSWORD=123456
export SUPERADMIN_NAME=Administrador
export MAIL_USER=seu-email@gmail.com
export MAIL_PASSWORD=sua-senha-de-app
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export APP_FRONT_URL=http://localhost:5173
```

Observações:
- `DB_URL`, `DB_USER` e `DB_PASSWORD` são usadas para conectar ao PostgreSQL.
- `JWT_SECRET` é usada para assinar os tokens de autenticação.
- `SUPERADMIN_*` definem o usuário administrador inicial criado pela aplicação.
- `APP_PUBLIC_URL` é opcional e já tem valor padrão de `http://localhost:8080`.
- `MAIL_USER` e `MAIL_PASSWORD` são usadas para enviar o e-mail de recuperação de senha. No Gmail, `MAIL_PASSWORD` deve ser uma senha de app (https://myaccount.google.com/apppasswords), que exige a verificação em duas etapas ativa.
- `MAIL_HOST` e `MAIL_PORT` são opcionais e já têm valor padrão de `smtp.gmail.com` e `587`.
- `APP_FRONT_URL` é opcional, já tem valor padrão de `http://localhost:5173` e é usada para montar o link de recuperação de senha.

## Como rodar

1. Clone o projeto
2. Configure as variáveis de ambiente
3. Execute:

```bash
./mvnw spring-boot:run
```

A aplicação ficará disponível em:

- http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html

## Estrutura do projeto

- Spring Boot
- Spring Security
- JWT
- PostgreSQL
- Liquibase
- Swagger
