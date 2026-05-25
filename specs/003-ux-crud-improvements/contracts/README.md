# API Contracts — UX CRUD Improvements

This feature is **frontend-only**. No new API contracts are defined.

## Consumed Endpoints

The following existing backend endpoints are consumed (unchanged from this feature):

### Produto
- `GET /produtos` → `api.getProdutos()`
- `GET /produtos/:id` → `api.getProdutoById(id)`
- `POST /produtos` → `api.addProduto(data)`
- `PUT /produtos/:id` → `api.updateProduto(id, data)`
- `DELETE /produtos/:id` → `api.deleteProduto(id)`

### Usuario
- `GET /usuarios` → `api.getUsuarios()`
- `GET /usuarios/:id` → `api.getUsuarioById(id)`
- `POST /usuarios` → `api.addUsuario(data)`
- `PUT /usuarios/:id` → `api.updateUsuario(id, data)`
- `DELETE /usuarios/:id` → `api.deleteUsuario(id)`

### Mesa
- `GET /mesas` → `api.getMesas()`
- `GET /mesas/:id` → `api.getMesaById(id)`
- `POST /mesas` → `api.addMesa(data)`
- `PUT /mesas/:id` → `api.updateMesa(id, data)`
- `DELETE /mesas/:id` → `api.deleteMesa(id)`

### Comanda
- `GET /comandas` → `api.getComandas()`
- `GET /comandas/:id` → `api.getComandaById(id)`
- `POST /comandas` → `api.addComanda(data)`
- `PUT /comandas/:id` → `api.updateComanda(id, data)`
- `DELETE /comandas/:id` → `api.deleteComanda(id)`

### Auth
- `POST /login` → `api.login(credentials)`

## Response Format (Consistent)

```json
{
  "id": 1,
  "dsc_produto": "Café Expresso",
  "valor_unit": 5.50,
  "status": true
}
```

HTTP Status: 200 (success), 201 (created), 400 (validation), 401 (auth), 404 (not found), 500 (server error)
