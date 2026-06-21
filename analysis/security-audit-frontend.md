# Relatório de Auditoria de Segurança (SAST) — Frontend Ionic

**Data:** 20/06/2026  
**Escopo:** `frontend/` (Ionic 8.x + Vanilla JS + Vite 7.x)  
**Tipo:** Análise Estática de Segurança

---

## Resumo Executivo

| Severidade | Quantidade |
|------------|-----------|
| **Crítica** | 1 |
| **Alta** | 1 |
| **Média** | 2 |
| **Baixa** | 4 |
| **Total** | **8** |

---

## 🔴 Críticas

### C-01: Vulnerabilidade Generalizada a Cross-Site Scripting (XSS) via `innerHTML`

| Campo | Detalhe |
|-------|---------|
| **Localização** | Praticamente todas as páginas: `HomePage.js`, `ListProdutoPage.js`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js` e `Header.js` |
| **Arquivos** | `src/pages/**/*.js`, `src/shared/Header.js`, `src/shared/util.js` |

**Descrição:** A aplicação utiliza a propriedade `innerHTML` para renderizar dados dinâmicos retornados pela API (como nomes de usuários, descrições de produtos e observações de comandas). Como não há sanitização desses dados no frontend, um atacante pode cadastrar um registro com um payload malicioso (ex: `<img src=x onerror=alert('XSS')>`). Quando outro usuário (como o Administrador) visualizar esse registro, o script será executado automaticamente.

**Sugestão de Correção:**
Substituir o uso de `innerHTML` por `textContent` para campos de texto, ou utilizar a criação de elementos via DOM (`document.createElement`). Para casos onde HTML é necessário, utilizar uma biblioteca de sanitização como `DOMPurify`.

```javascript
// Exemplo Inseguro (ListProdutoPage.js):
// container.innerHTML = `<ion-list>${itemsHtml}</ion-list>`;
// onde itemsHtml contém ${produto.dsc_produto}

// Exemplo Seguro:
const item = document.createElement('ion-item');
const label = document.createElement('ion-label');
const title = document.createElement('h2');
title.textContent = produto.dsc_produto; // Seguro: não interpreta HTML
label.appendChild(title);
item.appendChild(label);
container.appendChild(item);
```

---

## 🟠 Altas

### A-01: Armazenamento Inseguro de JWT no `localStorage`

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/services/api.js:21, 31, 67`, `src/services/auth.js:2, 14`, `src/main.js:55` |
| **Arquivos** | `api.js`, `auth.js`, `main.js` |

**Descrição:** O token JWT é armazenado no `localStorage`, que é acessível por qualquer script JavaScript executado na mesma origem. Combinado com a vulnerabilidade de XSS (C-01), um atacante pode facilmente roubar o token de autenticação do usuário via `localStorage.getItem('token')` e enviá-lo para um servidor externo, resultando em sequestro de sessão completo.

**Sugestão de Correção:**
Armazenar o token em um cookie com as flags `HttpOnly`, `Secure` e `SameSite=Strict`. Isso impede que o JavaScript do frontend acesse o token, mitigando o roubo via XSS.

```javascript
// No Backend (NestJS), ao fazer o login:
res.cookie('token', token, {
  httpOnly: true,
  secure: true, // Apenas HTTPS
  sameSite: 'Strict',
  maxAge: 2 * 60 * 60 * 1000 // 2 horas
});
```

---

## 🟡 Médias

### M-01: Decodificação de JWT sem Verificação de Integridade

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/shared/util.js:93, 104` |
| **Arquivos** | `util.js` |

**Descrição:** As funções `getLoggedUserId()` e `getLoggedUserProfile()` utilizam `atob()` para decodificar o payload do JWT. O `atob()` apenas decodifica a string Base64, **não verifica a assinatura** do token. Um usuário mal-intencionado pode alterar o payload do token localmente (ex: mudar seu perfil de `1` para `0`) e o frontend passará a exibir menus de administrador, embora as requisições à API ainda sejam validadas no backend.

**Sugestão de Correção:**
Embora a validação final ocorra no backend, para evitar inconsistências de UI, o frontend deve tratar as informações do token apenas como "sugestões" e validar as permissões via API ao carregar a página.

---

### M-02: Ausência de Content Security Policy (CSP)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `index.html` |
| **Arquivos** | `index.html` |

**Descrição:** O arquivo `index.html` não define nenhuma política de segurança de conteúdo (CSP). A ausência de CSP facilita a exploração de vulnerabilidades XSS, permitindo que o navegador execute scripts de domínios não autorizados ou execute scripts inline maliciosos.

**Sugestão de Correção:**
Adicionar uma meta tag CSP no `index.html` para restringir a origem de scripts, estilos e conexões.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://detailed-krysten-unconformable.ngrok-free.dev;">
```

---

## 🟢 Baixas

### B-01: Exposição de URL de Desenvolvimento em Configuração de Produção

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/environments/environment.prod.js:9`, `capacitor.config.json:7` |
| **Arquivos** | `environment.prod.js`, `capacitor.config.json` |

**Descrição:** A URL do `ngrok` está hardcoded no ambiente de produção e permitida no config do Capacitor. Embora seja comum em fases de teste, manter URLs de túneis temporários em arquivos de configuração de produção é uma má prática.

**Sugestão de Correção:**
Utilizar variáveis de ambiente reais no build de produção (`.env.production`) e remover wildcards como `*.ngrok-free.dev` do `allowNavigation` em produção.

---

### B-02: Dependências Obsoletas (`sharp`)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `package.json:22` |
| **Arquivos** | `package.json` |

**Descrição:** A dependência `sharp` está na versão `^0.35.1`. Versões antigas de bibliotecas de processamento de imagem frequentemente possuem vulnerabilidades de buffer overflow ou DoS.

**Sugestão de Correção:**
Executar `npm update sharp` ou `npm audit fix` para atualizar para a versão mais recente e estável.

---

### B-03: Route Guard Baseado Apenas em Existência de Token

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/main.js:55` |
| **Arquivos** | `main.js` |

**Descrição:** O guard de rota verifica apenas se o token existe no `localStorage`. Ele não valida se o token está expirado. Isso pode causar uma experiência de usuário ruim onde o usuário acessa a página, mas todas as ações resultam em erro 401.

**Sugestão de Correção:**
Implementar uma função que decodifique a data de expiração (`exp`) do JWT e redirecione para o login caso o token já tenha expirado.

---

### B-04: Service Worker com Cache de API Sem Invalidação Rigorosa

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/sw.js:37-40` |
| **Arquivos** | `sw.js` |

**Descrição:** O Service Worker implementa `networkFirst` para a API, mas armazena as respostas no `STATIC_CACHE`. Sem uma estratégia de versionamento de cache para dados dinâmicos, o usuário pode visualizar dados obsoletos se a rede falhar.

**Sugestão de Correção:**
Utilizar caches separados para ativos estáticos e dados da API, implementando uma estratégia de expiração (TTL) para as respostas da API.

---

## Checklist de Conformidade

| Requisito | Status | Observação |
|-----------|--------|------------|
| Proteção contra XSS (`innerHTML`) | ❌ **Falha** | Uso generalizado de `innerHTML` com dados da API |
| Armazenamento Seguro de Tokens | ❌ **Falha** | Uso de `localStorage` (Suscetível a XSS) |
| Validação de Integridade de JWT | ❌ **Falha** | Usa `atob()` sem verificar assinatura |
| Presença de CSP | ❌ **Falha** | Não configurado no `index.html` |
| Gestão de Secrets em Produção | ⚠️ **Alerta** | URLs de ngrok hardcoded no config de prod |
| Dependências Atualizadas | ⚠️ **Alerta** | `sharp` desatualizado |
| Proteção de Rotas (Client-side) | ✅ **Parcial** | Verifica existência de token, mas não expiração |
| Tratamento de Erros de API | ✅ **Ok** | Implementado corretamente via `api.js` |

---

## Pontos Fortes Identificados

- **Gestão de Timeout**: Uso excelente de `AbortController` em `api.js` para evitar requisições pendentes infinitas.
- **UX de Feedback**: Implementação consistente de `ion-loading` e `ion-toast` para informar o usuário sobre operações assíncronas.
- **Performance**: Implementação de `perfMeasureAsync` para monitorar gargalos de carregamento de páginas.
- **Sincronização de Sessão**: Uso do evento `storage` para sincronizar o logout entre múltiplas abas do navegador.

## Ação Prioritária Recomendada

**Imediata: Eliminar o uso de `innerHTML` para renderizar dados da API.**
Esta é a vulnerabilidade mais crítica, pois abre a porta para todas as outras (incluindo o roubo de tokens no `localStorage`). A migração para `textContent` ou sanitização via `DOMPurify` deve ser a prioridade zero da equipe de desenvolvimento.
