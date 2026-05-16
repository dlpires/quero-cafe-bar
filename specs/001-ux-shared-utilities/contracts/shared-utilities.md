# Shared Utility Contracts

## Module: `shared/util.js`

### Exports

```
showToast(message: string, type: 'success' | 'error' | 'warning', duration?: number): Promise<void>
withLoading(promise: Promise<any>, options?: { loadingMessage?: string, duration?: number }): Promise<any>
createEmptyState(container: HTMLElement, options: { icon?: string, message?: string, actionLabel?: string, actionHandler?: Function }): void
validateRequired(value: string, fieldName: string): string | null
validatePositiveNumber(value: string | number, fieldName: string): string | null
focusFirstElement(container: HTMLElement): void
logout(): void
```

### Dependencies

- `ion-toast` component (loaded by Ionic core)
- `ion-loading` component (loaded by Ionic core)
- `window.localStorage` via standard DOM API

## Patch: `services/api.js`

### Changes

1. Line 54: `localStorage.clear()` → `localStorage.removeItem('token')`
2. Lines 33, 88: Remove or gate `ngrok-skip-browser-warning` header behind
   `!environment.production`

### Existing Consumers

- All page components import from `shared/util.js` and `services/api.js`
- Test files: `shared/util.spec.js`, `services/api.spec.js`
