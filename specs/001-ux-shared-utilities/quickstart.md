# Quickstart: UX Shared Utilities

## Importing

```javascript
import { showToast, withLoading, createEmptyState, validateRequired, validatePositiveNumber, focusFirstElement } from '../../shared/util.js';
```

## Usage Examples

### Toast Notification

```javascript
// Success
await showToast('Produto cadastrado com sucesso!', 'success');

// Error
await showToast('Erro ao salvar: nome já existe', 'error');

// Warning with custom duration
await showToast('Campos obrigatórios não preenchidos', 'warning', 5000);
```

### Loading Wrapper

```javascript
async function handleSubmit() {
  await withLoading(api.createProduto(data), {
    loadingMessage: 'Salvando produto...',
  });
}
```

### Empty State

```javascript
createEmptyState(listContainer, {
  icon: 'cube-outline',
  message: 'Nenhum produto cadastrado',
  actionLabel: 'Cadastrar Produto',
  actionHandler: () => router.push('/produto/register'),
});
```

### Validation

```javascript
const errors = [];
const nameErr = validateRequired(formData.get('nome'), 'Nome');
if (nameErr) errors.push(nameErr);

const priceErr = validatePositiveNumber(formData.get('preco'), 'Preço');
if (priceErr) errors.push(priceErr);

if (errors.length > 0) {
  await showToast(errors.join('. '), 'error');
  return;
}
```

### Focus Management

```javascript
connectedCallback() {
  this.innerHTML = `...form template...`;
  focusFirstElement(this);
}
```

## Migration

### For existing pages (Fase 1+)

Replace inline toast/loading patterns with:

```javascript
// Before try/catch with custom alert
try {
  await api.create(data);
  const alert = document.createElement('ion-alert');
  // ... 20+ lines
} catch (err) {
  // ... more boilerplate
}

// After
await withLoading(api.create(data));
await showToast('Criado com sucesso!', 'success');
```
