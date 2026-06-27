# Specification Quality Checklist: Home Tables Redesign

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 25/06/2026
**Updated**: 25/06/2026 (3 clarifications resolved)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Clarifications Applied (2026-06-25)

| # | Question | Answer |
|---|----------|--------|
| 1 | Comanda lifecycle — when is a comanda "closed"? | Add `status` field ("aberta"/"fechada") to Comanda entity; table available only when all comandas are "fechada" |
| 2 | Where does the kitchen view go? | Move to new `/cozinha` route |
| 3 | Show inactive tables on home? | No — show only active tables (status=true). Inactive tables managed via `/mesas` |

## Notes

- All 3 clarifications integrated into spec (FR-004, FR-016, FR-017, FR-018, Key Entities, Assumptions, Clarifications sections)
- No outstanding ambiguities. Spec is ready for `/speckit.plan`.
