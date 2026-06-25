# Data Model: Home Tables Redesign

## Entities

### Comanda (Updated)

Field | Type | Constraints | Notes
------|------|-------------|------
id | number (PK, auto) | PrimaryGeneratedColumn | Existing
id_mesa | number (FK → Mesa.id) | NOT NULL | Existing
obs_comanda | varchar(100) | NULLABLE | Existing
**status** | **varchar(10)** | **NOT NULL, DEFAULT 'aberta'** | **NEW — values: 'aberta', 'fechada'**
mesa | relation → Mesa | ManyToOne | Existing
itens | relation → ComandaItem[] | OneToMany, cascade | Existing

**State transitions:**
- `'aberta'` → `'fechada'`: via "Fechar Comanda" action on UpdateComandaPage
- `'fechada'` → `'aberta'`: NOT allowed (irreversible)

**Validation rules:**
- `status` must be one of: 'aberta', 'fechada'
- New comandas always created with `status = 'aberta'`
- Only comandas with `status = 'aberta'` can have items added/modified
- No new items can be added to `status = 'fechada'` comandas

### Mesa (Unchanged)

Field | Type | Constraints | Notes
------|------|-------------|------
id | number (PK, auto) | PrimaryGeneratedColumn | Existing
qtd_cadeiras | int | NOT NULL, MIN 1 | Existing
status | boolean | DEFAULT true | true = ativa, false = inativa

### New Derived Field: `hasActiveComanda`

Exposed on `GET /mesa` response as a computed boolean field:

Field | Type | Description
------|------|-------------
hasActiveComanda | boolean | true if mesa has at least one comanda with status = 'aberta'

**Derivation logic:**
```
hasActiveComanda = EXISTS(
  SELECT 1 FROM comandas 
  WHERE id_mesa = mesa.id AND status = 'aberta'
)
```

### ComandaItem (Unchanged)

Field | Type | Constraints | Notes
------|------|-------------|------
id_comanda | number (PK, FK) | PrimaryColumn | Existing
id_produto | number (PK, FK) | PrimaryColumn | Existing
qtd_item | float | NOT NULL | Existing
valor_venda | decimal(10,2) | NOT NULL | Existing
statusPg | boolean | DEFAULT false | Existing
statusEntrega | boolean | DEFAULT false | Existing
comanda | relation → Comanda | ManyToOne, CASCADE | Existing
produto | relation → Produto | ManyToOne | Existing

## Relationships

```
Mesa (1) ──────────< (N) Comanda (1) ──────────< (N) ComandaItem
                                                          │
                                                    Produto (1)
```

- A Mesa can have zero or many Comandas
- A Comanda belongs to exactly one Mesa
- A Comanda has zero or many ComandaItems
- A ComandaItem belongs to exactly one Comanda and one Produto

## Migration

```sql
-- New column on comandas table
ALTER TABLE comandas 
  ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'aberta' 
  CHECK (status IN ('aberta', 'fechada'));

-- Existing comandas get 'aberta' by default (safe migration)
```
