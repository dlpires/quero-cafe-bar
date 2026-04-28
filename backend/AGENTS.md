# Backend AGENTS.md

## Commands

```bash
yarn install
yarn run start:dev      # Development with hot-reload
yarn run build          # Production build
yarn run lint           # Fix code style
```

## Database & Migrations (TypeORM)

- **Config**: `src/config/orm.config.ts`
- **Generate**: `yarn make:migration <name>` (Detects changes in entities)
- **Run**: `yarn migrate`
- **Revert**: `yarn migrate:rollback`

## Architecture

- **Framework**: NestJS 11.x
- **Modules**: Organized by feature in `src/modules/`.
  - `usuario`: Auth and user management (profiles: 0=Admin, 1=Waiter).
  - `produto`: Product catalog with pricing and status.
  - `mesa`: Table management.
  - `comanda` & `comanda-item`: Order processing logic.

## Implementation Details

- **Validation**: Uses `class-validator` and `class-transformer` globally in `main.ts`.
- **Security**: CORS is open (`*`). Auth is expected via JWT (to be fully implemented).
- **Entities**: Use snake_case for database columns and camelCase for class properties.

## Environment
- Ensure `PORT=3001` in `.env` to match frontend expectations during local dev.