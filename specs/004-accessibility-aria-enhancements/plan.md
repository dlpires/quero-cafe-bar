# Implementation Plan: Acessibilidade e ARIA — Fase 2

**Branch**: `004-accessibility-aria-enhancements` | **Date**: 2026-05-25 | **Spec**: `specs/004-accessibility-aria-enhancements/spec.md`

**Input**: Feature specification from `specs/004-accessibility-aria-enhancements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar melhorias de acessibilidade (WCAG) e experiência do usuário na Fase 2:
(1) atributos ARIA em botões de ícone para leitores de tela,
(2) gerenciamento de foco ao navegar entre páginas,
(3) mensagens de erro contextuais por código HTTP (ambas as camadas),
(4) proteção contra auto-exclusão de usuário,
(5) confirmação ao cancelar formulários com dados alterados.
Todas as alterações são na camada de apresentação (frontend) + retorno de mensagens descritivas pelo backend.

## Technical Context

**Language/Version**: Frontend: Vanilla JS (ES2020+) + Ionic 8.x Web Components + Vite 7.x. Backend: TypeScript 5.x + NestJS 11.x.

**Primary Dependencies**: Frontend: `@ionic/core` 8.x, `ion-icons`, `vite` 7.x. Backend: `@nestjs/common` 11.x, `class-validator`, `class-transformer`.

**Storage**: MySQL 8.x via TypeORM (no schema changes — this feature has no new entities).

**Testing**: Backend: Jest (24 suites, 163 tests, `yarn test`). Frontend: Jest (8 suites, 105 tests, `npm test`).

**Target Platform**: Web browsers (desktop + mobile responsive). Native Android (Capacitor) está fora de escopo.

**Project Type**: Web application (Ionic frontend + NestJS backend).

**Performance Goals**: N/A — purely accessibility/UX feature.

**Constraints**: 
- WCAG 2.1 AA compliance (critérios 2.5.3, 4.1.2, 2.4.3, 3.3.1)
- Test coverage MUST NOT decrease (Constitution Principle III — NON-NEGOTIABLE)
- `synchronize: false` — no schema changes needed for this feature
- JWT-secured routes for self-deletion check
- Depende das funções utilitárias `focusFirstElement()` e `showToast()` em `shared/util.js`

**Scale/Scope**: ~6 frontend pages (login, home/cozinha, produto, usuario, mesa, comanda) + backend error message improvements em controllers existentes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — ✅ Nenhum endpoint novo é introduzido. Apenas melhorias nas mensagens de erro de endpoints existentes. A interface de erro HTTP já é definida pelo NestJS `HttpException` e será estendida com mensagens descritivas.
2. **Modular Architecture** — ✅ As alterações encaixam-se nos módulos existentes (usuario, produto, mesa, comanda). Nenhum novo módulo é necessário.
3. **Test-First** (NON-NEGOTIABLE) — ✅ Testes existentes devem continuar passando. Novos testes frontend serão necessários para comportamentos ARIA, foco, confirmação e auto-exclusão. Novos testes backend para mensagens de erro.
4. **Full-Stack Consistency** — ✅ Mensagens de erro serão consistentes: backend retorna mensagem descritiva, frontend exibe conforme categoria HTTP.
5. **Security & Observability** — ✅ Auto-exclusão bloqueada via verificação JWT. Mensagens de erro específicas melhoram observabilidade. ValidationPipe + GlobalExceptionFilter já existentes.

## Project Structure

### Documentation (this feature)

```text
specs/004-accessibility-aria-enhancements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/src/
├── modules/
│   ├── usuario/
│   │   ├── usuario.controller.ts  # Melhorar mensagens de erro
│   │   └── usuario.service.ts
│   ├── produto/
│   │   └── produto.controller.ts  # Melhorar mensagens de erro
│   ├── mesa/
│   │   └── mesa.controller.ts     # Melhorar mensagens de erro
│   └── comanda/
│       └── comanda.controller.ts  # Melhorar mensagens de erro
├── filters/
│   └── global-exception.filter.ts # Mensagens de erro genéricas
└── pipes/
    └── validation.pipe.ts         # Mensagens de erro de validação

frontend/src/
├── pages/
│   ├── login/
│   │   └── LoginPage.js      # Foco + mensagens de erro
│   ├── home/
│   │   └── HomePage.js       # ARIA labels em botões de entrega + foco
│   ├── produto/
│   │   └── ProdutoPage.js    # ARIA labels + foco + confirmação cancelar
│   ├── usuario/
│   │   └── UsuarioPage.js    # ARIA labels + auto-exclusão + foco + confirmação
│   ├── mesa/
│   │   └── MesaPage.js       # ARIA labels + foco + confirmação cancelar
│   └── comanda/
│       └── ComandaPage.js    # ARIA labels + foco + confirmação cancelar
├── services/
│   └── api.js                # Tratamento de erro contextual por HTTP status
└── shared/
    ├── Header.js             # ARIA hidden em ícones decorativos
    └── util.js               # showToast + focusFirstElement (já existentes)

backend/tests/      # 24 suites, 163 tests (manter cobertura)
frontend/tests/     # 8 suites, 105 tests (manter cobertura + novos testes)
```

**Structure Decision**: Option 2 — Web application (frontend + backend). Nenhuma mudança estrutural no repositório. As alterações são distribuídas nos módulos/arquivos existentes.

## Post-Design Constitution Re-check

*Re-avaliação após conclusão da Fase 1 (research + design).*

1. **API-First** — ✅ Design preserva contratos existentes. O contrato de erro (`{ statusCode, message, timestamp }`) é estendido com novas mensagens, sem quebrar compatibilidade. Novo contrato de auto-exclusão documentado em `contracts/self-deletion.contract.md`.

2. **Modular Architecture** — ✅ Nenhum novo módulo. Alterações distribuídas nos módulos existentes, conforme documentado em `plan.md` (Project Structure).

3. **Test-First** (NON-NEGOTIABLE) — ✅ Design não introduz riscos de quebra de testes. Novos testes a serem escritos:
   - Backend: testar `ConflictException` em usuario/produto services; testar auto-exclusão no controller
   - Frontend: testar `aria-label` renderização; testar `hasFormChanges()` helper; testar auto-exclusão UI; testar mensagens de erro categorizadas

4. **Full-Stack Consistency** — ✅ Contrato de erro documentado em `contracts/error-response.contract.md` garante alinhamento entre camadas.

5. **Security & Observability** — ✅ Auto-exclusão protegida via validação JWT no backend. Mensagens de erro específicas por código HTTP melhoram observabilidade e debugging.

**Status**: ✅ Todos os gates constitucionais aprovados. Nenhuma violação justificada.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação identificada. Seção não aplicável.
