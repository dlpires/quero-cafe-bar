# Data Model: UX CRUD Improvements

## Entity Validation Rules (Frontend)

### Produto

| Field | Type | Required | Validation | Form Control |
|-------|------|----------|------------|--------------|
| `dsc_produto` | string | Yes | `validateRequired()` — must not be empty | `<ion-input type="text">` |
| `valor_unit` | number | Yes | `validatePositiveNumber()` — must be > 0 | `<ion-input type="number" step="0.01">` |
| `status` | boolean | No | `formData.get('status') === 'on'` — toggle to boolean | `<ion-toggle name="status">` |

**Error messages**:
- `dsc_produto`: "O campo 'Descrição do Produto' é obrigatório."
- `valor_unit`: "O campo 'Valor Unitário' deve ser maior que zero."

---

### Usuario

| Field | Type | Required | Validation | Form Control |
|-------|------|----------|------------|--------------|
| `nome` | string | Yes | `validateRequired()` — must not be empty | `<ion-input type="text">` |
| `login` | string | Yes | `validateRequired()` — must not be empty | `<ion-input type="text">` |
| `senha` | string | Yes | `validateRequired()` — must not be empty | `<ion-input type="password">` |
| `confirmar_senha` | string | Only on Reg | Must match `senha` | `<ion-input type="password">` |
| `id_perfil` | number | Yes | Must be selected (not null) | `<ion-select>` |

**Error messages**:
- `nome`: "O campo 'Nome' é obrigatório."
- `login`: "O campo 'Login' é obrigatório."
- `senha`: "O campo 'Senha' é obrigatório."
- `confirmar_senha`: "As senhas não conferem."
- `id_perfil`: "O campo 'Perfil' é obrigatório."

---

### Mesa

| Field | Type | Required | Validation | Form Control |
|-------|------|----------|------------|--------------|
| `dsc_mesa` | string | Yes | `validateRequired()` — must not be empty | `<ion-input type="text">` |
| `num_lugares` | number | Yes | `validatePositiveNumber()` — must be > 0 | `<ion-input type="number">` |
| `status` | boolean | No | `formData.get('status') === 'on'` — toggle to boolean | `<ion-toggle name="status">` |

**Error messages**:
- `dsc_mesa`: "O campo 'Descrição da Mesa' é obrigatório."
- `num_lugares`: "O campo 'Número de Lugares' deve ser maior que zero."

---

### Comanda

| Field | Type | Required | Validation | Form Control |
|-------|------|----------|------------|--------------|
| `id_mesa` | number | Yes | Must be selected (not null) | `<ion-select>` |
| `id_usuario` | number | Yes | From auth context (automatic) | (hidden, from JWT) |

**Error messages**:
- `id_mesa`: "O campo 'Mesa' é obrigatório."

---

## State Transitions

### Form States
```
[Idle] → [Validating] → [Submitting] → [Success → Toast → Navigate back]
                   ↓                        ↓
              [Invalid] ←        [Error → Alert → Re-enable button]
```

### Button States
```
Enabled: "Salvar" / "Cadastrar"
Disabled + Loading: "Salvando..."
Error: Re-enabled "Salvar" (retry)
```

### Toast States
```
Success toast → after 3s auto-dismiss → DOM remove
Error toast → user dismiss or 5s auto-dismiss → DOM remove
```

### List States
```
[Loading skeleton] → [Data rendered] or [Empty state with CTA] or [Error alert]
```

---

## Notification Types

| Type | Color | Icon | Duration | Use Case |
|------|-------|------|----------|----------|
| success | `success` (green) | `checkmark-circle-outline` | 3000ms | Save/update/delete succeeded |
| error | `danger` (red) | `alert-circle-outline` | 5000ms | Operation failed, network error |
| warning | `warning` (amber) | `warning-outline` | 4000ms | Non-blocking warning |
