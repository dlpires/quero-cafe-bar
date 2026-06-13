# Implementation Plan: App Shell e PWA

**Branch**: `007-app-shell-pwa` | **Date**: 2026-06-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-app-shell-pwa/spec.md`

## Summary
Implement PWA features to allow installation on home screen for Android and iOS. This involves adding manifest.json, meta tags, custom icons, and cleaning up commented code.

## Technical Context

**Language/Version**: JavaScript (ES6)

**Primary Dependencies**: Ionic 8.x, Vite 7.x, Capacitor 8.x

**Storage**: Static assets (public folder)

**Testing**: Jest (frontend tests)

**Target Platform**: PWA (Chrome Android + Safari iOS)

**Project Type**: Web application (PWA)

**Performance Goals**: App instalável via meta tags + manifest (sem service worker)

**Constraints**: Must work on iOS Safari without service worker

**Scale/Scope**: Single-page application

## Constitution Check

1. **API-First** — PASS (No API changes)
2. **Modular Architecture** — PASS (Changes confined to frontend)
3. **Test-First** — PARTIAL (Manual tests defined in quickstart.md)
4. **Full-Stack Consistency** — PASS (No backend changes)
5. **Security & Observability** — PASS (No security impact)

## Project Structure

```text
frontend/
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192x192.png
│       ├── icon-512x512.png
│       └── icon-180x180.png
├── src/
│   └── main.js
└── tests/
```

**Structure Decision**: Existing frontend structure maintained with PWA assets in public folder
