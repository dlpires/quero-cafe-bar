# Backend AGENTS.md

## Commands

```bash
yarn run start:dev    # dev server with watch (port 3000 or env PORT)
yarn run lint         # ESLint + Prettier
yarn run test          # Jest unit tests
yarn run make:migration <name>  # Generate migration (required before migrate)
yarn run migrate       # Run migrations
yarn run migrate:rollback  # Revert last migration
```

## Database

- **ORM**: TypeORM with MySQL
- **Config**: `src/config/orm.config.ts`
- **Migrations**: `src/database/migrations/`
- **IMPORTANT**: `synchronize: false` - ALWAYS use `yarn make:migration` before `yarn migrate`
- **Entities**: Located in each module's `entities/` folder (e.g., `src/modules/produto/entities/`)

## Modules

Located in `src/modules/`: `comanda`, `comanda-item`, `mesa`, `produto`, `usuario`

Each module follows: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `entities/*.entity.ts`, `dto/`

## Lint/Format

- ESLint config: `eslint.config.mjs`
- Prettier config: `.prettierrc`
- Rule: `prettier/prettier` uses `endOfLine: "auto"` - do not manually change line endings

## Environment

- Copy `.env.example` to `.env`
- Variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `ENCRYPTION_KEY`
