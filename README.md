# Quero Café Bar ☕

Sistema de gerenciamento para o estabelecimento "Quero Café Bar", desenvolvido como material didático para as aulas dos cursos de Informática (Desenvolvimento de Sistemas e Informática para Internet).

## 🚀 Sobre o Projeto

O projeto visa simular um cenário real de desenvolvimento de software, abrangendo desde a criação de uma API robusta até a interface mobile/web responsiva. O sistema permitirá o controle de pedidos, produtos e atendimento, com visualização específica para a cozinha.

## 🛠️ Tecnologias Utilizadas

### Banco de Dados
- **Tipo:** Relacional
- **Framework de ORM:** [TypeORM](https://typeorm.io/) (TypeScript)
- **Banco de Dados:** [MySQL](https://www.mysql.com) 8.x

### Backend
- **Framework:** [NestJS](https://nestjs.com/) 11.x (Node.js)
- **Linguagem:** TypeScript
- **Gerenciador de Pacotes:** Yarn
- **Validação:** class-validator, class-transformer
- **Autenticação:** JWT (JSON Web Token via `jsonwebtoken`)
- **Criptografia:** AES-256-CTR via `EncryptionTransformer` (TypeORM column transformer)
- **Filtro Global de Erros:** `GlobalExceptionFilter` para respostas sanitizadas

### Frontend
- **Framework:** [Ionic Framework](https://ionicframework.com/) 8.x
- **Base:** JavaScript Vanilla (Web Components)
- **Bundler:** [Vite](https://vitejs.dev/) 7.x
- **Plataforma Mobile:** [Capacitor](https://capacitorjs.com/) 8.x (Android/iOS)
- **Gerenciador de Pacotes:** npm

## 📊 Status do Projeto

### Backend
- [x] Configuração inicial do ambiente NestJS 11.x
- [x] Estrutura básica do projeto (modular)
- [x] Implementação do módulo de Produtos (CRUD)
- [x] Implementação do módulo de Usuários (CRUD + Login)
- [x] Implementação do módulo de Mesas (CRUD)
- [x] Implementação do módulo de Comandas (CRUD)
- [x] Implementação do módulo de Itens de Comanda (CRUD)
- [x] Integração com Banco de Dados (TypeORM + MySQL)
- [x] Autenticação JWT implementada
- [x] Relacionamentos entre entidades configurados
- [x] Testes unitários completos (136 testes, 18 suítes)
- [x] Tratamento global de exceções
- [x] Validação global (whitelist + transform)
- [x] Criptografia de senhas via ORM transformer

### Frontend
- [x] Configuração inicial do ambiente Ionic + Vite
- [x] Estrutura básica do projeto (Web Components)
- [x] Implementação das páginas de Produtos (List, Register, Update)
- [x] Implementação das páginas de Usuários (List, Register, Update)
- [x] Implementação das páginas de Mesas (List, Register, Update)
- [x] Implementação das páginas de Comandas (List, Register, Update)
- [x] Tela de Login funcional
- [x] Tela da Cozinha (Home) com status de entrega
- [x] Menu lateral de navegação
- [x] Integração com a API (Serviço singleton)
- [x] Feedback visual (toast, alert, loading)
- [x] Build para Android configurado (Capacitor)
- [ ] Temas personalizados
- [x] Testes unitários (64 testes, 6 suítes)

## 📂 Estrutura de Pastas

```
quero-cafe-bar/
├── /backend          # API REST desenvolvida em NestJS 11.x
│   ├── src/
│   │   ├── modules/      # Módulos: comanda, comanda-item, mesa, produto, usuario
│   │   ├── config/       # Configuração TypeORM
│   │   └── main.ts       # Entry point
│   └── package.json
│
├── /frontend         # Aplicação mobile/web desenvolvida em Ionic + Vite
│   ├── src/
│   │   ├── pages/        # Páginas (Web Components)
│   │   ├── services/     # API service
│   │   ├── shared/       # Header, utilitários
│   │   └── environments/ # Configurações dev/prod
│   └── package.json
│
└── AGENTS.md         # Documentação para agentes de IA
```

## 💻 Como executar o Backend

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure o arquivo `.env` com as credenciais do banco de dados:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=quero_cafe_bar
   PORT=3001
   ```

4. Execute as migrations do banco de dados:
   ```bash
   yarn migrate
   ```

5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   yarn run start:dev
   ```

O backend estará disponível em `http://localhost:3001`.

## 📱 Como executar o Frontend (Web)

1. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento (Vite):
   ```bash
   npm run dev
   ```

A aplicação web estará disponível em `http://localhost:5173` (ou porta indicada).

### Gerando Build para Android

1. Realize o build de produção:
   ```bash
   npm run build:prod
   ```

2. Sincronize os arquivos com o Capacitor:
   ```bash
   npx cap sync android
   ```

3. Abra no Android Studio ou execute diretamente:
   ```bash
   npx cap open android
   # ou
   npx cap run android
   ```

4. Para gerar o APK diretamente:
   ```bash
   npx cap build android
   ```

## 🤖 Agentes Disponíveis

Este projeto possui configurações para agentes de IA no arquivo [AGENTS.md](./AGENTS.md).

| Agente | Função | Modelo |
|--------|--------|--------|
| `explore` | Exploração rápida de código, busca de arquivos e padrões | opencode/big-pickle |
| `general` | Pesquisa geral e tarefas multi-step | opencode/big-pickle |
| `exception-treatment-agent` | Auditoria de tratamento de exceções e resiliência | opencode/big-pickle |
| `qa-agent` | Geração e análise de testes unitários (NestJS + Ionic) | opencode/big-pickle |
| `security-audit-agent` | Análise de segurança SAST (SQLi, segredos, CORS) | opencode/big-pickle |
| `ux-agent` | Auditoria de UX/UI e acessibilidade (WCAG/W3C) | opencode/big-pickle |

## 🔧 Pré-requisitos

- **Node.js** >= 18.x
- **MySQL** 8.x (ou compatível)
- **Yarn** >= 1.22 (para o backend)
- **npm** >= 9.x (para o frontend)
- **Java JDK** 17+ + **Android Studio** (para builds mobile)
- **Git** para controle de versão

## 📝 Scripts Disponíveis

### Backend (yarn)
| Comando | Descrição |
|---------|-----------|
| `yarn start:dev` | Servidor com hot-reload |
| `yarn build` | Build de produção |
| `yarn lint` | ESLint + Prettier |
| `yarn test` | Jest unit tests (136 testes) |
| `yarn make:migration <nome>` | Gerar migration |
| `yarn migrate` | Executar migrations |
| `yarn migrate:rollback` | Reverter última migration |

### Frontend (npm)
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor Vite (desenvolvimento) |
| `npm run build` | Build web |
| `npm run build:prod` | Build de produção |
| `npm test` | Jest unit tests (64 testes) |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npx cap sync` | Sincronizar com Capacitor |

## 🎨 Funcionalidades da Cozinha

A página inicial (Home) serve como visualização da cozinha:
- Lista todas as comandas em formato de cards
- Exibe número da comanda, mesa e lista de itens
- **Status visual**: Itens pendentes (vermelho) e entregues (verde)
- Select boxes para alterar status de entrega
- Ícone dinâmico: muda quando todos os itens são entregues

---

*Projeto desenvolvido para fins educacionais - ETEC e FATEC.*
