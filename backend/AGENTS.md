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
- **Global Pipe**: `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — rejects unknown fields with 400.
- **Global Filter**: `GlobalExceptionFilter` catches unhandled errors and returns sanitized 500 responses.
- **Security**: CORS is open (`*`). JWT auth via `jsonwebtoken` (signed with `JWT_SECRET`, 24h expiry).
- **Password Encryption**: AES-256-CTR via `EncryptionTransformer` (TypeORM column transformer) — transparent encrypt/decrypt at ORM level.
- **Entities**: Use snake_case for database columns and camelCase for class properties.

## Environment
- Ensure `PORT=3001` in `.env` to match frontend expectations during local dev.
- Set `JWT_SECRET` in `.env` for token signing.
- Set `ENCRYPTION_KEY` in `.env` for password encryption/decryption.