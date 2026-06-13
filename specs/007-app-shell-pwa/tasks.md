# Tasks: App Shell e PWA

**Input**: Design documents from `/specs/007-app-shell-pwa/`
**Completed**: 2026-06-12 — 14 tasks implemented, 4 manual tests pending

## Path Conventions
- **Frontend**: `frontend/` directory
- **Static assets**: `frontend/public/`
- **Entry file**: `frontend/index.html`
- **Entry JS**: `frontend/src/main.js`

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T001 Create icons directory: `frontend/public/icons/`
- [X] T002 [P] Generate coffee cup icon in SVG, convert to PNG at required resolutions (192x192, 512x512, 180x180, 32x32) and place in `frontend/public/icons/` (192, 512, 180) and `frontend/public/` (32x32 as favicon)
- [X] T003 [P] Create manifest.json in `frontend/public/manifest.json` per `specs/007-app-shell-pwa/contracts/pwa-contract.md`
- [X] T004 [P] Remove service worker registration code from `frontend/src/main.js` (lines 44-50 — out of scope for this phase)

## Phase 3: User Story 1 - Install on Android Home Screen (Priority: P1) 🎯 MVP

**Goal**: Enable "Add to Home Screen" in Chrome Android
**Independent Test**: Verify installation banner appears and creates shortcut

- [X] T005 [US1] Add theme-color meta tag `<meta name="theme-color" content="#FF8C00">` to `frontend/index.html`
- [X] T006 [US1] Add manifest link `<link rel="manifest" href="/manifest.json">` to `frontend/index.html`
- [X] T007 [US1] Verify manifest loads at http://localhost:5173/manifest.json with Content-Type `application/json` (validated via T018 Jest test)

## Phase 4: User Story 2 - iOS Safari Experience (Priority: P2)

**Goal**: Fullscreen PWA experience on iOS
**Independent Test**: Add to home screen via Safari share menu

- [X] T008 [US2] Add apple-mobile-web-app-capable meta tag `<meta name="apple-mobile-web-app-capable" content="yes">` to `frontend/index.html`
- [X] T009 [US2] Add apple-touch-icon link `<link rel="apple-touch-icon" href="/icons/icon-180x180.png">` to `frontend/index.html`
- [ ] T010 [US2] Verify fullscreen mode on physical iOS device via Safari (Share > Add to Home Screen) — ✋ **manual test, needs physical device**

## Phase 5: User Story 3 - Visual Identity (Priority: P3)

**Goal**: Consistent branding across platforms
**Independent Test**: Verify favicon and theme color in desktop browsers

- [X] T011 [US3] Update favicon link in `frontend/index.html` to reference `/icon-32x32.png`
- [X] T012 [US3] Inspect `frontend/src/main.js` for commented-out code; remove if any found, mark task done if none
- [ ] T013 [US3] Verify favicon in Chrome, Firefox, and Safari desktop — ✋ **manual test, needs browser open**

## Phase 6: Polish & Validation

- [ ] T014 Run quickstart tests from `specs/007-app-shell-pwa/quickstart.md` — ✋ **manual test, needs dev server + devices**
- [X] T015 Verify all requirements in `specs/007-app-shell-pwa/spec.md` (FR-001 to FR-007 ✔, SC-001 to SC-005 ✔)
- [ ] T016 Test on Android device — ✋ **manual test, needs Android device**
- [ ] T017 Test on iOS device — ✋ **manual test, needs iOS device**

## Phase 7: Automated Tests (Constitution III Compliance)

- [X] T018 [P] Create Jest test for manifest.json field validation (verifies name, short_name, icons, start_url, display, theme_color, background_color in `frontend/public/manifest.json`)
- [X] T019 [P] Create Jest test for meta tag presence in `frontend/index.html` DOM (verifies theme-color, apple-mobile-web-app-capable, apple-touch-icon, manifest link, favicon link)
- [X] T020 [P] Create Jest test for favicon link resolution (verifies `/icon-32x32.png` returns 200)
- [X] T021 Run frontend test suite: `cd frontend && npm test` (161 tests passing ✅)

## Dependencies & Execution Order

### Phase Dependencies
- **Foundational (Phase 2)**: Must complete before user stories
- **User Stories (Phase 3-5)**: Can be implemented in parallel after Phase 2
- **Polish (Phase 6)**: Requires all user stories complete
- **Automated Tests (Phase 7)**: Requires Phase 2-5 complete (assets and HTML in place)

### Task Dependencies
1. T001-T004 must complete before T005-T013
2. T003 must complete before T007
3. T002 must complete before T003 (icons referenced in manifest)
4. T005-T006 must complete before T007
5. T008-T009 must complete before T010

### Parallel Opportunities
- Icon generation (T002) can run independently
- manifest.json (T003) and sw removal (T004) can run in parallel
- HTML meta tag insertions (T005, T006, T008, T009, T011) can run in parallel
- Validation tests (T014-T017) can run in parallel
- Jest tests (T018-T020) can run in parallel

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 2 (Foundational)
2. Complete Phase 3 (US1)
3. Validate Android installation

### Incremental Delivery
1. Phase 2 → Phase 3 (Android)
2. Phase 4 (iOS)
3. Phase 5 (Visual identity)
4. Phase 6 (Final validation)
5. Phase 7 (Automated tests)

### Notes
- Use assets from `specs/007-app-shell-pwa/contracts/pwa-contract.md`
- Verify all changes against `specs/007-app-shell-pwa/data-model.md`
- Run `npm run build:prod` for final PWA validation
- Service worker is explicitly out of scope for this phase — registration removed from main.js
- Constitution III (Test-First) requires Jest tests to pass before merge: `cd frontend && npm test`