# Contract: PaginatedResponse

Backend → Frontend contract for paginated list endpoints.

## Endpoints Using This Contract

| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/usuario` | `?skip=0&take=20` |
| GET | `/produto` | `?skip=0&take=20` |
| GET | `/mesa` | `?skip=0&take=20` |
| GET | `/comanda` | `?skip=0&take=20` |

## Response Shape

```json
{
  "data": [T, ...],
  "total": 42,
  "skip": 0,
  "take": 10
}
```

| Field | Type | Always Present | Description |
|-------|------|---------------|-------------|
| `data` | `T[]` | ✅ | Array of entity records for this page |
| `total` | `number` | ✅ | Total number of records matching the query (not just this page) |
| `skip` | `number` | ✅ | Offset value used (echoed back from request) |
| `take` | `number` | ✅ | Page size value used (echoed back from request) |

## TypeScript Definition (Backend)

```typescript
// File: backend/src/modules/produto/dto/paginated-response.dto.ts
export class PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}
```

## TypeScript Definition (Frontend — new)

```typescript
// File: frontend/src/services/paginated-response.js (new)
// Informal JSDoc type — Vanilla JS project
/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} total
 * @property {number} skip
 * @property {number} take
 */
```

## Request Params

| Param | Type | Default | Min | Max | Description |
|-------|------|---------|-----|-----|-------------|
| `skip` | `number` | `0` | `0` | — | Number of records to skip (offset) |
| `take` | `number` | `20` | `1` | `100` | Number of records to return (page size) |

## Error Responses

| Status | Body | When |
|--------|------|------|
| 400 | `{ message: ["take must not be greater than 100"], error: "Bad Request" }` | Invalid params (ValidationPipe) |
| 401 | `{ message: "Unauthorized", statusCode: 401 }` | Missing/invalid JWT |
| 500 | `{ message: "Internal server error", statusCode: 500 }` | Unhandled server error |
