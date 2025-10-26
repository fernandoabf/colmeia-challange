# 📝 Tasklist - Desafio Backend Sistema de Pagamentos

## ✅ Checklist de Implementação

### 🔧 Setup Inicial

- [ ] Criar projeto NestJS
- [ ] Instalar dependências (Prisma, class-validator, swagger)
- [ ] Configurar Prisma com PostgreSQL
- [ ] Criar arquivo .env baseado no env.example
- [ ] Subir Docker Compose (PostgreSQL)
- [ ] Criar schema Prisma (Customer, Charge, Payment models)
- [ ] Executar primeira migration
- [ ] Configurar Jest para testes

### 👥 Módulo Customers

- [ ] Criar DTOs (CreateCustomerDto, UpdateCustomerDto)
- [ ] Criar Entity (Customer)
- [ ] Criar Repository Interface
- [ ] Implementar Repository com Prisma
- [ ] Criar Service com validações (email/documento únicos)
- [ ] Criar Controller com endpoints CRUD
- [ ] Adicionar validador de CPF/CNPJ
- [ ] Escrever testes unitários (Service)
- [ ] Escrever testes E2E (endpoints)

### 💳 Módulo Charges - Base

- [ ] Criar DTOs base (CreateChargeDto)
- [ ] Criar Entity (Charge)
- [ ] Criar enums (PaymentMethod, ChargeStatus)
- [ ] Criar Repository Interface
- [ ] Implementar Repository com Prisma
- [ ] Criar Payment Strategy Interface
- [ ] Criar Payment Strategy Factory
- [ ] Escrever testes para Factory

### 💰 Métodos de Pagamento

#### PIX

- [ ] Criar PixDataDto
- [ ] Implementar PixStrategy
- [ ] Gerar QR Code PIX
- [ ] Salvar dados no PixPayment model
- [ ] Testar PixStrategy (unitário)

#### Cartão de Crédito

- [ ] Criar CreditCardDataDto
- [ ] Implementar CreditCardStrategy
- [ ] Validar número do cartão (Luhn)
- [ ] Tokenizar dados sensíveis
- [ ] Salvar dados no CreditCardPayment model
- [ ] Testar CreditCardStrategy (unitário)

#### Boleto

- [ ] Criar BoletoDataDto
- [ ] Implementar BoletoStrategy
- [ ] Gerar código de barras
- [ ] Salvar dados no BoletoPayment model
- [ ] Testar BoletoStrategy (unitário)

### 🔄 Charges Service e Controller

- [ ] Implementar ChargesService.create()
- [ ] Validar se cliente existe
- [ ] Usar Strategy correto baseado em paymentMethod
- [ ] Implementar ChargesService.findById()
- [ ] Implementar ChargesService.findByCustomer()
- [ ] Implementar ChargesService.updateStatus()
- [ ] Criar ChargesController
- [ ] Adicionar endpoints (POST, GET, PATCH)
- [ ] Escrever testes unitários (Service)
- [ ] Escrever testes E2E (endpoints)

### 🔒 Idempotência

- [ ] Adicionar campo idempotencyKey no schema
- [ ] Criar IdempotencyGuard
- [ ] Criar @Idempotent decorator
- [ ] Aplicar no endpoint POST /charges
- [ ] Testar comportamento de idempotência

### 🎨 Tratamento de Erros e Validações

- [ ] Criar HttpExceptionFilter global
- [ ] Padronizar respostas de erro
- [ ] Criar exceções customizadas (CustomerNotFoundException, etc)
- [ ] Adicionar ValidationPipe global
- [ ] Tratar erros do Prisma

### 📚 Documentação Swagger

- [ ] Configurar Swagger no main.ts
- [ ] Adicionar decorators nos DTOs (@ApiProperty)
- [ ] Adicionar decorators nos Controllers (@ApiTags, @ApiOperation)
- [ ] Documentar respostas de erro
- [ ] Testar documentação em /api/docs

### 🧪 Testes e Qualidade

- [ ] Garantir cobertura de testes > 80%
- [ ] Todos os testes passando (npm run test)
- [ ] Configurar ESLint e Prettier
- [ ] Executar lint sem erros
- [ ] Criar seed de dados para testes manuais

### 📦 Finalização

- [ ] Atualizar README com instruções
- [ ] Testar fluxo completo manualmente
- [ ] Criar collection Postman/Insomnia (opcional)
- [ ] Verificar se docker-compose funciona
- [ ] Commitar código com mensagens claras
- [ ] Preparar apresentação (se necessário)

---

## 🎯 Critérios de Aceitação (Checklist Final)

### Funcional

- [ ] ✅ Criar cliente (POST /customers)
- [ ] ✅ Buscar cliente (GET /customers/:id)
- [ ] ✅ Listar clientes (GET /customers)
- [ ] ✅ Criar cobrança PIX (POST /charges)
- [ ] ✅ Criar cobrança Cartão (POST /charges)
- [ ] ✅ Criar cobrança Boleto (POST /charges)
- [ ] ✅ Buscar cobrança (GET /charges/:id)
- [ ] ✅ Listar cobranças (GET /charges)
- [ ] ✅ Idempotência funciona (mesmo Idempotency-Key)

### Validações

- [ ] ✅ Email único
- [ ] ✅ Documento único
- [ ] ✅ CPF/CNPJ válido
- [ ] ✅ Dados obrigatórios validados
- [ ] ✅ Retorna 400 para dados inválidos
- [ ] ✅ Retorna 409 para duplicatas
- [ ] ✅ Retorna 404 para não encontrado

### Técnico

- [ ] ✅ Código organizado em módulos
- [ ] ✅ Relacionamentos corretos no banco
- [ ] ✅ Migrations criadas e funcionando
- [ ] ✅ Testes escritos e passando
- [ ] ✅ Swagger documentado
- [ ] ✅ README com instruções claras
- [ ] ✅ Docker funcionando

---

## ⏱️ Estimativa de Tempo

| Etapa                  | Tempo Estimado |
| ---------------------- | -------------- |
| Setup Inicial          | 1-2h           |
| Módulo Customers       | 3-4h           |
| Módulo Charges Base    | 2-3h           |
| Implementar Strategies | 4-5h           |
| Idempotência           | 1-2h           |
| Testes                 | 3-4h           |
| Documentação           | 1-2h           |
| **TOTAL**              | **15-22h**     |

---

## 🚀 Ordem Recomendada de Execução

1. **Setup Inicial** → Garantir ambiente funcionando
2. **Customers** → Base para o resto
3. **Charges Base** → Estrutura principal
4. **PIX** → Método mais simples
5. **Cartão/Boleto** → Métodos mais complexos
6. **Idempotência** → Feature extra
7. **Testes** → Garantir qualidade
8. **Documentação** → Finalizar

