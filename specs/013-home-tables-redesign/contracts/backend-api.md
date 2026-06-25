# API Contracts: Home Tables Redesign

## Changed Endpoints

### GET /mesa (Updated)

Adds `hasActiveComanda` field to response.

**Query params**: (unchanged)
- `skip` (optional, int, default 0)
- `take` (optional, int, default 20, max 100)
- `id` (optional, int)
- `qtd_cadeiras` (optional, int)

**Response 200**:
```json
{
  "data": [
    {
      "id": 1,
      "qtd_cadeiras": 4,
      "status": true,
      "hasActiveComanda": false
    }
  ],
  "total": 10,
  "skip": 0,
  "take": 20
}
```

### PATCH /comanda/:id (Updated)

**Request body** (updated):
```json
{
  "id_mesa": 1,
  "obs_comanda": "Nova observação",
  "status": "fechada"
}
```

`status` is optional. Only `"fechada"` may be set (setting back to `"aberta"` is not allowed).

**Response 200**: Returns updated comanda with new status field.

### POST /comanda (Unchanged)

Creates comanda with `status = 'aberta'` by default.

**Request body**: (unchanged)
```json
{
  "id_mesa": 1,
  "obs_comanda": "Observação opcional"
}
```

**Response 201**:
```json
{
  "id": 1,
  "id_mesa": 1,
  "obs_comanda": "Observação opcional",
  "status": "aberta"
}
```

## New Endpoints

### GET /comanda/mesa/:id_mesa (Existing — now filters by status)

Returns the most recent comanda with `status = 'aberta'` for the given mesa.

**Response 200**:
```json
{
  "id": 1,
  "id_mesa": 1,
  "obs_comanda": "...",
  "status": "aberta",
  "itens": [...]
}
```

**Response 404**: No comanda found with status 'aberta' for this mesa.

## Frontend API Methods

### New/Updated Methods in `api.js`

```javascript
// Update comanda with optional status field
async updateComanda(id, comandaData) {
  // comandaData can now include { status: 'fechada' }
  return this.request(`/comanda/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(comandaData),
  });
}

// Get mesa with active comanda status
async getMesas(skip = 0, take = 20) {
  // Response now includes hasActiveComanda per mesa
  return this.request(`/mesa?skip=${skip}&take=${take}`);
}

// Get the active comanda for a mesa
async getActiveComandaByMesaId(id_mesa) {
  return this.request(`/comanda/mesa/${id_mesa}`);
}
```

## Error Codes

Status | Condition | Message
-------|-----------|--------
400 | Invalid status value | "status must be one of: aberta, fechada"
400 | Try to set status to 'aberta' when already 'fechada' | "Cannot reopen a closed comanda"
404 | Mesa not found | "Mesa com ID X não encontrada"
404 | No active comanda for mesa | "Nenhuma comanda ativa encontrada para a Mesa X"
