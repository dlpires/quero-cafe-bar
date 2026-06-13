# Data Model: App Shell e PWA

## Static Assets
1. `manifest.json`
   - Fields: name, short_name, icons[], start_url, display, theme_color, background_color
2. `favicon.ico` - 32x32
3. `icons/` directory
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `icon-180x180.png` (iOS)

## HTML Modifications
- index.html
  - Add: `<link rel="manifest" href="/manifest.json">`
  - Add: `<meta name="theme-color" content="#FF8C00">`
  - Add: `<meta name="apple-mobile-web-app-capable" content="yes">`
  - Add: `<link rel="apple-touch-icon" href="/icons/icon-180x180.png">`
  - Update: favicon link