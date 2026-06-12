# Tasks: App Shell e PWA

**Input**: Design documents from `/specs/007-app-shell-pwa/`

## Path Conventions
- **Frontend**: `frontend/` directory
- **Static assets**: `frontend/public/`
- **Entry file**: `frontend/index.html`

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T001 Create icons directory: `frontend/public/icons/`
- [ ] T002 [P] Add icon-192x192.png to `frontend/public/icons/`
- [ ] T003 [P] Add icon-512x512.png to `frontend/public/icons/`
- [ ] T004 [P] Add icon-180x180.png to `frontend/public/icons/`
- [ ] T005 [P] Add icon-32x32.png to `frontend/public/` (favicon)
- [ ] T006 Create manifest.json in `frontend/public/manifest.json`
- [ ] T007 Update HTML head in `frontend/index.html` with meta tags

## Phase 3: User Story 1 - Install on Android Home Screen (Priority: P1) 🎯 MVP

**Goal**: Enable "Add to Home Screen" in Chrome Android
**Independent Test**: Verify installation banner appears and creates shortcut

- [ ] T008 [US1] Add theme-color meta tag to `frontend/index.html`
- [ ] T009 [US1] Add manifest link to `frontend/index.html`
- [ ] T010 [US1] Verify manifest loads at http://localhost:5173/manifest.json

## Phase 4: User Story 2 - iOS Safari Experience (Priority: P2)

**Goal**: Fullscreen PWA experience on iOS
**Independent Test**: Add to home screen via Safari share menu

- [ ] T011 [US2] Add apple-mobile-web-app-capable meta tag to `frontend/index.html`
- [ ] T012 [US2] Add apple-touch-icon link to `frontend/index.html`
- [ ] T013 [US2] Verify fullscreen mode on iOS simulator

## Phase 5: User Story 3 - Visual Identity (Priority: P3)

**Goal**: Consistent branding across platforms
**Independent Test**: Verify favicon and theme color in desktop browsers

- [ ] T014 [US3] Update favicon link in `frontend/index.html`
- [ ] T015 [US3] Remove commented code in `frontend/src/main.js`
- [ ] T016 [US3] Verify favicon in Chrome/Firefox/Safari

## Phase 6: Polish & Validation

- [ ] T017 Run quickstart tests from `specs/007-app-shell-pwa/quickstart.md`
- [ ] T018 Verify all requirements in `specs/007-app-shell-pwa/spec.md`
- [ ] T019 Test on Android device
- [ ] T020 Test on iOS device

## Dependencies & Execution Order

### Phase Dependencies
- **Foundational (Phase 2)**: Must complete before user stories
- **User Stories (Phase 3-5)**: Can be implemented in parallel after Phase 2
- **Polish (Phase 6)**: Requires all user stories complete

### Task Dependencies
1. T001-T006 must complete before T008-T016
2. T007 must complete before T010
3. T011-T012 must complete before T013

### Parallel Opportunities
- Icon creation (T002-T004) can run in parallel
- HTML updates (T008, T011, T014) can run in parallel
- Validation tests (T017-T020) can run in parallel

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

### Notes
- Use assets from `specs/007-app-shell-pwa/contracts/pwa-contract.md`
- Verify all changes against `specs/007-app-shell-pwa/data-model.md`
- Run `npm run build:prod` for final PWA validation