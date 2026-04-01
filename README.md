# Quero Café Bar ☕

Sistema de gerenciamento para o estabelecimento "Quero Café Bar", desenvolvido como material didático para as aulas dos cursos de Informática (Desenvolvimento de Sistemas e Informática para Internet).

## 🚀 Sobre o Projeto

O projeto visa simular um cenário real de desenvolvimento de software, abrangendo desde a criação de uma API robusta até a interface mobile/web responsiva. O sistema permitirá o controle de pedidos, produtos e atendimento.

## 🛠️ Tecnologias Utilizadas

### Banco de dados (Atual)
- **Tipo:** Relacional
- **Framework de ORM:** [TypeORM](https://typeorm.io/) (TypeScript)
- **Banco de Dados:** [MySQL](https://www.mysql.com)

### Backend (Atual)
- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Linguagem:** TypeScript
- **Gerenciador de Pacotes:** Yarn

### Frontend (Atual)
- **Framework:** [Ionic Framework](https://ionicframework.com/)
- **Base:** [JavaScript - Vanilla JS](https://ionicframework.com/docs/javascript/quickstart)
- **Plataforma:** Mobile (Android/iOS) e Web

## 📊 Status do Projeto

No momento, o projeto encontra-se na fase inicial de desenvolvimento do **Backend**:
- [x] Configuração inicial do ambiente NestJS.
- [x] Estrutura básica do projeto.
- [x] Implementação das rotas de Produtos.
- [x] Implementação do módulo de Pedidos.
- [x] Integração com Banco de Dados (TypeORM).
- [ ] Autenticação e Autorização.

No momento, o projeto encontra-se na fase inicial de desenvolvimento do **Frontend**:
- [x] Configuração inicial do ambiente Ionic.
- [x] Estrutura básica do projeto (Tabs/SideMenu).
- [x] Listagem e visualização de Produtos.
- [ ] Fluxo de criação de Pedidos.
- [x] Integração com a API (Serviços).
- [x] Telas de Login e Perfil de Usuário.


## 📂 Estrutura de Pastas

- `/backend`: API REST desenvolvida em NestJS.
- `/frontend`: Aplicação mobile desenvolvida em Ionic.

## 💻 Como executar o Backend

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Inicie o servidor em modo de desenvolvimento:
   ```bash
   yarn run start:dev
   ```

## 📱 Como executar o Frontend

1. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Gerando Build para Android

1. Adicione a plataforma Android (Capacitor):
   ```bash
   npx cap add android
   ```

2. Realize o build e sincronize os arquivos:
   ```bash
   npm run build # ou build:prod
   npx cap copy
   npx cap open android # ou
   npx cap run android
   ```

3. Caso queira apenas gerar o APK diretamente via CLI:
   ```bash
   npx cap build android
   ```
---
*Projeto desenvolvido para fins educacionais - ETEC e FATEC.*
