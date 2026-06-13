# Research: App Shell e PWA

## Decision: Manifest Implementation
- Use static manifest.json in public folder
- Required fields: name, short_name, icons, start_url, display, theme_color

## Decision: Icon Implementation
- SVG coffee cup icon converted to PNG
- Sizes: 192x192, 512x512
- Apple touch icon: 180x180 PNG

## Decision: Meta Tags
- `theme-color`: #FF8C00
- `apple-mobile-web-app-capable`: "yes"
- `apple-touch-icon`: "/icons/icon-180x180.png"

## Alternatives Considered
- Service worker: Rejected as not required for basic installability
- Dynamic manifest: Rejected due to added complexity with no benefit