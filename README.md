# 💳 Sistema de Pagamentos - API RESTful

API completa para gerenciamento de clientes e cobranças com suporte a múltiplos métodos de pagamento (PIX, Cartão de Crédito e Boleto Bancário).

## 🚀 Tecnologias

- **NestJS** 10.x - Framework Node.js progressivo
- **TypeScript** 5.x - Superset JavaScript tipado
- **Prisma** 5.x - ORM moderno
- **PostgreSQL** 15+ - Banco de dados relacional
- **Jest** - Framework de testes
- **Swagger/OpenAPI** - Documentação automática da API
- **Docker** - Containerização

## 📋 Pré-requisitos

- Node.js 18+ (recomendado: 20.x)
- PostgreSQL 15+ (ou Docker)
- npm ou yarn
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd teste
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/payments_db?schema=public"

# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# JWT (para futura autenticação)
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=1h

# Payment Gateway (simulação)
PAYMENT_GATEWAY_URL=https://api.payment-gateway.com
PAYMENT_GATEWAY_API_KEY=your-api-key
```

### 4. Configure o banco de dados

#### Opção A: Usando Docker (Recomendado)

```bash
# Subir PostgreSQL
docker-compose up -d postgres

# Aguardar alguns segundos para o banco iniciar
```

#### Opção B: PostgreSQL Local

Certifique-se de ter o PostgreSQL instalado e rodando, e que a `DATABASE_URL` no `.env` está correta.

### 5. Execute as migrations

```bash
# Gerar o Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev --name init
```

### 6. (Opcional) Seed do banco de dados

```bash
npx prisma db seed
```

## 🏃 Executando a aplicação

### Modo desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

Documentação Swagger: `http://localhost:3000/api/docs`

### Modo produção

```bash
# Build
npm run build

# Start
npm run start:prod
```

### Com Docker

```bash
# Build e start de todos os serviços
docker-compose up -d

# Logs
docker-compose logs -f api

# Parar
docker-compose down
```

## 🧪 Testes

### Todos os testes

```bash
npm run test
```

### Testes unitários

```bash
npm run test:unit
```

### Testes de integração

```bash
npm run test:integration
```

### Testes E2E

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

O relatório será gerado em `coverage/lcov-report/index.html`

### Watch mode (desenvolvimento)

```bash
npm run test:watch
```

## 📖 Documentação da API

### Swagger UI

Acesse `http://localhost:3000/api/docs` após iniciar a aplicação.

### Endpoints Principais

#### Clientes

```http
POST   /api/v1/customers           # Criar cliente
GET    /api/v1/customers/:id       # Buscar cliente
GET    /api/v1/customers           # Listar clientes
PUT    /api/v1/customers/:id       # Atualizar cliente
DELETE /api/v1/customers/:id       # Deletar cliente
```

#### Cobranças

```http
POST   /api/v1/charges              # Criar cobrança
GET    /api/v1/charges/:id          # Buscar cobrança
GET    /api/v1/charges              # Listar cobranças
GET    /api/v1/charges/customer/:id # Cobranças por cliente
PATCH  /api/v1/charges/:id/status   # Atualizar status
```

### Exemplos de Requisições

#### Criar Cliente

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678901",
    "phone": "+5511999999999"
  }'
```

#### Criar Cobrança PIX

```bash
curl -X POST http://localhost:3000/api/v1/charges \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "customerId": "customer-uuid",
    "amount": 150.50,
    "paymentMethod": "PIX",
    "pixData": {
      "expiresInMinutes": 30
    }
  }'
```

#### Criar Cobrança com Cartão de Crédito

```bash
curl -X POST http://localhost:3000/api/v1/charges \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "amount": 500.00,
    "paymentMethod": "CREDIT_CARD",
    "creditCardData": {
      "cardNumber": "4111111111111111",
      "cardHolderName": "JOAO SILVA",
      "expiryMonth": "12",
      "expiryYear": "2026",
      "cvv": "123",
      "installments": 3
    }
  }'
```

#### Criar Cobrança com Boleto

```bash
curl -X POST http://localhost:3000/api/v1/charges \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "amount": 250.00,
    "paymentMethod": "BOLETO",
    "boletoData": {
      "dueDate": "2025-11-10"
    }
  }'
```

## 🗄️ Gerenciamento do Banco de Dados

### Prisma Studio (GUI)

```bash
npx prisma studio
```

Abre interface visual em `http://localhost:5555`

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset database (cuidado!)
npx prisma migrate reset
```

### Seed

```bash
npx prisma db seed
```

## 🏗️ Estrutura do Projeto

```
src/
├── main.ts                      # Entry point
├── app.module.ts                # Módulo raiz
├── common/                      # Código compartilhado
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── config/                      # Configurações
├── modules/
│   ├── customers/               # Módulo de clientes
│   ├── charges/                 # Módulo de cobranças
│   └── database/                # Módulo de banco de dados
└── shared/                      # Utilitários
    ├── validators/
    └── utils/
```

Para mais detalhes, veja [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔒 Idempotência

Para garantir que requisições duplicadas não criem cobranças duplicadas, use o header `Idempotency-Key`:

```bash
curl -X POST http://localhost:3000/api/v1/charges \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

Se a mesma chave for enviada novamente, a API retornará a cobrança existente (200 OK) ao invés de criar uma nova.

## 📊 Monitoramento e Logs

### Logs estruturados

A aplicação gera logs estruturados em formato JSON (em produção):

```json
{
  "level": "info",
  "timestamp": "2025-10-26T10:00:00.000Z",
  "method": "POST",
  "url": "/api/v1/charges",
  "statusCode": 201,
  "duration": 150
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

## 🐛 Debugging

### VS Code

Arquivo `.vscode/launch.json` já configurado:

1. Adicione breakpoints no código
2. Pressione F5 ou use "Run and Debug"
3. Escolha "Debug NestJS"

### Logs detalhados

```bash
# Ativar logs de debug
NODE_ENV=development npm run start:dev
```

## 🚢 Deploy

### Docker Production

```bash
# Build da imagem
docker build -t payments-api:latest .

# Run
docker run -p 3000:3000 --env-file .env.production payments-api:latest
```

### Variáveis de Ambiente (Produção)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/db"
PORT=3000
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrão de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `test:` Adiciona ou corrige testes
- `refactor:` Refatoração de código
- `style:` Formatação de código
- `chore:` Atualizações de build, configs, etc.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Fernando** - *Desenvolvimento Inicial*

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma issue no GitHub
- Email: fernando@empresa.com

## 🗺️ Roadmap

- [x] Cadastro de clientes
- [x] Criação de cobranças (PIX, Cartão, Boleto)
- [x] Idempotência
- [ ] Autenticação JWT
- [ ] Webhooks
- [ ] Integração com gateway real
- [ ] Dashboard de métricas
- [ ] Conciliação bancária
- [ ] Multi-tenancy

## 📚 Links Úteis

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Arquitetura do Projeto](./ARCHITECTURE.md)
- [Guia de Desenvolvimento](./DEVELOPMENT.md)

---

**Desenvolvido com ❤️ usando NestJS e TypeScript**

# colmeia-challange
