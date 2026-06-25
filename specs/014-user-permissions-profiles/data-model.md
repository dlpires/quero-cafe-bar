# Data Model: User Permissions Profiles

**Status**: No schema changes required

## Entities

### Usuário (existing — no structural change)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | number (PK) | AUTO_INCREMENT | |
| `nome` | varchar | NOT NULL | |
| `usuario` | varchar | NOT NULL, UNIQUE | Login username |
| `senha` | varchar | NOT NULL | bcrypt hash |
| `perfil` | number (int) | NOT NULL, DEFAULT 0, range [0, 1, 2] | 0=Administrador, 1=Atendente, 2=Cozinha |

**No new columns, tables, or relationships.** The `perfil` field already exists. Only the valid value range expands from [0, 1] to [0, 1, 2].

### AuditLog (new entity)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | number (PK) | AUTO_INCREMENT | |
| `userId` | number | NOT NULL, FK → usuarios.id | Who performed the action |
| `action` | varchar(50) | NOT NULL | e.g., 'usuario.create', 'usuario.update.perfil', 'usuario.delete', 'produto.delete', 'mesa.delete' |
| `resource` | varchar(50) | NOT NULL | e.g., 'usuario', 'produto', 'mesa' |
| `resourceId` | number | NULLABLE | ID of the affected resource |
| `details` | json | NULLABLE | Additional context (e.g., old/new values) |
| `createdAt` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Migration required**: `yarn make:migration AddAuditLogTable`

## Profile Reference

| Value | Name | Description |
|-------|------|-------------|
| 0 | Administrador | Full access to all routes and features |
| 1 | Atendente | Read-only produtos/mesas, CRUD comandas, home |
| 2 | Cozinha | Kitchen panel only, update delivery status |
