# Feature Specification: App Shell e PWA

**Feature Branch**: `007-app-shell-pwa`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "Fase 7 — App Shell e PWA — Preparar a aplicação para ser instalada como PWA"

## Clarifications

### Session 2026-06-03

- Q1: A spec define SC-001 como "Lighthouse PWA score ≥ 80", mas a suposição exclui service worker. O foco deve ser instalação (instalável via meta tags + manifest) ou auditoria completa PWA? → A: App deve ser instalável na tela inicial (Android + iOS); meta tags + manifest suficientes, sem exigir service worker para esta fase
- Q2: O ícone da marca deve representar qual conceito visual? "Ícone que represente a marca" é vago. → A: Xícara de café estilizada, minimalista
- Q3: A cor primária da marca (theme-color) deve ser qual tom? → A: Laranja/âmbar (#FF8C00)

## User Scenarios & Testing

### User Story 1 - Instalar App na Tela Inicial (Priority: P1)

Um garçom ou administrador acessa o Quero Café Bar pelo Chrome Android e deseja adicionar o atalho à tela inicial para acesso rápido, como faria com qualquer app nativo.

**Why this priority**: A instalação na tela inicial é o principal benefício de uma PWA — permite acesso rápido, sensação de app nativo e maior engajamento da equipe.

**Independent Test**: Usuário acessa o app no Chrome Android, o banner "Adicionar à tela inicial" aparece, e o atalho é criado com nome e ícone corretos.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa o app no Chrome Android, **When** o navegador detecta o manifest.json válido, **Then** o banner de instalação "Adicionar à tela inicial" é exibido
2. **Given** que o usuário toca em "Adicionar à tela inicial", **When** o atalho é criado, **Then** o ícone e o nome do app aparecem corretamente na tela inicial
3. **Given** que o usuário toca no atalho recém-criado, **When** o app abre, **Then** a splash screen (definida pelo theme-color) aparece antes do carregamento completo

---

### User Story 2 - Experiência no iOS Safari (Priority: P2)

Um usuário acessa o Quero Café Bar pelo Safari no iPhone/iPad e adiciona o app à tela inicial, obtendo uma experiência semelhante a um app nativo com barra de status personalizada e ícone adequado.

**Why this priority**: iOS representa parcela significativa dos dispositivos mobile; sem as meta tags corretas, o ícone e a experiência no Safari ficam degradados.

**Independent Test**: Usuário adiciona o app à tela inicial pelo Safari iOS e o atalho exibe o ícone correto sem a barra de navegação do Safari.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa o app no Safari iOS, **When** ele toca em "Compartilhar" > "Adicionar à tela inicial", **Then** o ícone personalizado do app aparece na prévia
2. **Given** que o usuário abre o app pelo atalho da tela inicial, **Then** o app abre em tela cheia sem a barra de endereço do Safari
3. **Given** que o app abre em tela cheia no iOS, **Then** a barra de status usa a cor definida pelo theme-color

---

### User Story 3 - Identidade Visual Consistente (Priority: P3)

Um administrador acessa o app no navegador desktop e percebe que o favicon e a cor da aba refletem a marca do estabelecimento, não o ícone padrão do Vite.

**Why this priority**: A identidade visual reforça a credibilidade do sistema; o favicon padrão do Vite transmite a impressão de aplicação inacabada.

**Independent Test**: Usuário abre o app em qualquer navegador desktop e o favicon exibe o ícone da marca, não o SVG padrão do Vite.

**Acceptance Scenarios**:

1. **Given** que o usuário abre o app em qualquer navegador, **When** a página carrega, **Then** a aba exibe o favicon personalizado da marca
2. **Given** que o usuário abre o app, **When** a página carrega, **Then** a cor da aba (theme-color) corresponde à paleta definida

---

### Edge Cases

- O que acontece se o navegador não suportar PWA (IE, navegadores antigos)? — O app deve funcionar normalmente, apenas sem o banner de instalação
- O que acontece se o manifest.json não for encontrado (erro 404)? — O navegador não exibe o banner de instalação, mas o app continua funcional
- O que acontece se o ícone tiver resolução baixa? — A instalação pode falhar ou exibir um ícone borrado na tela inicial
- O que acontece se o código comentado em `main.js` não for removido? — Não afeta a execução, mas polui o bundle e o código-fonte

## Requirements

### Functional Requirements

- **FR-001**: A página principal DEVE incluir a meta tag `theme-color` com a cor laranja/âmbar (#FF8C00)
- **FR-002**: A página principal DEVE incluir a meta tag `apple-mobile-web-app-capable` para habilitar tela cheia no iOS
- **FR-003**: A página principal DEVE incluir o link `apple-touch-icon` apontando para um ícone de pelo menos 180x180px
- **FR-004**: O sistema DEVE disponibilizar um arquivo `manifest.json` com nome, ícones, tema e descrição do app
- **FR-005**: O favicon padrão do Vite DEVE ser substituído por um ícone de xícara de café estilizada, representando a marca
- **FR-006**: Código comentado sem utilidade DEVE ser removido do arquivo principal de entrada
- **FR-007**: O arquivo `manifest.json` DEVE ser referenciado via `<link rel="manifest">` no `<head>` da página

### Key Entities

- **Manifest JSON**: Arquivo de configuração PWA contendo nome curto, nome completo, ícones em múltiplas resoluções (192x192, 512x512), cor de tema, cor de fundo, display mode e descrição do app
- **Ícones de marca**: Ativos visuais (PNG/SVG) que representam o estabelecimento, utilizados como favicon, apple-touch-icon e ícones do PWA manifest em diferentes resoluções

## Success Criteria

### Measurable Outcomes

- **SC-001**: O app pode ser adicionado à tela inicial no Chrome Android e no Safari iOS com ícone e nome corretos
- **SC-002**: O app pode ser adicionado à tela inicial no Chrome Android (Android 8+) em menos de 2 cliques
- **SC-003**: Todas as meta tags obrigatórias (theme-color, apple-mobile-web-app-capable, apple-touch-icon) estão presentes e corretas no HTML, verificável via inspeção do DOM
- **SC-004**: O favicon personalizado é exibido na aba do navegador em Chrome, Firefox e Safari
- **SC-005**: O arquivo `manifest.json` é servido com Content-Type `application/json` e contém todos os campos obrigatórios (name, short_name, icons, start_url, display, theme_color, background_color)

## Assumptions

- O ícone da marca será gerado em formato SVG e convertido para PNG nas resoluções exigidas (192x192 e 512x512)
- A cor primária da marca é laranja/âmbar (#FF8C00), definida como theme-color e theme_color no manifest
- O manifest.json será servido estaticamente pela pasta `public/`, sem necessidade de geração dinâmica
- Navegadores que não suportam PWA continuarão exibindo o app normalmente, apenas sem os recursos de instalação
- O código comentado em `main.js` é residual de desenvolvimento e pode ser removido sem impacto funcional
- Service worker está explicitamente fora do escopo desta fase — o foco é apenas no App Shell (meta tags, manifest, ícones). A ausência de service worker impede o funcionamento offline e a auditoria completa de PWA do Lighthouse, mas não impede a instalação na tela inicial
