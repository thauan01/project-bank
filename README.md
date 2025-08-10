# Project Bank - Monorepo

Este é um monorepo contendo os microsserviços do sistema bancário.

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura de microsserviços com os seguintes componentes:

### 📦 Microsserviços

- **project-bank-clients**: Microsserviço responsável pela gestão de clientes
- **project-bank-transactions**: Microsserviço responsável pela gestão de transações

### 🛠️ Infraestrutura

- **PostgreSQL**: Banco de dados principal
- **RabbitMQ**: Sistema de mensageria entre microsserviços
- **Docker Compose**: Orquestração dos serviços

## 🚀 Como executar

### Pré-requisitos

- Node.js (v18+)
- Docker e Docker Compose
- Git

### Executando a infraestrutura

```bash
# Subir PostgreSQL e RabbitMQ
docker-compose up -d
```

### Executando os microsserviços

#### Microsserviço de Clientes
```bash
cd project-bank-clients
npm install
npm run start:dev
```

#### Microsserviço de Transações
```bash
cd project-bank-transactions
npm install
npm run start:dev
```

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

## 🔧 Desenvolvimento

### Scripts úteis

```bash
# Instalar dependências em todos os microsserviços
npm run install:all

# Executar testes em todos os microsserviços
npm run test:all

# Build de todos os microsserviços
npm run build:all
```

## 📋 Endpoints

### Microsserviço de Clientes
- Base URL: `http://localhost:3001`

### Microsserviço de Transações
- Base URL: `http://localhost:3000`

## 🐳 Docker

Os serviços de infraestrutura podem ser executados via Docker:

- **PostgreSQL**: `localhost:5432`
- **RabbitMQ Management**: `http://localhost:15672` (admin/admin)
- **RabbitMQ AMQP**: `localhost:5672`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
