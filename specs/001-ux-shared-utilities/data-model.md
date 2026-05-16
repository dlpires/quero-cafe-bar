# Data Model: UX Foundation — Shared Utilities

## Overview

This feature does not introduce new data entities. Instead, it defines the
contract (function signatures) for a set of shared utility functions that
other pages will consume.

## Function Contracts

### `showToast(message, type, duration?)`

Displays a temporary notification overlay.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `message` | `string` | yes | — | Text content of the toast |
| `type` | `'success' \| 'error' \| 'warning'` | yes | — | Visual style (color/icon) |
| `duration` | `number` | no | `3000` | Milliseconds before auto-dismiss |

**Returns**: `Promise<void>` — resolves when toast is dismissed

### `withLoading(promise, options?)`

Wraps an async operation with loading state management.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `promise` | `Promise<any>` | yes | — | The async operation to wrap |
| `options` | `object` | no | `{}` | Optional configuration |

**Options fields**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `loadingMessage` | `string` | `'Salvando...'` | Text shown in loading overlay |
| `duration` | `number` | `0` | Auto-dismiss duration (0 = manual) |

**Returns**: `Promise<any>` — resolves/rejects with the wrapped promise value

**Behavior**: Shows an `ion-loading` overlay, executes the promise, dismisses
loading on completion (success or error).

### `createEmptyState(container, options)`

Renders a rich empty state inside a given container element.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `container` | `HTMLElement` | yes | — | DOM element to render into |
| `options.icon` | `string` | no | `'file-tray-outline'` | Ionic icon name |
| `options.message` | `string` | no | `'Nenhum registro encontrado'` | Descriptive text |
| `options.actionLabel` | `string` | no | — | CTA button label (omit = no button) |
| `options.actionHandler` | `function` | no | — | Click handler for CTA button |

**Returns**: `void`

### `validateRequired(value, fieldName)`

Checks if a value is non-empty.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | `string` | yes | The field value to check |
| `fieldName` | `string` | yes | Human-readable field name for error message |

**Returns**: `string | null` — error message if invalid, `null` if valid

**Example**: `validateRequired('', 'Nome')` → `'Nome é obrigatório'`

### `validatePositiveNumber(value, fieldName)`

Checks if a value is a positive number.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | `string \| number` | yes | The field value to check |
| `fieldName` | `string` | yes | Human-readable field name for error message |

**Returns**: `string | null` — error message if invalid, `null` if valid

**Example**: `validatePositiveNumber(-5, 'Preço')` → `'Preço deve ser maior que zero'`

### `focusFirstElement(container)`

Moves keyboard focus to the first interactive element within a container.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `container` | `HTMLElement` | yes | DOM element to search within |

**Returns**: `void`

**Behavior**: Searches for first `ion-input`, `ion-button`, `a`, `button`,
`input`, `select`, or `textarea` and calls `.focus()` on it.

## State Transitions

This feature has no long-lived state — all functions are stateless utilities
except for the `logout()` function which clears the auth token.

## API Service Changes

### `localStorage.clear()` → `localStorage.removeItem('token')`

**Current**: `util.js:3` and `api.js:54` call `localStorage.clear()`
**Target**: Replace with `localStorage.removeItem('token')`

This is NOT a new entity — it's a mutation operation on the existing
`localStorage` key-value store.

### `ngrok-skip-browser-warning` header removal

**Current**: `api.js:33,88` send header unconditionally
**Target**: Gate behind `!environment.production` or remove entirely

This affects the HTTP request header configuration, not a data entity.
