# Quickstart: Responsividade com Media Queries

## Pré-requisitos

- Fase 3 (Layout e Espaçamento Mobile) concluída
- Branch: `development`
- Frontend rodando: `cd frontend && npm run dev`

## Breakpoints

| Nome | Valor | Dispositivo |
|------|-------|-------------|
| XS | ≤360px | Smartphones pequenos |
| SM | 361-767px | Smartphones médios (padrão) |
| MD | ≥768px | Tablets |
| LG | ≥1024px | Desktops |
| XL | ≥1400px | Ultra-wide |

> **Nota**: Usar `min-width` (mobile-first) exceto para XS que usa `max-width`.

## Arquivos para Modificar

### 1. HomePage.css — Grid da Cozinha (RF-R01)

Adicionar ao final do arquivo:

```css
@media (max-width: 360px) {
  .comandas-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .comandas-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .comandas-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .comandas-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 2. LoginPage.css — Login Responsivo (RF-R02)

```css
@media (min-width: 1024px) {
  .login-container {
    max-width: 400px;
    margin: 0 auto;
  }
}
```

### 3. Listagens CRUD (RF-R03)

Adicionar a cada list page CSS (ListProdutoPage.css, ListUsuarioPage.css, ListMesaPage.css, ListComandaPage.css):

```css
@media (min-width: 768px) {
  .list-produto-container { /* ajustar seletor por página */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1024px) {
  .list-produto-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .list-produto-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 4. Formulários CRUD (RF-R04)

Adicionar a cada form page CSS (RegProdutoPage.css, RegUsuarioPage.css, RegMesaPage.css, RegComandaPage.css e Updates):

```css
@media (min-width: 768px) {
  ion-content.ion-padding form {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

> **Nota**: Usar `ion-content.ion-padding form` — **não** aplicar `max-width` diretamente no `ion-content.ion-padding`, pois isso restringiria o componente inteiro. O selector `form` dentro do `ion-content` existe em todas as 8 páginas de formulário com os IDs `form-produto`, `form-usuario`, `form-mesa`, `form-comanda`.

## Testes

```bash
# Testes unitários Jest
cd frontend && npm test

# Verificação manual - redimensionar browser para:
# 320px, 375px, 414px, 768px, 1024px, 1400px
```

## Checklist de Verificação

- [ ] HomePage: 1 coluna em ≤360px
- [ ] HomePage: 2 colunas em ≥768px
- [ ] HomePage: 3 colunas em ≥1024px
- [ ] HomePage: 4 colunas em ≥1400px
- [ ] Login: max-width 400px centralizado em ≥1024px
- [ ] ListProdutoPage: grid 2/3/4 colunas
- [ ] ListUsuarioPage: grid 2/3/4 colunas
- [ ] ListMesaPage: grid 2/3/4 colunas
- [ ] ListComandaPage: grid 2/3/4 colunas
- [ ] Reg/Update pages: max-width 600px centralizado em ≥768px
- [ ] Nenhum overflow horizontal nos 5 breakpoints
- [ ] npm test passa sem regressões
