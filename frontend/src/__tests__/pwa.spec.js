import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = process.cwd();

describe('PWA - Manifest JSON (T018)', () => {
  const manifestPath = resolve(ROOT, 'public/manifest.json');
  let manifest;

  beforeAll(() => {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  });

  it('deve ter o campo name', () => {
    expect(manifest.name).toBe('Quero Café Bar');
  });

  it('deve ter o campo short_name', () => {
    expect(manifest.short_name).toBe('QueroCafe');
  });

  it('deve ter icons como array com 2 ícones', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBe(2);
  });

  it('deve ter ícone 192x192', () => {
    const icon192 = manifest.icons.find(i => i.sizes === '192x192');
    expect(icon192).toBeTruthy();
    expect(icon192.src).toBe('/icons/icon-192x192.png');
    expect(icon192.type).toBe('image/png');
  });

  it('deve ter ícone 512x512', () => {
    const icon512 = manifest.icons.find(i => i.sizes === '512x512');
    expect(icon512).toBeTruthy();
    expect(icon512.src).toBe('/icons/icon-512x512.png');
    expect(icon512.type).toBe('image/png');
  });

  it('deve ter start_url como "/"', () => {
    expect(manifest.start_url).toBe('/');
  });

  it('deve ter display como "standalone"', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('deve ter theme_color como #FF8C00', () => {
    expect(manifest.theme_color).toBe('#FF8C00');
  });

  it('deve ter background_color como #FFFFFF', () => {
    expect(manifest.background_color).toBe('#FFFFFF');
  });
});

describe('PWA - Meta Tags no HTML (T019)', () => {
  const htmlPath = resolve(ROOT, 'index.html');
  let html;

  beforeAll(() => {
    html = readFileSync(htmlPath, 'utf-8');
  });

  it('deve conter theme-color meta tag com #FF8C00', () => {
    expect(html).toContain('<meta name="theme-color" content="#FF8C00">');
  });

  it('deve conter manifest link tag', () => {
    expect(html).toContain('<link rel="manifest" href="/manifest.json">');
  });

  it('deve conter apple-mobile-web-app-capable meta tag', () => {
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');
  });

  it('deve conter apple-touch-icon link tag', () => {
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/icon-180x180.png">');
  });

  it('deve conter favicon link tag', () => {
    expect(html).toContain('<link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png">');
  });
});

describe('PWA - Favicon e Ícones (T020)', () => {
  it('deve existir o arquivo favicon icon-32x32.png', () => {
    expect(existsSync(resolve(ROOT, 'public/icon-32x32.png'))).toBe(true);
  });

  it('deve existir o arquivo icon-192x192.png', () => {
    expect(existsSync(resolve(ROOT, 'public/icons/icon-192x192.png'))).toBe(true);
  });

  it('deve existir o arquivo icon-512x512.png', () => {
    expect(existsSync(resolve(ROOT, 'public/icons/icon-512x512.png'))).toBe(true);
  });

  it('deve existir o arquivo icon-180x180.png', () => {
    expect(existsSync(resolve(ROOT, 'public/icons/icon-180x180.png'))).toBe(true);
  });

  it('deve existir o arquivo SVG da xícara de café', () => {
    expect(existsSync(resolve(ROOT, 'public/icons/coffee-cup.svg'))).toBe(true);
  });
});
