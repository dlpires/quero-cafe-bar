# Plano de Correção de Testes — Análise de Cobertura

> Gerado em: 26/06/2026
> Baseado nos relatórios de cobertura (LCOV/Istanbul) e análise dos commits recentes.

---

## Sumário Executivo

| Camada | Cobertura Atual | Alvo | Status |
|--------|----------------|------|--------|
| Backend (Geral) | 69.22% Stmts | ≥80% | 🟡 Gap |
| Frontend (Geral) | 10.31% Stmts | ≥70% | 🔴 Crítico |
| jwt-auth.guard.ts | 39.28% | 100% | 🚨 Novo arquivo |
| Frontend Pages | ~0% | ≥70% | 🔴 Falso negativo |

---

## 1. Backend (NestJS)

### 1.1 `jwt-auth.guard.spec.ts` — NOVO (🚨 Crítico)

**Arquivo**: `backend/src/common/guards/jwt-auth.guard.ts`
**Gap**: Nenhum teste existe. Guard principal de autenticação sem cobertura.
**Linhas descobertas**: 20-50 (token ausente, inválido, expirado; suporte a cookie)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, IS_PUBLIC_KEY } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import * as jwt from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockContext: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new JwtAuthGuard(mockReflector);
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir acesso quando rota é pública (isPublic = true)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('deve lançar UnauthorizedException quando token não é fornecido', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('deve autenticar via header Authorization (Happy Path)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, perfil: 0 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-valido' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith('token-valido', 'test-secret', {
      algorithms: ['HS256'],
    });
  });

  it('deve autenticar via cookie quando não há header (Happy Path)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, perfil: 0 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          cookies: { token: 'token-do-cookie' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith('token-do-cookie', 'test-secret', {
      algorithms: ['HS256'],
    });
  });

  it('deve lançar UnauthorizedException quando token é inválido/expirado', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-invalido' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('deve usar header como prioridade sobre cookie', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-header' },
          cookies: { token: 'token-cookie' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    guard.canActivate(mockContext);
    expect(jwt.verify).toHaveBeenCalledWith('token-header', expect.any(String), expect.any(Object));
  });
});
```

---

### 1.2 `usuario.service.spec.ts` — Auditoria e Permissões

**Arquivo**: `backend/src/modules/usuario/usuario.service.ts`
**Gap**: Novas linhas de auditoria (35, 45, 120-124, 133, 139-140, 146-151, 166, 178-191)
**Cobertura atual**: 72.97% Stmts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuarioService — Auditoria e Permissões', () => {
  let service: UsuarioService;
  let mockRepo: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    mockAudit = { log: jest.fn(), findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: mockRepo },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-senha');
  });

  describe('create() com auditoria', () => {
    it('deve registrar log de auditoria ao criar usuário com authenticatedUser', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({ id: 1, usuario: 'novo', perfil: 1 });

      const result = await service.create(
        { usuario: 'novo', senha: '123', perfil: 1 },
        { id: 99 },
      );

      expect(mockAudit.log).toHaveBeenCalledWith(
        99,
        'CREATE',
        'usuario',
        1,
        { usuario: 'novo', perfil: 1 },
      );
      expect(result.id).toBe(1);
    });

    it('deve criar sem auditoria quando não há authenticatedUser', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({ id: 2, usuario: 'anon', perfil: 0 });

      const result = await service.create(
        { usuario: 'anon', senha: '123', perfil: 0 },
      );

      expect(mockAudit.log).not.toHaveBeenCalled();
      expect(result.id).toBe(2);
    });
  });

  describe('update() com auto-proteção de perfil', () => {
    it('deve lançar ForbiddenException quando usuário não-admin tenta alterar próprio perfil', async () => {
      const updateDto = { perfil: 0 };
      await expect(
        service.update(1, updateDto, { id: 1, perfil: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir alteração de perfil quando admin altera outro usuário', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 2, usuario: 'outro', perfil: 1, senha: 'hash' });
      mockRepo.save.mockResolvedValue({ id: 2, usuario: 'outro', perfil: 0, senha: 'hash' });

      const result = await service.update(
        2,
        { perfil: 0 },
        { id: 1, perfil: 0 },
      );

      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalledWith(
        1,
        'UPDATE',
        'usuario',
        2,
        { previousPerfil: 1, newPerfil: 0 },
      );
    });

    it('deve atualizar senha com bcrypt quando fornecida', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, usuario: 'user', senha: 'hash-antigo' });
      mockRepo.save.mockResolvedValue({ id: 1, usuario: 'user', senha: 'hashed-senha' });

      await service.update(1, { senha: 'nova-senha' }, { id: 99, perfil: 0 });

      expect(bcrypt.hash).toHaveBeenCalledWith('nova-senha', 'salt');
    });
  });

  describe('remove() com auto-exclusão', () => {
    it('deve lançar ConflictException ao tentar excluir próprio usuário', async () => {
      await expect(service.remove(1, { id: 1 })).rejects.toThrow(ConflictException);
    });

    it('deve registrar auditoria ao excluir outro usuário', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 2, usuario: 'outro' });
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(2, { id: 1 });

      expect(mockAudit.log).toHaveBeenCalledWith(1, 'DELETE', 'usuario', 2, {
        usuario: 'outro',
      });
      expect(result).toEqual({ id: 2 });
    });
  });
});
```

---

### 1.3 `produto.service.spec.ts` — Casos de Borda

**Arquivo**: `backend/src/modules/produto/produto.service.ts`
**Gap**: Linhas 33, 38, 82, 89-93, 111
**Cobertura atual**: 75.51% Stmts

```typescript
describe('ProdutoService — Casos de Borda', () => {
  // Assumes existing describe block from original spec

  it('deve lançar NotFoundException ao atualizar produto inexistente', async () => {
    mockProdutoRepository.findOne.mockResolvedValue(null);
    await expect(
      service.update(999, { dsc_produto: 'Inexistente' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException ao deletar produto inexistente', async () => {
    mockProdutoRepository.findOne.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
```

---

### 1.4 `audit.service.spec.ts` — Cobertura de Branch

**Arquivo**: `backend/src/modules/audit/audit.service.ts`
**Gap**: Branch coverage em 0% (linhas 31-32: `findAll`)
**Cobertura atual**: 100% Stmts, 0% Branch

```typescript
describe('AuditService — Branch Coverage', () => {
  // Inside existing describe('AuditService')

  describe('findAll()', () => {
    it('deve usar valores padrão quando skip/take não são fornecidos', async () => {
      mockLogRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(mockLogRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('deve retornar lista vazia quando não há logs', async () => {
      mockLogRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
```

---

## 2. Frontend (Ionic + Vanilla JS)

### 2.1 `api.spec.js` — Novos Métodos

**Arquivo**: `frontend/src/services/api.js`
**Gap**: `getMe()` e `logout()` sem testes
**Cobertura atual**: 93.75% Stmts

```javascript
import { api } from './api.js';

describe('Api — Novos Métodos de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getMe()', () => {
    it('deve retornar dados do usuário logado (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ id: 1, usuario: 'admin', perfil: 0 }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await api.getMe();

      expect(result).toEqual({ id: 1, usuario: 'admin', perfil: 0 });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/me',
        expect.objectContaining({
          credentials: 'include',
        }),
      );
    });

    it('deve lançar erro quando não autenticado (401)', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Não autorizado' }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await expect(api.getMe()).rejects.toThrow('Sessão expirada');
    });
  });

  describe('logout()', () => {
    it('deve chamar endpoint de logout e limpar sessão', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Logout realizado' }),
      });

      const result = await api.logout();

      expect(result.message).toBe('Logout realizado');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/logout',
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      );
    });
  });
});
```

---

### 2.2 `util.spec.js` — Funções Async de Autenticação

**Arquivo**: `frontend/src/shared/util.js`
**Gap**: `getLoggedUser()`, `getLoggedUserId()`, `getLoggedUserProfile()` agora são async
**Cobertura atual**: 63.01% Stmts

```javascript
import { getLoggedUser, getLoggedUserId, getLoggedUserProfile, clearLoggedUserCache } from './util.js';
import { api } from '../services/api.js';

jest.mock('../services/api.js');

describe('Util — Funções Async de Autenticação', () => {
  beforeEach(() => {
    clearLoggedUserCache();
    jest.clearAllMocks();
  });

  describe('getLoggedUser()', () => {
    it('deve retornar usuário da API quando cache está vazio', async () => {
      api.getMe.mockResolvedValue({ id: 1, usuario: 'admin', perfil: 0 });

      const user = await getLoggedUser();

      expect(user).toEqual({ id: 1, usuario: 'admin', perfil: 0 });
      expect(api.getMe).toHaveBeenCalledTimes(1);
    });

    it('deve retornar usuário do cache quando disponível (sem chamar API)', async () => {
      api.getMe.mockResolvedValue({ id: 1, usuario: 'admin', perfil: 0 });
      await getLoggedUser(); // primeira chamada — popula cache
      api.getMe.mockClear();

      const user = await getLoggedUser(); // segunda chamada — usa cache

      expect(user).toEqual({ id: 1, usuario: 'admin', perfil: 0 });
      expect(api.getMe).not.toHaveBeenCalled();
    });

    it('deve retornar null quando API falha', async () => {
      api.getMe.mockRejectedValue(new Error('Network error'));

      const user = await getLoggedUser();

      expect(user).toBeNull();
    });

    it('deve limpar cache quando clearLoggedUserCache é chamado', async () => {
      api.getMe.mockResolvedValue({ id: 1 });
      await getLoggedUser();
      clearLoggedUserCache();
      api.getMe.mockClear();

      api.getMe.mockResolvedValue({ id: 2 });
      const user = await getLoggedUser();

      expect(user.id).toBe(2);
      expect(api.getMe).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLoggedUserId()', () => {
    it('deve retornar o ID do usuário', async () => {
      api.getMe.mockResolvedValue({ id: 42, usuario: 'test' });

      const id = await getLoggedUserId();

      expect(id).toBe(42);
    });

    it('deve retornar null quando getLoggedUser retorna null', async () => {
      api.getMe.mockRejectedValue(new Error('fail'));

      const id = await getLoggedUserId();

      expect(id).toBeNull();
    });
  });

  describe('getLoggedUserProfile()', () => {
    it('deve retornar o perfil do usuário', async () => {
      api.getMe.mockResolvedValue({ id: 1, perfil: 2 });

      const perfil = await getLoggedUserProfile();

      expect(perfil).toBe(2);
    });

    it('deve retornar null quando getLoggedUser retorna null', async () => {
      api.getMe.mockRejectedValue(new Error('fail'));

      const perfil = await getLoggedUserProfile();

      expect(perfil).toBeNull();
    });
  });
});
```

---

### 2.3 `util.spec.js` — `logout()` com API Assíncrona

**Arquivo**: `frontend/src/shared/util.js` (linha 311)
**Gap**: `logout()` agora chama `api.logout()` assincronamente via `import()`

```javascript
import { logout, clearLoggedUserCache } from './util.js';
import { api } from '../services/api.js';

jest.mock('../services/api.js');

describe('Util — logout()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<ion-router></ion-router>';
    jest.spyOn(document, 'querySelector').mockImplementation((sel) => {
      if (sel === 'ion-router') {
        return { push: jest.fn() };
      }
      return null;
    });
  });

  it('deve chamar api.logout() e limpar localStorage', async () => {
    api.logout.mockResolvedValue({ message: 'ok' });

    await logout();

    expect(api.logout).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
    expect(clearLoggedUserCache).toHaveBeenCalled();
  });

  it('deve navegar para /login após logout', async () => {
    api.logout.mockResolvedValue({ message: 'ok' });
    const mockRouter = { push: jest.fn() };
    document.querySelector = jest.fn((sel) => {
      if (sel === 'ion-router') return mockRouter;
      return null;
    });

    await logout();

    expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
  });
});
```

---

### 2.4 `Header.spec.js` — Injeção do Menu e Filtro por Perfil

**Arquivo**: `frontend/src/shared/Header.js`
**Gap**: Linhas 21-77 (`createAndInjectMenu` com `ion-nav` presente, filtro por perfil)
**Cobertura atual**: 36.36% Stmts

```javascript
import { createHeader } from './Header.js';
import { getLoggedUserProfile } from './util.js';

jest.mock('./util.js');

describe('Header — createAndInjectMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('deve injetar menu quando ion-nav existe', () => {
    const nav = document.createElement('ion-nav');
    document.body.appendChild(nav);

    createHeader('Produtos'); // dispara createAndInjectMenu internamente

    const menu = document.querySelector('ion-menu');
    expect(menu).not.toBeNull();
    expect(menu.contentId).toBe('main-content');
  });

  it('não deve criar menu duplicado', () => {
    document.body.innerHTML = '<ion-nav></ion-nav>';

    createHeader('Produtos');
    createHeader('Usuários'); // segunda chamada

    const menus = document.querySelectorAll('ion-menu');
    expect(menus.length).toBe(1);
  });

  it('deve exibir header sem botão de menu na página de Login', () => {
    const html = createHeader('Login');

    expect(html).not.toContain('ion-menu-button');
    expect(html).toContain('cafe');
    expect(html).not.toContain('log-out-outline');
  });

  it('deve exibir header com menu e logout em páginas não-Login', () => {
    const html = createHeader('Home');

    expect(html).toContain('ion-menu-button');
    expect(html).toContain('log-out-outline');
  });

  it('deve filtrar itens do menu baseado no perfil do usuário (admin vê tudo)', async () => {
    getLoggedUserProfile.mockResolvedValue(0);
    document.body.innerHTML = '<ion-nav id="main-content"></ion-nav>';

    createHeader('Home');
    const menuItems = document.querySelectorAll('.menu-item');

    expect(menuItems.length).toBe(6); // Todos os 6 itens
  });

  it('deve filtrar itens do menu para perfil 1 (Waiter)', () => {
    // Waiter: [0, 1] → home, comandas, cozinha
    localStorage.setItem('user_perfil', '1');
    document.body.innerHTML = '<ion-nav id="main-content"></ion-nav>';

    createHeader('Home');
    const menuItems = document.querySelectorAll('.menu-item');

    expect(menuItems.length).toBe(3);
    localStorage.removeItem('user_perfil');
  });

  it('deve mostrar todos os itens quando perfil não está definido', () => {
    localStorage.removeItem('user_perfil');
    document.body.innerHTML = '<ion-nav id="main-content"></ion-nav>';

    createHeader('Home');
    const menuItems = document.querySelectorAll('.menu-item');

    expect(menuItems.length).toBe(6);
  });
});
```

---

### 2.5 Page Specs — Ciclo de Vida Real

**Arquivo**: Todas as pages em `frontend/src/pages/*/`
**Gap**: Cobertura real de ~0%. Testes atuais mockam a instância sem executar `connectedCallback`.

> **Estratégia**: Para cada page, adicionar testes que:
> 1. Criem o custom element com `document.createElement` e o insiram no DOM
> 2. Verifiquem que `connectedCallback` disparou `loadPage`
> 3. Testem `renderItems` com dados mockados (verificando DOM via `createElement`/`textContent`)

```javascript
// Exemplo genérico — adaptar para cada page (ListProdutoPage, ListMesaPage, etc.)
import { api } from '../../services/api.js';

jest.mock('../../services/api.js');

describe('ListProdutoPage — Ciclo de Vida', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ion-app>
        <list-produto-page></list-produto-page>
      </ion-app>
    `;
    jest.clearAllMocks();
  });

  it('deve chamar loadPage ao ser inserido no DOM', async () => {
    api.getProdutos.mockResolvedValue({ data: [], total: 0 });

    const page = document.querySelector('list-produto-page');
    // connectedCallback é chamado automaticamente pelo Custom Elements registry

    // Aguarda microtasks (promises do connectedCallback)
    await new Promise(process.nextTick);

    expect(api.getProdutos).toHaveBeenCalled();
  });

  it('deve renderizar produtos usando createElement (sem innerHTML)', async () => {
    const produtos = [
      { id: 1, dsc_produto: 'Café Expresso', valor_unit: 5.0, status: true },
      { id: 2, dsc_produto: 'Pão de Queijo', valor_unit: 3.5, status: false },
    ];
    api.getProdutos.mockResolvedValue({ data: produtos, total: 2 });

    const page = document.querySelector('list-produto-page');
    await new Promise(process.nextTick);

    const itens = page.querySelectorAll('ion-item');
    expect(itens.length).toBe(2);
    expect(itens[0].textContent).toContain('Café Expresso');
    expect(itens[0].innerHTML).not.toContain('onerror='); // XSS check
  });

  it('deve mostrar estado vazio quando não há produtos', async () => {
    api.getProdutos.mockResolvedValue({ data: [], total: 0 });

    const page = document.querySelector('list-produto-page');
    await new Promise(process.nextTick);

    const emptyState = page.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
  });

  it('deve tratar erro de API com toast', async () => {
    api.getProdutos.mockRejectedValue(new Error('Erro de rede'));

    const page = document.querySelector('list-produto-page');
    await new Promise(process.nextTick);

    const toast = document.querySelector('ion-toast');
    expect(toast).not.toBeNull();
    expect(toast.color).toBe('danger');
  });
});
```

> ⚠️ **Nota**: A página `LoginPage.js` possui cobertura de 5.55% — os testes estão mais próximos do ciclo real. Replicar a mesma abordagem para as demais pages.

---

## 3. Resumo de Prioridades

| # | Arquivo | Esforço | Impacto | Prioridade |
|---|---------|---------|---------|------------|
| 1 | `jwt-auth.guard.spec.ts` (novo) | 🟢 Médio | 🔴 Segurança | **P0** |
| 2 | `usuario.service.spec.ts` | 🟢 Médio | 🟡 Negócio | **P1** |
| 3 | Frontend Pages specs | 🔴 Alto | 🔴 Cobertura | **P1** |
| 4 | `api.spec.js` | 🟢 Baixo | 🟡 Novos métodos | **P2** |
| 5 | `util.spec.js` | 🟢 Baixo | 🟡 Async | **P2** |
| 6 | `Header.spec.js` | 🟢 Baixo | 🟡 Menu/Perfil | **P2** |
| 7 | `produto.service.spec.ts` | 🟢 Baixo | 🟢 Borda | **P3** |
| 8 | `audit.service.spec.ts` | 🟢 Baixo | 🟢 Branch | **P3** |

---

## 4. Problemas Estruturais Identificados

### 4.1 Header.js ainda usa `innerHTML` (XSS residual)
**Arquivo**: `frontend/src/shared/Header.js:46-62`
**Problema**: A renderização dos itens do menu usa template string com `innerHTML`. Embora os labels sejam hardcoded, o padrão é inconsistente com as correções de XSS aplicadas nos commits recentes.
**Sugestão**: Refatorar para usar `createElement` + `textContent` + `appendChild`, similar ao que foi feito em `ListProdutoPage.js`, `ListMesaPage.js`, etc.

### 4.2 util.js `createEmptyState` ainda usa `innerHTML`
**Arquivo**: `frontend/src/shared/util.js:50`
**Problema**: Usa `innerHTML` com template hardcoded. Embora não haja injeção de dados do usuário, o padrão deve ser consistente.
**Sugestão**: Substituir por DOM API.

### 4.3 Cache `_cachedUser` sem TTL
**Arquivo**: `frontend/src/shared/util.js:87-112`
**Problema**: `getLoggedUser()` faz cache indefinidamente. Se um admin alterar o perfil de outro usuário em outra aba, o cache só é limpo no logout.
**Sugestão**: Adicionar timestamp de expiração (ex: 5 minutos) ou escutar eventos `BroadcastChannel` para invalidar cache.

### 4.4 `user_perfil` residual no localStorage
**Arquivo**: `frontend/src/shared/util.js:316`
**Problema**: `logout()` ainda remove `user_perfil`, mas essa chave não é mais escrita em lugar nenhum desde a migração para `logged_in`.
**Sugestão**: Remover a linha ou garantir que `user_perfil` seja atualizado com `getMe()` no login.

---

## 5. Métricas Alvo

| Métrica | Atual | Alvo |
|---------|-------|------|
| Backend Statements | 69.22% | ≥85% |
| Backend Branches | 40.42% | ≥70% |
| Backend Functions | 65.46% | ≥85% |
| Frontend Statements | 10.31% | ≥70% |
| Frontend Branches | 19.82% | ≥60% |
| Frontend Functions | 19.19% | ≥65% |
