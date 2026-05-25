# Data Model: Frontend Route Protection

**Date**: 2026-05-15
**Feature**: [spec.md](spec.md)

## Overview

Esta feature não introduz novas entidades de dados. A proteção de rotas opera sobre entidades existentes no sistema. Abaixo estão documentadas as entidades relevantes para a implementação.

## Existing Entities

### Sessão do Usuário (Authentication Session)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `token` | `string` (JWT) | Token de autenticação armazenado no navegador |
| `storage` | `localStorage` | Mecanismo de persistência (chave: `"token"`) |
| `expiry` | `24h` | Validade do token (definida pelo backend) |

**Relacionamentos**: Uma sessão pertence a um `Usuario` (autenticado via backend).

**Estado válido**: `token` presente e não expirado → usuário autenticado.
**Estado inválido**: `token` ausente, removido ou expirado → usuário não autenticado.

### Rotas (Routes)

| Entidade | Descrição | Acesso |
|----------|-----------|--------|
| `/login` | Tela de login — pública | Permitido sem autenticação |
| `/home` | Tela inicial (cozinha) — protegida | Requer autenticação |
| `/produtos`, `/produto/register`, `/produto/edit` | CRUD de produtos — protegido | Requer autenticação |
| `/usuarios`, `/usuario/register`, `/usuario/edit` | CRUD de usuários — protegido | Requer autenticação |
| `/mesas`, `/mesa/register`, `/mesa/edit` | CRUD de mesas — protegido | Requer autenticação |
| `/comandas`, `/comanda/register`, `/comanda/edit` | CRUD de comandas — protegido | Requer autenticação |
| `/logout` | Logout — redireciona para login | Público (apenas redirecionamento) |

## Data Flow

```text
User Action                        Auth Check               Result
────────────                       ──────────               ──────
Access /login (no session)     →   No check (public)    →   Show login form
Access /login (with session)   →   Layer 1 (global)     →   Redirect to /home
Access /home (no session)      →   Layer 1 + Layer 2    →   Redirect to /login
Access /home (with session)    →   Layer 1 + Layer 2    →   Show page content
API 401 response               →   api.js interceptor   →   Clear token + redirect to /login
Logout click                   →   util.js logout()     →   Clear token + redirect to /login
```

## State Transitions

```text
[No token] ──login()──▶ [Valid token] ──navigate──▶ [Show protected content]
                                │
                                ├──logout()──────▶ [No token]
                                ├──expired API────▶ [No token] + redirect
                                └──manual clear───▶ [No token] + redirect on next nav
```
