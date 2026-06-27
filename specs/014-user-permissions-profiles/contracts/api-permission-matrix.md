# API Permission Matrix

**Contract**: Defines which user profiles can access each API endpoint.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✔ | Full access (all HTTP methods listed) |
| R | Read-only (GET only) |
| W | Write (POST, PATCH, DELETE) |
| ✘ | No access (HTTP 403) |
| — | Not applicable |

## Usuario Module

| Endpoint | Method | Admin (0) | Atendente (1) | Cozinha (2) | Public |
|----------|--------|-----------|---------------|-------------|--------|
| `/usuario/login` | POST | ✔ | ✔ | ✔ | ✔ |
| `/usuario` | GET | ✔ | ✘ | ✘ | ✘ |
| `/usuario` | POST | ✔ | ✘ | ✘ | ✘ |
| `/usuario/:id` | GET | ✔ | ✘ | ✘ | ✘ |
| `/usuario/:id` | PATCH | ✔ | ✘ | ✘ | ✘ |
| `/usuario/:id` | DELETE | ✔ | ✘ | ✘ | ✘ |
| `/usuario/perfil/:perfil` | GET | ✔ | ✘ | ✘ | ✘ |
| `/usuario/me` | GET | ✔ | ✔ | ✔ | ✘ |

**Notes**:
- `PATCH /usuario/:id` MUST reject self-profile changes for non-Admin users (FR-016).
- `POST /usuario` and `PATCH /usuario/:id` MUST validate that `perfil` is in [0, 1, 2].

## Produto Module

| Endpoint | Method | Admin (0) | Atendente (1) | Cozinha (2) | Public |
|----------|--------|-----------|---------------|-------------|--------|
| `/produto` | GET | ✔ | R | ✘ | ✘ |
| `/produto/:id` | GET | ✔ | R | ✘ | ✘ |
| `/produto` | POST | ✔ | ✘ | ✘ | ✘ |
| `/produto/:id` | PATCH | ✔ | ✘ | ✘ | ✘ |
| `/produto/:id` | DELETE | ✔ | ✘ | ✘ | ✘ |

## Mesa Module

| Endpoint | Method | Admin (0) | Atendente (1) | Cozinha (2) | Public |
|----------|--------|-----------|---------------|-------------|--------|
| `/mesa` | GET | ✔ | R | ✘ | ✘ |
| `/mesa/:id` | GET | ✔ | R | ✘ | ✘ |
| `/mesa` | POST | ✔ | ✘ | ✘ | ✘ |
| `/mesa/:id` | PATCH | ✔ | ✘ | ✘ | ✘ |
| `/mesa/:id` | DELETE | ✔ | ✘ | ✘ | ✘ |

## Comanda Module

| Endpoint | Method | Admin (0) | Atendente (1) | Cozinha (2) | Public |
|----------|--------|-----------|---------------|-------------|--------|
| `/comanda` | GET | ✔ | ✔ | R | ✘ |
| `/comanda/:id` | GET | ✔ | ✔ | R | ✘ |
| `/comanda/mesa/:id_mesa` | GET | ✔ | ✔ | ✘ | ✘ |
| `/comanda` | POST | ✔ | ✔ | ✘ | ✘ |
| `/comanda/:id` | PATCH | ✔ | ✔ | ✘ | ✘ |
| `/comanda/:id` | DELETE | ✔ | ✘ | ✘ | ✘ |

**Notes**:
- Cozinha (2) can read comandas (to view the kitchen panel) but cannot create/update/delete them.
- Atendente cannot delete comandas.

## ComandaItem Module

| Endpoint | Method | Admin (0) | Atendente (1) | Cozinha (2) | Public |
|----------|--------|-----------|---------------|-------------|--------|
| `/comanda-item/comanda/:id_comanda` | GET | ✔ | ✔ | R | ✘ |
| `/comanda-item` | POST | ✔ | ✔ | ✘ | ✘ |
| `/comanda-item/:id_comanda/:id_produto` | PATCH | ✔ | ✔ | W (status only) | ✘ |
| `/comanda-item/:id_comanda/:id_produto` | DELETE | ✔ | ✘ | ✘ | ✘ |

**Notes**:
- Cozinha (2) can only update delivery status (`statusEntrega`) via `PATCH /comanda-item/:id_comanda/:id_produto` — the endpoint MUST reject other field changes (e.g., `qtd_item`, `valor_venda`).
- Atendente cannot delete comanda items.

## Frontend Routes

| Route | Component | Admin (0) | Atendente (1) | Cozinha (2) |
|-------|-----------|-----------|---------------|-------------|
| `/home` | home-page | ✔ | ✔ | ✘ |
| `/cozinha` | cozinha-page | ✔ | ✘ | ✔ |
| `/produtos` | list-produto-page | ✔ | ✔ (R) | ✘ |
| `/produto/register` | reg-produto-page | ✔ | ✘ | ✘ |
| `/produto/edit` | update-produto-page | ✔ | ✘ | ✘ |
| `/usuarios` | list-usuario-page | ✔ | ✘ | ✘ |
| `/usuario/register` | reg-usuario-page | ✔ | ✘ | ✘ |
| `/usuario/edit` | update-usuario-page | ✔ | ✘ | ✘ |
| `/mesas` | list-mesa-page | ✔ | ✔ (R) | ✘ |
| `/mesa/register` | reg-mesa-page | ✔ | ✘ | ✘ |
| `/mesa/edit` | update-mesa-page | ✔ | ✘ | ✘ |
| `/comandas` | list-comanda-page | ✔ | ✔ | ✘ |
| `/comanda/register` | reg-comanda-page | ✔ | ✔ | ✘ |
| `/comanda/edit` | update-comanda-page | ✔ | ✔ | ✘ |

**Notes**:
- Atendente with read-only access to produtos/mesas should see list pages but have action buttons (create/edit/delete) hidden.
- Cozinha profile's home page after login is `/cozinha` (FR-007).
