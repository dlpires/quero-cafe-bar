# Quickstart: Test Coverage Improvement

## Prerequisites

- Node.js >= 18.x
- Yarn (backend)
- npm (frontend)
- Dependencies installed: `cd backend && yarn install` and `cd frontend && npm install`

## Running Tests

### Backend

```bash
cd backend
yarn test              # All backend tests (includes new JwtAuthGuard, UsuarioService, etc.)
yarn test -- --coverage  # With coverage report
yarn test -- --testPathPattern=jwt-auth  # Run specific test file
yarn test -- --testPathPattern=usuario.service
yarn test -- --testPathPattern=produto.service
yarn test -- --testPathPattern=audit.service
```

### Frontend

```bash
cd frontend
npm test               # All frontend tests
npm run test:coverage  # With coverage report
npm test -- --testPathPattern=api.spec
npm test -- --testPathPattern=util.spec
npm test -- --testPathPattern=Header.spec
npm test -- --testPathPattern=list-produto-page
npm test -- --testPathPattern=list-mesa-page
npm test -- --testPathPattern=list-comanda-page
npm test -- --testPathPattern=list-usuario-page
npm test -- --testPathPattern=home-page
npm test -- --testPathPattern=login-page
```

## Coverage Targets

| Metric | Current | Target |
|---|---|---|
| Backend Statements | 69.22% | ≥85% |
| Backend Branches | 40.42% | ≥70% |
| Backend Functions | 65.46% | ≥85% |
| Frontend Statements | 10.31% | ≥70% |
| Frontend Branches | 19.82% | ≥60% |
| Frontend Functions | 19.19% | ≥65% |
