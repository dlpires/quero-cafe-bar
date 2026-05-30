# API Contracts — Performance Mobile e Gestos Touch

## Endpoints modificados

Todos os endpoints GET de listagem recebem parâmetros opcionais de paginação:

### `GET /produto?skip=0&take=20`
### `GET /usuario?skip=0&take=20`
### `GET /mesa?skip=0&take=20`
### `GET /comanda?skip=0&take=20`

## Request

```typescript
{
  skip?: number;  // @IsInt @Min(0) @IsOptional (default: 0)
  take?: number;  // @IsInt @Min(1) @Max(100) @IsOptional (default: 20)
}
```

## Response (200 OK)

```typescript
{
  data: T[];       // Registros paginados
  total: number;   // Total no servidor (sem paginação)
  skip: number;    // Offset usado
  take: number;    // Limite usado
}
```

## Detection

`response.skip + response.data.length < response.total` → há mais páginas.
`response.data.length === 0` → empty state.

## Error Handling

- `skip` inválido (string não numérica): 400 Bad Request (ValidationPipe)
- `take` > 100: 400 Bad Request
