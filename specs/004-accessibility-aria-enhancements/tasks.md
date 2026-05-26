# Tasks: Acessibilidade e ARIA — Fase 2

**Input**: Design documents from `specs/004-accessibility-aria-enhancements/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Per Constitution Principle III (NON-NEGOTIABLE), tests MUST be written and failing BEFORE implementation (RED-GREEN-REFACTOR).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown follow the project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan
- [X] T002 Initialize feature branch `004-accessibility-aria-enhancements`
- [X] T003 [P] Configure linting and formatting tools for consistency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Setup error response contract mapping in `frontend/src/services/api.js`
- [X] T005 [P] Create `hasFormChanges()` helper in `frontend/src/shared/util.js`
- [X] T006 [P] Setup JWT decoding utility function in `frontend/src/shared/util.js`
- [X] T007 [P] Setup focus management utilities in `frontend/src/shared/util.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Navegação por Leitor de Tela (Priority: P1) 🎯 MVP

**Goal**: Adicionar atributos ARIA em botões de ícone para leitores de tela e aria-hidden em ícones decorativos

**Independent Test**: Abrir Chrome DevTools > Accessibility e verificar que cada botão de ícone anuncia sua ação corretamente

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [X] T008 [P] [US1] Test aria-label rendering in `frontend/tests/unit/shared/Header.spec.js`
- [X] T009 [P] [US1] Test aria-label rendering in `frontend/tests/unit/pages/produto/ListProdutoPage.spec.js`
- [X] T010 [P] [US1] Test aria-hidden rendering in decorative icons in `frontend/tests/unit/shared/Header.spec.js`

### Implementation for User Story 1

- [X] T011 [P] [US1] Add aria-label to edit/delete/FAB buttons in `frontend/src/pages/produto/ListProdutoPage.js` — edit: `aria-label="Editar ${produto.dsc_produto}"`, delete: `aria-label="Excluir ${produto.dsc_produto}"`, FAB: `aria-label="Adicionar Produto"`
- [X] T012 [P] [US1] Add aria-label to edit/delete/FAB buttons in `frontend/src/pages/usuario/ListUsuarioPage.js` — edit: `aria-label="Editar ${usuario.usuario}"`, delete: `aria-label="Excluir ${usuario.usuario}"`, FAB: `aria-label="Adicionar Usuário"`
- [X] T013 [P] [US1] Add aria-label to edit/delete/FAB buttons in `frontend/src/pages/mesa/ListMesaPage.js` — edit: `aria-label="Editar Mesa ${mesa.id}"`, delete: `aria-label="Excluir Mesa ${mesa.id}"`, FAB: `aria-label="Adicionar Mesa"`
- [X] T014 [P] [US1] Add aria-label to edit/delete/FAB buttons in `frontend/src/pages/comanda/ListComandaPage.js` — edit: `aria-label="Editar Comanda ${comanda.id}"`, delete: `aria-label="Excluir Comanda ${comanda.id}"`, FAB: `aria-label="Abrir Comanda"`
- [X] T015 [P] [US1] Add aria-label to logout button in `frontend/src/shared/Header.js` — `aria-label="Sair"`
- [X] T016 [P] [US1] Add aria-label to delivery status buttons in `frontend/src/pages/home/HomePage.js` — `aria-label="Marcar ${item.produto?.dsc_produto || item.id} como entregue"`
- [X] T017 [P] [US1] Add aria-label to delete item buttons in `frontend/src/pages/comanda/UpdateComandaPage.js` — `aria-label="Excluir ${item.produto?.dsc_produto}"`
- [X] T018 [P] [US1] Add aria-hidden to decorative menu icons in `frontend/src/shared/Header.js`
- [X] T019 [P] [US1] Add aria-hidden to decorative header icon in `frontend/src/shared/Header.js`
- [X] T020 [P] [US1] Add aria-hidden to input icons in `frontend/src/pages/login/LoginPage.js`
- [X] T021 [P] [US1] Add aria-hidden to form button icons in all Reg/Update pages
- [X] T022 [P] [US1] Add aria-hidden to empty state icon in `frontend/src/shared/util.js`
- [X] T023 [P] [US1] Add aria-hidden to status icons in list pages

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navegação por Teclado e Foco (Priority: P1)

**Goal**: Gerenciar foco ao navegar entre páginas para usuários que navegam exclusivamente por teclado

**Independent Test**: Navegar entre páginas usando apenas a tecla Tab e verificar se o foco começa do topo da nova página

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [X] T024 [P] [US2] Test focus management in `frontend/tests/unit/pages/produto/ListProdutoPage.spec.js`
- [X] T025 [P] [US2] Test focus management in `frontend/tests/unit/pages/produto/RegProdutoPage.spec.js`
- [X] T026 [P] [US2] Test focusFirstElement after navigation in `frontend/tests/unit/shared/util.spec.js`

### Implementation for User Story 2

- [X] T027 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/login/LoginPage.js`
- [X] T028 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/home/HomePage.js`
- [X] T029 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/produto/ListProdutoPage.js`
- [X] T030 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/produto/RegProdutoPage.js`
- [X] T031 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/produto/UpdateProdutoPage.js`
- [X] T032 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/usuario/ListUsuarioPage.js`
- [X] T033 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/usuario/RegUsuarioPage.js`
- [X] T034 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/usuario/UpdateUsuarioPage.js`
- [X] T035 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/mesa/ListMesaPage.js`
- [X] T036 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/mesa/RegMesaPage.js`
- [X] T037 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/mesa/UpdateMesaPage.js`
- [X] T038 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/comanda/ListComandaPage.js`
- [X] T039 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/comanda/RegComandaPage.js`
- [X] T040 [P] [US2] Add `focusFirstElement()` to connectedCallback in `frontend/src/pages/comanda/UpdateComandaPage.js`
- [X] T041 [US2] Add focus management after navigation on list pages (urlChanged listener)
- [X] T042 [US2] Replace window.location.href with router.push for logout and 401 redirects

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mensagens de Erro Contextuais (Priority: P2)

**Goal**: Exibir mensagens de erro específicas ao código de status HTTP retornado

**Independent Test**: Provocar erros específicos (ex.: criar registro duplicado para 409, enviar token inválido para 401) e verificar se a mensagem corresponde ao tipo de erro

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [X] T043 [P] [US3] Test error message mapping in `frontend/tests/unit/services/api.spec.js`
- [X] T044 [P] [US3] Test conflict exception in `backend/tests/unit/modules/usuario/usuario.service.spec.ts`
- [X] T045 [P] [US3] Test conflict exception in `backend/tests/unit/modules/produto/produto.service.spec.ts`

### Implementation for User Story 3

- [X] T046 [US3] Implement HTTP error code to message mapping in `frontend/src/services/api.js`
- [X] T047 [P] [US3] Update error handling to show real error.message in all List pages
- [X] T048 [P] [US3] Update error handling to show real error.message in all Reg/Update pages
- [X] T049 [P] [US3] Add ConflictException for duplicate usuario in `backend/src/modules/usuario/usuario.service.ts`
- [X] T050 [P] [US3] Add ConflictException for duplicate produto in `backend/src/modules/produto/produto.service.ts`
- [X] T051 [P] [US3] Standardize error messages in `backend/src/modules/mesa/mesa.controller.ts` per error-response.contract.md
- [X] T052 [P] [US3] Standardize error messages in `backend/src/modules/comanda/comanda.controller.ts` per error-response.contract.md
- [X] T053 [US3] Replace manual ion-toast with showToast helper in `frontend/src/pages/home/HomePage.js`
- [X] T054 [US3] Replace manual ion-toast with showToast helper in `frontend/src/pages/comanda/UpdateComandaPage.js`

**Checkpoint**: User Stories 1, 2, and 3 should all work independently

---

## Phase 6: User Story 4 - Proteção Contra Auto-exclusão (Priority: P2)

**Goal**: Impedir que um usuário exclua seu próprio registro

**Independent Test**: Logar como um usuário, navegar até a lista de usuários e tentar excluir o próprio registro

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [X] T055 [P] [US4] Test self-deletion UI protection in `frontend/tests/unit/pages/usuario/ListUsuarioPage.spec.js`
- [X] T056 [P] [US4] Test self-deletion backend validation in `backend/tests/unit/modules/usuario/usuario.controller.spec.ts`

### Implementation for User Story 4

- [X] T057 [P] [US4] Implement JWT payload extraction on DELETE in `backend/src/modules/usuario/usuario.controller.ts`
- [X] T058 [P] [US4] Add self-deletion check in render in `frontend/src/pages/usuario/ListUsuarioPage.js`
- [X] T059 [US4] Add self-deletion toast message in `frontend/src/pages/usuario/ListUsuarioPage.js`

**Checkpoint**: User Stories 1, 2, 3, and 4 should all work independently

---

## Phase 7: User Story 5 - Confirmação ao Cancelar (Priority: P3)

**Goal**: Exibir confirmação antes de perder dados não salvos ao cancelar formulários

**Independent Test**: Preencher campos de um formulário e clicar em Cancelar — deve aparecer um diálogo de confirmação

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [X] T060 [P] [US5] Test form dirty detection in `frontend/tests/unit/pages/produto/RegProdutoPage.spec.js`
- [X] T061 [P] [US5] Test cancel confirmation dialog in `frontend/tests/unit/pages/produto/RegProdutoPage.spec.js`

### Implementation for User Story 5

- [X] T062 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/produto/RegProdutoPage.js`
- [X] T063 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/produto/UpdateProdutoPage.js`
- [X] T064 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/usuario/RegUsuarioPage.js`
- [X] T065 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/usuario/UpdateUsuarioPage.js`
- [X] T066 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/mesa/RegMesaPage.js`
- [X] T067 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/mesa/UpdateMesaPage.js`
- [X] T068 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/comanda/RegComandaPage.js`
- [X] T069 [P] [US5] Add form dirty detection and cancel confirmation to `frontend/src/pages/comanda/UpdateComandaPage.js`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T070 [P] Run Lighthouse Accessibility audit across all pages (target ≥ 90)
- [X] T071 [P] Verify keyboard navigation (Tab, Enter, Space) on all pages
- [X] T072 Verify all aria-labels are correctly announced by screen readers (NVDA/VoiceOver)
- [X] T073 Run full test suite: `cd backend && yarn test` and `cd frontend && npm test`
- [X] T074 Run linting: `cd backend && yarn lint`
- [X] T075 Code cleanup and refactoring across modified files
- [X] T076 Update documentation in specs/004-accessibility-aria-enhancements/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Independently testable
- **User Story 3 (P2)**: Can start after Foundational - Independently testable
- **User Story 4 (P2)**: Can start after Foundational - Independently testable
- **User Story 5 (P3)**: Can start after Foundational - Independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Implementation tasks can run in parallel within a story if they affect different files
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- All implementation tasks within a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all aria-label additions for User Story 1 together:
Task: "Add aria-label to buttons in frontend/src/pages/produto/ListProdutoPage.js"
Task: "Add aria-label to buttons in frontend/src/pages/usuario/ListUsuarioPage.js"
Task: "Add aria-label to buttons in frontend/src/pages/mesa/ListMesaPage.js"
Task: "Add aria-label to buttons in frontend/src/pages/comanda/ListComandaPage.js"
Task: "Add aria-label to logout in frontend/src/shared/Header.js"
Task: "Add aria-label to delivery in frontend/src/pages/home/HomePage.js"
Task: "Add aria-label to delete in frontend/src/pages/comanda/UpdateComandaPage.js"

# Launch all aria-hidden additions for User Story 1 together:
Task: "Add aria-hidden to menu icons in frontend/src/shared/Header.js"
Task: "Add aria-hidden to header icon in frontend/src/shared/Header.js"
Task: "Add aria-hidden to input icons in frontend/src/pages/login/LoginPage.js"
Task: "Add aria-hidden to empty state in frontend/src/shared/util.js"
Task: "Add aria-hidden to status icons in list pages"
Task: "Add aria-hidden to form button icons in all Reg/Update pages"
```

## Parallel Example: User Story 2

```bash
# Launch all focusFirstElement additions for User Story 2 together:
Task: "Add focusFirstElement to LoginPage.js"
Task: "Add focusFirstElement to HomePage.js"
Task: "Add focusFirstElement to ListProdutoPage.js"
Task: "Add focusFirstElement to RegProdutoPage.js"
Task: "Add focusFirstElement to UpdateProdutoPage.js"
Task: "Add focusFirstElement to ListUsuarioPage.js"
Task: "Add focusFirstElement to RegUsuarioPage.js"
Task: "Add focusFirstElement to UpdateUsuarioPage.js"
Task: "Add focusFirstElement to ListMesaPage.js"
Task: "Add focusFirstElement to RegMesaPage.js"
Task: "Add focusFirstElement to UpdateMesaPage.js"
Task: "Add focusFirstElement to ListComandaPage.js"
Task: "Add focusFirstElement to RegComandaPage.js"
Task: "Add focusFirstElement to UpdateComandaPage.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (ARIA labels) → Test → Deploy (MVP!)
3. Add User Story 2 (Focus management) → Test → Deploy
4. Add User Story 3 (Error messages) → Test → Deploy
5. Add User Story 4 (Self-deletion) → Test → Deploy
6. Add User Story 5 (Cancel confirmation) → Test → Deploy
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (all 13 files in parallel!)
   - Developer B: User Story 2 (all 14 files in parallel!)
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence