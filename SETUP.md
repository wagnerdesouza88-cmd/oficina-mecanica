# SETUP — Configuração do Ambiente de Desenvolvimento

## Objetivo
Configure todo o ambiente de desenvolvimento para o sistema de gestão de oficina mecânica.

## O que você deve fazer, nessa ordem:

### 1. Estrutura de pastas
Crie a seguinte estrutura:

oficina/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── services/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
└── CLAUDE.md

### 2. Configuração do VS Code
Crie `.vscode/settings.json` com:
- Formatação automática ao salvar
- ESLint ativo
- Prettier como formatador padrão
- TailwindCSS IntelliSense ativo
- Emmet para JSX
- Fonte: Fira Code com ligatures

Crie `.vscode/extensions.json` recomendando:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- REST Client (para testar APIs sem sair do VS Code)
- Portuguese Language Pack

Crie `.vscode/launch.json` com configuração de debug para:
- Backend Node.js
- Frontend React (via Chrome)

### 3. Backend
- Inicie projeto Node.js com Express
- Instale: express, prisma, @prisma/client, dotenv, cors, zod, bcryptjs, jsonwebtoken
- Instale dev: nodemon, eslint, prettier
- Configure `nodemon.json`
- Configure `.env.example` com variáveis: DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
- Configure ESLint + Prettier
- Crie `src/server.js` funcional com rota de health check: GET /health

### 4. Frontend
- Inicie projeto React com Vite
- Instale: react-router-dom, axios, tailwindcss, @headlessui/react, react-hook-form, react-hot-toast
- Configure TailwindCSS com tema personalizado (cores: azul escuro e laranja)
- Crie página inicial simples com menu lateral e área de conteúdo

### 5. Banco de dados
No `prisma/schema.prisma`, crie os models iniciais:
- Cliente (id, nome, telefone, email, cpf, createdAt)
- Veiculo (id, clienteId, placa, marca, modelo, ano, cor, createdAt)
- OrdemServico (id, veiculoId, status, descricao, total, createdAt, updatedAt)

### 6. Scripts úteis no package.json (backend)
- "dev": "nodemon src/server.js"
- "start": "node src/server.js"
- "db:migrate": "prisma migrate dev"
- "db:studio": "prisma studio"

### 7. README.md
Crie um `README.md` simples explicando:
- Como rodar o projeto
- Variáveis de ambiente necessárias
- Comandos principais

## Ao finalizar
Me mostre:
1. A estrutura de pastas criada
2. As extensões do VS Code recomendadas
3. O comando para rodar o projeto pela primeira vez
4. Se há algo que eu precisarei configurar manualmente (ex: Supabase)