# Data Model: Acessibilidade e ARIA — Fase 2

## Status

**Nenhuma nova entidade de dados ou alteração de esquema é introduzida por esta spec.**

As alterações são puramente na camada de apresentação (frontend) e nos retornos de erro do backend. As entidades existentes permanecem inalteradas.

## Entidades Existentes (inalteradas)

| Entidade | Módulo | Tabela |
|----------|--------|--------|
| Usuario | `usuario` | `usuario` |
| Produto | `produto` | `produto` |
| Mesa | `mesa` | `mesa` |
| Comanda | `comanda` | `comanda` |
| ComandaItem | `comanda-item` | `comanda_item` |

## Fluxos de Estado (novos)

Embora nenhuma entidade seja criada, os seguintes fluxos de estado são introduzidos:

### Fluxo: Auto-exclusão
```
[Usuário clica Excluir no próprio registro] → [Backend valida: id do JWT == id do parâmetro]
  → Se SIM: retorna 400 "Você não pode excluir seu próprio usuário"
  → Se NÃO: prossegue com exclusão normal
```

### Fluxo: Confirmação de Cancelamento
```
[Usuário clica Cancelar] → [Frontend compara valores atuais com iniciais]
  → Se diferentes: exibe alerta de confirmação
    → [Usuário confirma] → navega de volta
    → [Usuário cancela] → permanece no formulário
  → Se iguais: navega de volta sem confirmação
```

## Validações (novas)

| Regra | Local | Descrição |
|-------|-------|-----------|
| Auto-exclusão | Backend (`UsuarioController.remove`) | `id` do JWT ≠ `id` do parâmetro |
| Formulário sujo | Frontend (todas as páginas Reg/Update) | Detecta alterações comparando valores atuais com iniciais |

## Estados de Transição

N/A — nenhuma transição de estado de entidade é alterada.
