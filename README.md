# Project Bank - Monorepo

Este é um monorepo contendo os microsserviços do sistema bancário desenvolvido com NestJS, PostgreSQL e RabbitMQ.

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura de microsserviços com os seguintes componentes:

### 📦 Microsserviços

- **project-bank-clients**: Microsserviço responsável pela gestão de clientes (Porta 3001)
- **project-bank-transactions**: Microsserviço responsável pela gestão de transações (Porta 3000)

### 🛠️ Infraestrutura

- **PostgreSQL**: Banco de dados principal (Porta 5432)
- **RabbitMQ**: Sistema de mensageria entre microsserviços (Portas 5672/15672)
- **Docker Compose**: Orquestração dos serviços

## 🚀 Como executar o projeto

### ⚠️ Pré-requisitos obrigatórios

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **Docker** e **Docker Compose** - [Download](https://docker.com/)
- **Git** - [Download](https://git-scm.com/)

### 📋 Passo a passo para executar

#### 1️⃣ Clone o repositório
```bash
git clone <url-do-repositorio>
cd project-bank
```

#### 2️⃣ **IMPORTANTE**: Execute a infraestrutura primeiro
```bash
# Subir PostgreSQL e RabbitMQ (OBRIGATÓRIO antes dos microsserviços)
docker-compose up -d


#### Create a `.env` file in the root directory with the following variables:
```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=bank-transactions-user
DATABASE_PASSWORD=bank-transactions-password
DATABASE_NAME=bank-transactions-database

# RABBIT MQ Configuration
RABBITMQ_URL=amqp://admin:admin@localhost:5672
RABBITMQ_QUEUE=bank-transaction-to-client-queue

# Services Configuration
CLIENTS_SERVICE_PORT=3001
TRANSACTIONS_SERVICE_PORT=3002
```
```

**⏱️ Aguarde alguns segundos** para que os serviços do Docker sejam inicializados completamente.

#### 3️⃣ Execute o microsserviço de Clientes
Abra um **novo terminal** e execute:
```bash
cd project-bank-clients
npm install
npm run start:dev
```



#### 4️⃣ Execute o microsserviço de Transações
Abra **outro terminal** e execute:
```bash
cd project-bank-transactions
npm install
npm run start:dev
```

### ✅ Verificando se tudo está funcionando

Após executar todos os passos, você deve ter:

- **PostgreSQL**: Rodando na porta 5432
- **RabbitMQ Management**: Acessível em http://localhost:15672 (admin/admin)
- **Microsserviço de Clientes**: Rodando na porta 3001
- **Microsserviço de Transações**: Rodando na porta 3000

### 🔧 Comandos úteis para desenvolvimento

## 📁 Estrutura do Projeto

```
project-bank/
├── docker-compose.yml              # Orquestração da infraestrutura
├── rabbitmq-definitions.json       # Configurações do RabbitMQ
├── rabbitmq.conf                   # Configurações do RabbitMQ
├── project-bank-clients/           # Microsserviço de Clientes
│   ├── src/
│   ├── package.json
│   └── ...
└── project-bank-transactions/      # Microsserviço de Transações
    ├── src/
    │   ├── adapter/                # Camada de adaptadores
    │   ├── domain/                 # Camada de domínio
    │   └── config/                 # Configurações
    ├── package.json
    └── ...
```

### 🔧 Comandos úteis para desenvolvimento

```bash
# Parar a infraestrutura
docker-compose down

# Reiniciar a infraestrutura
docker-compose restart

# Ver logs da infraestrutura
docker-compose logs -f

# Limpar cache do npm (se houver problemas)
cd project-bank-clients && npm cache clean --force
cd project-bank-transactions && npm cache clean --force

# Executar testes
cd project-bank-clients && npm test
cd project-bank-transactions && npm test
```

### 🐛 Solução de problemas comuns

**Problema**: Microsserviços não conseguem conectar com PostgreSQL/RabbitMQ
- **Solução**: Certifique-se de que executou `docker-compose up -d` primeiro e aguarde alguns segundos

**Problema**: Porta já está em uso
- **Solução**: Verifique se não há outros serviços rodando nas portas 3000, 3001, 5432 ou 15672

**Problema**: Erro de instalação do npm
- **Solução**: Execute `npm cache clean --force` e tente novamente

## 📋 Endpoints e Documentação

### Microsserviço de Clientes
- **Base URL**: `http://localhost:3001`
- **Swagger/OpenAPI**: `http://localhost:3001/api` (se configurado)

### Microsserviço de Transações
- **Base URL**: `http://localhost:3000`  
- **Swagger/OpenAPI**: `http://localhost:3000/api` (se configurado)

## 🐳 Serviços de Infraestrutura (Docker)

Os seguintes serviços são executados via Docker Compose:

- **PostgreSQL**: 
  - Porta: `localhost:5432`
  - Database: `bank-transactions-database`
  - Usuário: `bank-transactions-user`
  - Senha: `bank-transactions-password`

- **RabbitMQ**: 
  - **Management Interface**: `http://localhost:15672` 
    - Usuário: `admin`
    - Senha: `admin`
  - **AMQP**: `localhost:5672`

> 💡 **Dica**: Acesse o painel do RabbitMQ em http://localhost:15672 para monitorar as filas e trocas de mensagens entre os microsserviços.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
