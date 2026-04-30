# Oficina Mecânica — Sistema de Gestão

Sistema web para gerenciamento de clientes, veículos e ordens de serviço de uma oficina mecânica.

## Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta no Supabase)
- npm ou pnpm

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do banco de dados
npm install
npm run db:migrate
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## Variáveis de ambiente (backend/.env)

| Variável       | Descrição                          | Exemplo                                      |
|----------------|------------------------------------|----------------------------------------------|
| `DATABASE_URL` | URL de conexão com o PostgreSQL    | `postgresql://user:pass@localhost:5432/db`   |
| `JWT_SECRET`   | Segredo para assinar tokens JWT    | `minha-chave-super-secreta`                  |
| `PORT`         | Porta do servidor backend          | `3333`                                       |
| `FRONTEND_URL` | URL do frontend (para CORS)        | `http://localhost:5173`                      |

## Comandos principais

| Comando                        | O que faz                              |
|--------------------------------|----------------------------------------|
| `npm run dev` (backend)        | Inicia servidor com hot-reload         |
| `npm run dev` (frontend)       | Inicia Vite dev server                 |
| `npm run db:migrate` (backend) | Aplica migrations do banco de dados    |
| `npm run db:studio` (backend)  | Abre Prisma Studio (GUI do banco)      |

## Health check

```
GET http://localhost:3333/health
```
