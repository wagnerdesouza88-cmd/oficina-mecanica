# Oficina Mecânica — Contexto do Projeto

## Visão Geral
Sistema de gestão de oficina mecânica com backend Node.js/Express e frontend React/Vite.

## Estrutura
- `backend/` — API REST com Express + Prisma ORM
- `frontend/` — Interface React com Tailwind CSS

## Stack
- **Backend**: Node.js, Express, Prisma, PostgreSQL, Zod, JWT
- **Frontend**: React 18, Vite, TailwindCSS, React Router, React Hook Form

## Convenções
- ES Modules (`import/export`) em todo o projeto
- Sem ponto e vírgula (Prettier: `"semi": false`)
- Single quotes
- Rotas REST em `backend/src/routes/`
- Controllers em `backend/src/controllers/`
- Validação de dados com Zod nos controllers
- Autenticação via JWT no middleware `backend/src/middlewares/auth.js`

## Banco de Dados
- PostgreSQL via Prisma
- Modelos: Cliente, Veiculo, OrdemServico
- Migrations com `npm run db:migrate` dentro de `backend/`

## Porta padrão
- Backend: 3333
- Frontend: 5173
