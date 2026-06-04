# Data Model: Performance Mobile e Gestos Touch Nativos

## Overview

Este plano não introduz novas entidades no banco de dados. As entidades existentes (Produto, Usuario, Mesa, Comanda) permanecem inalteradas. As adições abaixo são exclusivamente para o contrato de paginação da API REST e o modelo de estado do virtual scroll no frontend.

## Pagination Contract (Backend Response)

### PaginatedResponse<T>

Estrutura genérica para respostas paginadas de listagens:

```typescript
interface PaginatedResponse<T> {
  data: T[];          // Registros da página atual
  total: number;       // Total de registros no servidor (sem paginação)
  skip: number;        // Offset atual (0-indexed)
  take: number;        // Limite atual (tamanho da página)
}
```

**Regras**:
- `skip + data.length < total` → há mais páginas para carregar
- `skip + data.length >= total` → todos os registros foram carregados (desativar infinite scroll)
- Se `total === 0` → empty state, nenhum carregamento adicional

### PaginationQueryParams

Parâmetros de query aceitos por todos endpoints GET de listagem:

```typescript
interface PaginationQueryParams {
  skip?: number;   // Default: 0, mínimo: 0
  take?: number;   // Default: 20, mínimo: 1, máximo: 100
}
```

**Endpoints afetados**:
- `GET /produto?skip=0&take=20` (ListProdutoDto)
- `GET /usuario?skip=0&take=20` (ListUsuarioDto)
- `GET /mesa?skip=0&take=20` (ListMesaDto)
- `GET /comanda?skip=0&take=20` (ListComandaDto)

## Virtual Scroll State (Frontend)

### VirtualScrollState

Estado mantido por cada list page que usa virtual scroll (produto, usuario):

```typescript
interface VirtualScrollState {
  allItems: T[];                // Todos os itens carregados (dados completos em memória)
  itemHeight: number;           // Altura fixa estimada de cada item (px)
  containerHeight: number;      // Altura total do container = allItems.length * itemHeight
  viewportHeight: number;       // Altura visível do ion-content
  scrollTop: number;            // Posição atual do scroll
  buffer: number;               // Buffers adicionais = 2 (1 acima + 1 abaixo)
  
  // Itens visíveis calculados
  startIndex: number;           // Primeiro índice a renderizar
  endIndex: number;             // Último índice a renderizar
  visibleItems: T[];            // allItems.slice(startIndex, endIndex)
  offsetY: number;              // startIndex * itemHeight (translateY do container visível)
}
```

### SimpleAppendState (mesa, comanda)

```typescript
interface SimpleAppendState {
  allItems: T[];   // Todos os itens carregados (sem pruning)
  isLoading: boolean;
  hasMore: boolean;
}
```

## Lifecycle & State Transitions

### Infinite Scroll Flow

```
[Usuário rola até o fim] → [ionInfinite disparado]
  → isLoading = true
  → fetch(skip=items.length, take=20)
  → [Sucesso]:
      → allItems.push(...response.data)
      → hasMore = (skip + response.data.length < response.total)
      → isLoading = false
      → infiniteScroll.complete()
  → [Erro]:
      → showToast('Erro ao carregar', 'error')
      → isLoading = false
      → infiniteScroll.complete()
```

### Virtual Scroll Re-render Flow

```
[ionScroll evento] → [calcular startIndex/endIndex]
  → startIndex = max(0, floor(scrollTop / itemHeight) - buffer)
  → endIndex = min(allItems.length, ceil((scrollTop + viewportHeight) / itemHeight) + buffer)
  → visibleItems = allItems.slice(startIndex, endIndex)
  → render visibleItems com offsetY = startIndex * itemHeight
  → [User Timing]: measure('virtual-scroll:render')
```

### Pull-to-Refresh Flow

```
[Usuário puxa para baixo] → [ionRefresh disparado]
  → scrollTop = 0 (reset)
  → fetch(skip=0, take=20)
  → [Sucesso]:
      → allItems = response.data
      → hasMore = (response.data.length < response.total)
      → refresher.complete()
  → [Erro]:
      → showToast('Erro ao atualizar', 'error')
      → refresher.complete()
      → allItems = dados anteriores (não limpar)
```

### Swipe-to-Delete Flow

```
[Usuário desliza item para esquerda] → [ion-item-sliding mostra options]
  → [Usuário toca em "Excluir"]
  → [Confirmação via ion-alert]
  → [Confirmado]:
      → api.delete(id)
      → [Sucesso]: remover item de allItems, re-renderizar
      → [Erro]: showToast(error.message, 'error')
  → [Cancelado]: ion-item-sliding.close()
```

## Validation Rules

### PaginationQueryParams (Backend)
| Campo | Type | Required | Validação |
|-------|------|----------|-----------|
| `skip` | number | Opcional | `@IsInt()`, `@Min(0)`, `@IsOptional()`, default 0 |
| `take` | number | Opcional | `@IsInt()`, `@Min(1)`, `@Max(100)`, `@IsOptional()`, default 20 |

### List Item (Frontend rendering)
- Produto: `dsc_produto` (string), `valor_unit` (number), `status` (boolean), `id` (number)
- Usuario: `nome` (string), `usuario` (string), `perfil` (number), `id` (number)
- Mesa: `qtd_cadeiras` (number), `id` (number)
- Comanda: `id_mesa` (number), `data_hora_abertura` (Date), `status` (string), `id` (number)
