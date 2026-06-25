# Quickstart: Home Tables Redesign

## Prerequisites

Same as project: Node.js >= 18.x, MySQL, Yarn (backend), npm (frontend).

## Backend Setup

### 1. Generate Migration
```bash
cd backend
yarn make:migration AddComandaStatus
```

### 2. Run Migration
```bash
yarn migrate
```

### 3. Run Backend Tests
```bash
yarn test
```
Expected: All 22 suites, 149+ tests passing (new tests for status field).

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Run Frontend Tests
```bash
npm run test
```
Expected: All 20+ suites passing (HomePage.spec.js rewritten, CozinhaPage.spec.js added).

## Implementation Order

1. **Backend**: Add `status` column to Comanda entity → migration → update service/controller → add `hasActiveComanda` to Mesa endpoint → update DTOs/interfaces → run tests
2. **Frontend**: Create `cozinha-page` (extract from home) → rewrite `home-page` (table views) → update `reg-comanda-page` (mesa pre-select) → update `update-comanda-page` (fechar comanda) → add routes → update tests
3. **Navigation**: Add menu entry for `/cozinha` in Header.js → remove kitchen references from home
4. **Cleanup**: Remove unused code from old HomePage → verify all routes → run full test suite
