# Quickstart — UX CRUD Improvements

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
# Vite dev server at http://localhost:5173
```

## Testing

```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Verification Checklist

After implementing changes, verify:

1. **Toast on save**: Open any Reg/Update page → fill data → click "Salvar" → toast appears before navigating back
2. **Button disabled**: Click "Salvar" rapidly → button disables, shows "Salvando..." → only one request sent
3. **Validation**: Leave required field empty → click "Salvar" → error shown, no API request sent
4. **Empty states**: Access list with no records → icon + message + CTA button displayed
5. **Skeleton loading**: Refresh list page → skeleton screen shown during fetch
6. **Safe areas**: Open list pages on device with notch → content not behind rounded corners
7. **Font sizes**: Inspect any CRUD page → no font below 14px (labels) or 16px (body)
8. **401 handling**: Let session expire → only token removed from localStorage, other data preserved
9. **Router navigation**: Click FAB "Add" → SPA navigation, no page reload
10. **DOM cleanup**: Dispatch toast → dismiss → element removed from DOM

## Build

```bash
# Web build
npm run build
# Output: frontend/dist/

# Mobile (Android)
npx cap copy
npx cap run android
```
