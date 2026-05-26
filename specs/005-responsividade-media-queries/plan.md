# Implementation Plan: Responsividade com Media Queries

**Branch**: `development` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-responsividade-media-queries/spec.md`

## Summary

Adicionar media queries CSS para tornar o layout responsivo em 5 breakpoints (320px, 375px, 414px, 768px, 1024px) mais um breakpoint ultra-wide (≥1400px). Escopo exclusivamente CSS — sem alterações em JS, HTML ou lógica de negócio. Afeta 10 arquivos CSS do frontend (HomePage, LoginPage, 4 listagens, 4 formulários).

## Technical Context

**Language/Version**: CSS3 (aproveitando CSS Grid e media queries nativas)

**Primary Dependencies**: Ionic 8.x (já fornece responsividade base para componentes) + Vite 7.x (build)

**Storage**: N/A

**Testing**: Jest + jsdom para testes de estilo computado em breakpoints; verificação visual manual nos 5 viewports alvo

**Target Platform**: Browsers modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Project Type**: Web app (Ionic + Vite + Vanilla JS Web Components)

**Performance Goals**: Sem regressão de paint performance — media queries têm overhead desprezível

**Constraints**: CSS exclusivamente; sem JS, HTML ou lógica de negócio

**Scale/Scope**: 10 arquivos .css, ~6-8 media queries no total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — N/A. Nenhum endpoint novo ou alteração de API. Apenas CSS frontend. ✅
2. **Modular Architecture** — ✅ As alterações ficam confinadas aos CSS existentes dentro dos módulos atuais (produto, usuario, mesa, comanda, home, login). Nenhum novo módulo necessário.
3. **Test-First** (NON-NEGOTIABLE) — ⚠️ Testes devem ser escritos e falhar antes da implementação. Para CSS responsivo, usaremos testes Jest que verificam estilos computados em diferentes viewports simulados (jsdom). Testes manuais visuais complementam nos 5 breakpoints.
4. **Full-Stack Consistency** — N/A. Sem contratos de dados. ✅
5. **Security & Observability** — N/A. Sem alterações de autenticação, validação ou tratamento de erros. ✅

**Resultado**: GATE PASS — todas as violações são N/A ou justificadas.

## Project Structure

### Documentation (this feature)

```text
specs/005-responsividade-media-queries/
├── spec.md               # Feature specification
├── plan.md               # This file
├── research.md           # Phase 0 — research findings
├── data-model.md         # Phase 1 — entity/data model
├── quickstart.md         # Phase 1 — implementation quickstart
├── contracts/            # Phase 1 — interface contracts (N/A for CSS)
├── checklists/
│   └── requirements.md   # Spec quality checklist
└── tasks.md              # (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/
│   ├── home/
│   │   └── HomePage.css              # Grid da cozinha (RF-R01)
│   ├── login/
│   │   └── LoginPage.css             # Login responsivo (RF-R02)
│   ├── produto/
│   │   ├── ListProdutoPage.css       # Listagem produtos (RF-R03)
│   │   ├── RegProdutoPage.css        # Form produto (RF-R04)
│   │   └── UpdateProdutoPage.css     # Form produto (RF-R04)
│   ├── usuario/
│   │   ├── ListUsuarioPage.css       # Listagem usuarios (RF-R03)
│   │   ├── RegUsuarioPage.css        # Form usuario (RF-R04)
│   │   └── UpdateUsuarioPage.css     # Form usuario (RF-R04)
│   ├── mesa/
│   │   ├── ListMesaPage.css          # Listagem mesas (RF-R03)
│   │   ├── RegMesaPage.css           # Form mesa (RF-R04)
│   │   └── UpdateMesaPage.css        # Form mesa (RF-R04)
│   └── comanda/
│       ├── ListComandaPage.css       # Listagem comandas (RF-R03)
│       ├── RegComandaPage.css        # Form comanda (RF-R04)
│       └── UpdateComandaPage.css     # Form comanda (RF-R04)
```

**Structure Decision**: Option 2 — Web application. Apenas o diretório `frontend/src/pages/` é relevante (CSS exclusivo do frontend). Nenhuma alteração no backend.

## Complexity Tracking

> Nenhuma violação constitucional identificada. N/A.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
