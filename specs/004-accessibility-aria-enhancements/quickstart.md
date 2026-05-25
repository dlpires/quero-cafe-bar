# Quickstart: Acessibilidade e ARIA — Fase 2

## Objetivo

Implementar 5 melhorias de UX/acessibilidade:

1. ARIA labels em botões de ícone + `aria-hidden` em ícones decorativos
2. Gerenciamento de foco ao navegar entre páginas
3. Mensagens de erro contextuais por código HTTP (frontend + backend)
4. Proteção contra auto-exclusão de usuário
5. Confirmação ao cancelar formulários com dados alterados

## Arquivos a Modificar

### Frontend (8 suites, 105 testes — manter cobertura)

| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/services/api.js` | Mapeamento HTTP → mensagens; extrair `error.message` do backend |
| `frontend/src/shared/util.js` | Adicionar helper `hasFormChanges()` |
| `frontend/src/shared/Header.js` | `aria-label` no logout; `aria-hidden` em ícones decorativos |
| `frontend/src/pages/home/HomePage.js` | `aria-label` nos botões de entrega; foco inicial; `showToast()` |
| `frontend/src/pages/produto/ListProdutoPage.js` | `aria-label` edit/delete/FAB; foco pós-navegação |
| `frontend/src/pages/produto/RegProdutoPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/produto/UpdateProdutoPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/usuario/ListUsuarioPage.js` | `aria-label` edit/delete/FAB; auto-exclusão; foco |
| `frontend/src/pages/usuario/RegUsuarioPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/usuario/UpdateUsuarioPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/mesa/ListMesaPage.js` | `aria-label` edit/delete/FAB; foco |
| `frontend/src/pages/mesa/RegMesaPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/mesa/UpdateMesaPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/comanda/ListComandaPage.js` | `aria-label` edit/delete/FAB; foco |
| `frontend/src/pages/comanda/RegComandaPage.js` | Foco inicial; confirmação ao cancelar |
| `frontend/src/pages/comanda/UpdateComandaPage.js` | `aria-label` delete item; foco; `showToast()`; confirmação |
| `frontend/src/pages/login/LoginPage.js` | Foco inicial no campo usuário |

### Backend (24 suites, 163 testes — manter cobertura)

| Arquivo | Alteração |
|---------|-----------|
| `backend/src/modules/usuario/usuario.controller.ts` | Validar auto-exclusão via JWT |
| `backend/src/modules/usuario/usuario.service.ts` | Adicionar `ConflictException` para duplicidade |
| `backend/src/modules/produto/produto.service.ts` | Adicionar `ConflictException` para duplicidade |

## Testes

```bash
# Backend
cd backend && yarn test

# Frontend
cd frontend && npm test
```

## Verificação de Acessibilidade

1. Chrome DevTools → Lighthouse → Accessibility (score ≥ 90)
2. Chrome DevTools → Painel Accessibility — verificar `aria-label` em todos os botões de ícone
3. Navegação por teclado (Tab, Enter, Space) em todas as páginas
