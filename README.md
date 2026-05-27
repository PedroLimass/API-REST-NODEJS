# API REST – Transações (Node.js)

API REST para controle de transações financeiras (entradas e saídas), construída como projeto de estudos do trilho de **Node.js da Rocketseat**.

Cada usuário é identificado por um **cookie de sessão**, o que permite manter suas transações isoladas sem necessidade de autenticação por login/senha.

---

## Funcionalidades

- Criar uma nova transação (`credit` ou `debit`)
- Listar todas as transações do usuário
- Buscar uma transação específica por `id`
- Obter um **resumo** com o saldo total (soma dos `amount`)
- Identificação automática do usuário via `sessionId` em cookie
- Middleware que protege rotas exigindo `sessionId` válido
- Suíte de testes automatizados de ponta a ponta (E2E)

---

## Stack

| Categoria | Tecnologia |
|-----------|------------|
| Runtime | [Node.js](https://nodejs.org/) (ESM, `"type": "module"`) |
| Framework HTTP | [Fastify](https://fastify.dev/) |
| Cookies | [@fastify/cookie](https://github.com/fastify/fastify-cookie) |
| Query builder | [Knex](https://knexjs.org/) |
| Banco de dados | [SQLite3](https://www.sqlite.org/) |
| Validação | [Zod](https://zod.dev/) |
| Variáveis de ambiente | [dotenv](https://github.com/motdotla/dotenv) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Execução TS | [tsx](https://github.com/privatenumber/tsx) |
| Testes | [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) |
| Lint | ESLint (`@rocketseat/eslint-config`) |

---

## Pré-requisitos

- **Node.js 20+**
- **npm** (ou pnpm/yarn equivalentes)

---

## Como rodar

### 1. Clonar o repositório

```bash
git clone https://github.com/PedroLimass/API-REST-NODEJS.git
cd API-REST-NODEJS
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com base no `.env.exemple`:

```env
NODE_ENV=development
DATABASE_URL=./db/app.db
```

E um `.env.test` para o ambiente de testes:

```env
DATABASE_URL=./db/test.db
```

> O `NODE_ENV=test` é setado automaticamente pelo Vitest, por isso o `.env.test` só precisa do `DATABASE_URL`.

### 4. Rodar as migrations

```bash
npm run knex -- migrate:latest
```

### 5. Iniciar o servidor em modo dev

```bash
npm run dev
```

O servidor sobe em `http://localhost:3333`.

---

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Sobe o servidor com hot reload via `tsx watch` |
| `npm run lint` | Roda o ESLint com `--fix` em `src/` |
| `npm run test` | Executa a suíte de testes com Vitest |
| `npm run knex -- <comando>` | Atalho para o CLI do Knex (ex.: `migrate:latest`, `migrate:make`) |

### Exemplos com Knex

```bash
# Criar uma migration
npm run knex -- migrate:make create-something

# Aplicar todas as migrations pendentes
npm run knex -- migrate:latest

# Desfazer a última migration
npm run knex -- migrate:rollback

# Desfazer tudo
npm run knex -- migrate:rollback --all
```

---

## Estrutura de pastas

```
.
├── db/
│   ├── migrations/              # Migrations do Knex
│   └── app.db                   # Banco SQLite (gerado em runtime)
├── src/
│   ├── @types/
│   │   └── knex.d.ts            # Augmentation: tipagem das tabelas
│   ├── env/
│   │   └── index.ts             # Validação das envs com Zod
│   ├── middlewares/
│   │   └── check-session-id-exists.ts
│   ├── routes/
│   │   └── transactions.ts      # Endpoints de transações
│   ├── app.ts                   # Instância do Fastify + registro de plugins/rotas
│   ├── database.ts              # Conexão e config do Knex
│   └── server.ts                # Entrypoint: app.listen
├── test/
│   └── transactions.spec.ts     # Testes E2E
├── knexfile.ts
├── tsconfig.json
└── package.json
```

---

## Endpoints

> Base URL: `http://localhost:3333`
>
> Todas as rotas (exceto `POST /transactions`) exigem o cookie `sessionId`, criado automaticamente na primeira chamada de `POST /transactions`.

### `POST /transactions`

Cria uma nova transação. Caso o cookie `sessionId` não exista, ele é gerado e devolvido em `Set-Cookie`.

**Body**

```json
{
  "title": "Salário",
  "amount": 5000,
  "type": "credit"
}
```

- `type`: `"credit"` soma; `"debit"` subtrai do saldo.

**Resposta:** `201 Created`

---

### `GET /transactions`

Lista todas as transações da sessão atual.

**Resposta:** `200 OK`

```json
{
  "transactions": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "title": "Salário",
      "amount": 5000,
      "created_at": "2026-05-27 20:00:00"
    }
  ]
}
```

---

### `GET /transactions/:id`

Retorna uma transação específica da sessão atual.

**Resposta:** `200 OK`

```json
{
  "transaction": {
    "id": "uuid",
    "session_id": "uuid",
    "title": "Salário",
    "amount": 5000,
    "created_at": "2026-05-27 20:00:00"
  }
}
```

---

### `GET /transactions/summary`

Retorna o saldo total da sessão atual (soma de todos os `amount`).

**Resposta:** `200 OK`

```json
{
  "summary": {
    "amount": 3000
  }
}
```

---

## Testes

Os testes usam **Vitest** + **Supertest** e rodam de forma isolada: antes de cada teste, o banco é resetado via `migrate:rollback --all` + `migrate:latest`.

```bash
npm run test
```

Cobertura atual (`test/transactions.spec.ts`):

- Criação de transação
- Listagem de transações
- Busca por `id`
- Cálculo do `summary`

---

## Notas de implementação

- **`type: "module"`** no `package.json` → imports usam `.js` mesmo em arquivos `.ts`.
- **Knex + TypeScript:** o arquivo `src/@types/knex.d.ts` faz module augmentation para que `knex('transactions')` retorne autocomplete tipado das colunas.
- **Validação:** todos os inputs (body e params) são validados com `zod`.
- **Identificação de sessão:** baseada em cookie HTTP — simples, sem login.

---

## Licença

[ISC](./LICENSE) © Pedro Lima
