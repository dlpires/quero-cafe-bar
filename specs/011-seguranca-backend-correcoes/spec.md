# Feature Specification: Correções de Segurança no Backend

**Feature Branch**: `011-seguranca-backend-correcoes`

**Created**: 18/06/2026

**Status**: Draft

**Input**: Ações prioritárias do relatório de auditoria de segurança (SAST) do backend NestJS: implementar guards JWT, substituir EncryptionTransformer por bcrypt, remover fallbacks de secrets, adicionar rate limiting no login, restringir CORS.

## User Scenarios & Testing

### User Story 1 - Administrador gerencia o sistema com segurança (Priority: P1)

Como administrador do sistema, quero que todas as rotas da API exijam autenticação JWT válida, para que apenas usuários autorizados possam acessar ou modificar dados.

**Por que esta prioridade**: Sem autenticação, qualquer pessoa pode criar, ler, atualizar ou deletar qualquer recurso — comprometendo totalmente a segurança dos dados.

**Teste Independente**: Pode ser testado enviando requisições para qualquer rota protegida sem token JWT e verificando retorno 401 Unauthorized.

**Cenários de Aceitação**:

1. **Dado** que um cliente não autenticado, **Quando** faz uma requisição GET para qualquer rota da API (exceto login), **Então** o sistema retorna status 401 Unauthorized com mensagem "Token não fornecido"
2. **Dado** que um cliente possui um token JWT expirado, **Quando** faz uma requisição para qualquer rota protegida, **Então** o sistema retorna status 401 Unauthorized com mensagem "Token inválido ou expirado"
3. **Dado** que um cliente possui um token JWT válido, **Quando** faz uma requisição para qualquer rota protegida, **Então** o sistema processa a requisição normalmente e retorna os dados solicitados
4. **Dado** que um cliente possui um token JWT forjado ou com algoritmo inválido, **Quando** faz uma requisição para qualquer rota protegida, **Então** o sistema retorna status 401 Unauthorized

---

### User Story 2 - Usuário tem senha armazenada com segurança (Priority: P1)

Como usuário do sistema, quero que minha senha seja armazenada de forma irreversível (hash), para que mesmo que o banco de dados seja comprometido, minha senha original não possa ser recuperada.

**Por que esta prioridade**: Senhas armazenadas com criptografia reversível (AES) podem ser descriptografadas por qualquer pessoa com acesso à chave, expondo todas as credenciais.

**Teste Independente**: Pode ser testado verificando que a coluna `senha` no banco contém hashes (bcrypt) em vez de texto cifrado AES, e que o fluxo de login e criação de usuário funciona corretamente.

**Cenários de Aceitação**:

1. **Dado** que um administrador cria um novo usuário com uma senha, **Quando** a senha é armazenada no banco de dados, **Então** o valor armazenado é um hash bcrypt (começa com `$2b$`) e não o texto original nem texto cifrado AES
2. **Dado** que um usuário tenta fazer login com senha correta, **Quando** o sistema compara a senha fornecida com o hash armazenado, **Então** o sistema autentica o usuário com sucesso
3. **Dado** que um usuário tenta fazer login com senha incorreta, **Quando** o sistema compara a senha fornecida com o hash armazenado, **Então** o sistema retorna erro de credenciais inválidas
4. **Dado** que o banco de dados é comprometido, **Quando** um atacante obtém os valores da coluna `senha`, **Então** os valores são hashes bcrypt que não podem ser revertidos para senhas originais

---

### User Story 3 - Sistema valida ambiente no startup (Priority: P2)

Como desenvolvedor responsável pela implantação, quero que o sistema valide todas as variáveis de ambiente críticas ao iniciar, falhando com erro claro se alguma estiver ausente.

**Por que esta prioridade**: A validação no startup (fail-fast) evita que a aplicação rode em um estado inseguro com configurações ausentes, que poderiam causar falhas inesperadas em produção.

**Teste Independente**: Pode ser testado iniciando a aplicação sem definir `JWT_SECRET` no ambiente e verificando se o processo aborta com mensagem de erro clara.

**Cenários de Aceitação**:

1. **Dado** que a variável de ambiente `JWT_SECRET` não está configurada, **Quando** a aplicação inicia, **Então** o sistema aborta com uma mensagem de erro clara indicando que `JWT_SECRET` é obrigatório
2. **Dado** que a variável de ambiente `JWT_SECRET` está configurada e todas as demais variáveis obrigatórias estão presentes, **Quando** a aplicação inicia, **Então** o sistema inicializa normalmente sem erros de configuração

---

### User Story 4 - Sistema protege contra ataques de força bruta no login (Priority: P2)

Como administrador do sistema, quero que o endpoint de login tenha proteção contra força bruta, para que um atacante não consiga testar múltiplas senhas em sequência.

**Por que esta prioridade**: Sem rate limiting, um atacante pode realizar milhares de tentativas de login por minuto, aumentando a chance de quebrar senhas fracas.

**Teste Independente**: Pode ser testado enviando mais de 10 requisições de login em menos de 1 minuto e verificando se requisições excedentes são bloqueadas.

**Cenários de Aceitação**:

1. **Dado** que um cliente enra mais de 10 requisições para o endpoint de login em menos de 1 minuto, **Quando** a 11ª requisição é feita, **Então** o sistema retorna status HTTP 429 (Too Many Requests) com mensagem indicando limite excedido
2. **Dado** que um cliente excedeu o limite de requisições, **Quando** ele aguarda 1 minuto e faz uma nova tentativa, **Então** o sistema processa a requisição normalmente
3. **Dado** que um cliente realiza requisições dentro do limite de 10 por minuto, **Quando** ele faz login com credenciais válidas, **Então** o sistema autentica o usuário normalmente

---

### User Story 5 - Sistema restringe origens CORS em produção (Priority: P3)

Como responsável pela segurança, quero que a API aceite requisições apenas de origens conhecidas em produção, para evitar ataques CSRF e vazamento de dados para domínios maliciosos.

**Por que esta prioridade**: CORS aberto (`*`) combinado com endpoints sem autenticação permite que qualquer site interaja com a API como se fosse o frontend legítimo.

**Teste Independente**: Pode ser testado fazendo uma requisição de um domínio não autorizado e verificando se o servidor rejeita a origem.

**Cenários de Aceitação**:

1. **Dado** que a aplicação está em produção e `CORS_ORIGIN` está configurado com uma lista de origens permitidas, **Quando** uma requisição chega de uma origem não listada, **Então** o servidor rejeita a requisição com erro CORS
2. **Dado** que a aplicação está em produção e `CORS_ORIGIN` está configurado, **Quando** uma requisição chega de uma origem listada, **Então** o servidor aceita a requisição normalmente
3. **Dado** que a aplicação está em desenvolvimento, **Quando** uma requisição chega de `http://localhost:5173`, **Então** o servidor aceita a requisição normalmente

---

---

### User Story 6 - Sistema cria administrador padrão na primeira inicialização (Priority: P1)

Como desenvolvedor responsável pela implantação, quero que o sistema crie automaticamente um usuário administrador padrão na primeira execução pós-migration, para que seja possível acessar o sistema mesmo com a proteção JWT ativa em todas as rotas.

**Por que esta prioridade**: Sem um seed inicial, o sistema fica inacessível após a migração — todas as rotas exigem token JWT mas não há como criar o primeiro usuário sem já estar autenticado.

**Teste Independente**: Pode ser testado configurando `SEED_ADMIN=true` no `.env`, iniciando a aplicação com banco vazio, e verificando que é possível fazer login com `admin`/`admin`.

**Cenários de Aceitação**:

1. **Dado** que o banco de dados não possui nenhum usuário com perfil administrador e `SEED_ADMIN=true`, **Quando** a aplicação inicia, **Então** o sistema cria automaticamente um usuário `admin` com senha `admin` e perfil 0 (Administrador)
2. **Dado** que a aplicação foi inicializada e o administrador padrão já foi criado, **Quando** a aplicação reinicia com `SEED_ADMIN=true`, **Então** o sistema não cria um novo usuário duplicado
3. **Dado** que a variável de ambiente `SEED_ADMIN` não está definida ou é diferente de `true`, **Quando** a aplicação inicia, **Então** o sistema não executa o seed automático
4. **Dado** que o administrador padrão foi criado, **Quando** um cliente faz login com `admin`/`admin` no endpoint `POST /usuario/login`, **Então** o sistema retorna um token JWT válido

---

### Edge Cases

- O que acontece quando o serviço tenta iniciar sem `JWT_SECRET` configurado? O sistema deve falhar com erro claro, não usar fallback.
- O que acontece quando um token JWT é enviado sem o prefixo `Bearer `? O guard deve rejeitar com 401.
- O que acontece com contas de usuário existentes após migração de AES para bcrypt? As senhas existentes precisam ser re-hashadas ou os usuários devem redefinir a senha.
- O que acontece quando o rate limit é atingido por um IP legítimo? O sistema deve retornar 429 e o usuário deve aguardar o período de reset.
- O que acontece se `CORS_ORIGIN` não for configurado em produção? O sistema deve usar um fallback seguro (como `http://localhost:5173` para dev) ou recusar iniciar.
- O que acontece se `SEED_ADMIN=true` mas já existe um admin criado manualmente? O sistema não deve sobrescrever o admin existente — a verificação é por existência de qualquer perfil 0, não por nome de usuário.
- O que acontece se o seed falhar (ex: banco indisponível no startup)? O sistema deve logar o erro e continuar a inicialização, permitindo que o seed seja tentado novamente no próximo restart.
- O que acontece quando a query de listagem (`findAll`) não recebe filtros opcionais (`id`, `id_mesa`, etc.) no `ListDto`? Os valores `undefined` no objeto `where` do TypeORM podem interferir no carregamento de `relations` aninhadas (`itens.produto`), resultando em listagens sem dados relacionados. O sistema DEVE filtrar valores `undefined` antes de passar ao TypeORM.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE possuir um mecanismo de guarda de autenticação que valide tokens JWT em todas as rotas da API, exceto na rota de login
- **FR-002**: O guard de autenticação DEVE verificar se o token JWT está presente no header `Authorization` com formato `Bearer <token>`
- **FR-003**: O guard de autenticação DEVE verificar a assinatura do token JWT usando o algoritmo HS256 e a chave `JWT_SECRET`
- **FR-004**: O sistema DEVE retornar status 401 Unauthorized com mensagem descritiva quando o token estiver ausente, inválido ou expirado
- **FR-005**: O sistema DEVE armazenar senhas usando algoritmo de hashing bcrypt com fator de custo adequado (salt rounds >= 10)
- **FR-006**: O sistema DEVE comparar senhas fornecidas no login contra o hash bcrypt armazenado, nunca decifrando a senha armazenada
- **FR-007**: O sistema NÃO DEVE utilizar fallback hardcoded para `JWT_SECRET` — deve lançar erro se não estiver configurado
- **FR-008**: O endpoint de login DEVE ter rate limiting com limite máximo de 10 requisições por minuto por remetente
- **FR-009**: O rate limiting DEVE retornar status HTTP 429 (Too Many Requests) quando o limite for excedido
- **FR-010**: O CORS DEVE ser configurável via variável de ambiente `CORS_ORIGIN` e DEVE aceitar múltiplas origens separadas por vírgula
- **FR-011**: Em produção, o CORS DEVE rejeitar origens não listadas; em desenvolvimento, DEVE aceitar `http://localhost:5173` como fallback
- **FR-012**: O sistema DEVE gerar tokens JWT com algoritmo HS256 explicitamente definido e prazo de expiração configurável via variável de ambiente `JWT_EXPIRES_IN` (padrão 2 horas)
- **FR-013**: O sistema DEVE suportar migração de senhas existentes de AES para bcrypt (seja por rehash no primeiro login pós-migração ou por redefinição de senha forçada)
- **FR-014**: O sistema DEVE criar automaticamente um usuário administrador padrão (`admin`/`admin`) na inicialização quando a variável de ambiente `SEED_ADMIN=true` e não existir nenhum usuário com perfil 0 (Administrador) no banco de dados
- **FR-015**: O seed DEVE ser controlado exclusivamente pela variável de ambiente `SEED_ADMIN` — sem ela definida como `true`, nenhum seed deve ocorrer
- **FR-016**: O seed DEVE ser idempotente — executar múltiplas vezes com o mesmo estado não deve criar duplicatas ou alterar dados existentes
- **FR-017**: As demais rotas da API (exceto login) DEVEM ter rate limiting com limite mínimo de 120 requisições por minuto, garantindo operação normal do frontend sem comprometer a proteção contra abusos
- **FR-018**: O sistema DEVE filtrar valores `undefined` do objeto `where` em todos os métodos `findAll` que utilizam o padrão `{ skip, take, ...where } = dto` antes de passar o `where` ao TypeORM, garantindo que relações aninhadas sejam carregadas corretamente mesmo quando nenhum filtro opcional é fornecido na query

### Key Entities

- **Guard de Autenticação JWT**: Mecanismo que intercepta requisições HTTP e valida tokens JWT antes de permitir acesso aos controllers
- **Credencial de Usuário**: Representa a senha do usuário armazenada como hash bcrypt, sem capacidade de reversão para o valor original
- **Seed Service**: Serviço que verifica condições de ambiente e cria dados iniciais necessários para o funcionamento do sistema
- **Configuração de Segredo**: Representa chaves e segredos críticos (`JWT_SECRET`) que devem ser fornecidos exclusivamente via variáveis de ambiente
- **Política de Rate Limiting**: Define limites de requisição por janela de tempo para endpoints sensíveis como login
- **Política de CORS**: Define origens, métodos e headers permitidos para requisições cross-origin

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das rotas da API (exceto login) retornam 401 Unauthorized para requisições sem token JWT válido
- **SC-002**: Senhas armazenadas no banco de dados são hashes bcrypt (padrão `$2b$`) e não texto cifrado reversível, verificado por inspeção direta da coluna `senha`
- **SC-003**: O sistema não inicia ou falha com erro claro quando `JWT_SECRET` não está configurado no ambiente, sem utilizar qualquer fallback hardcoded
- **SC-004**: O endpoint de login bloqueia requisições após 10 tentativas em 1 minuto com status 429, verificado por teste automatizado de carga
- **SC-005**: Requisições de origens não autorizadas em produção são rejeitadas com erro CORS, verificado por teste com header `Origin` malicioso
- **SC-006**: Tokens JWT expiram em no máximo 2 horas, verificado por inspeção do parâmetro `exp` no token decodificado
- **SC-007**: Nenhuma query SQL é logada em produção, exceto erros, verificado por inspeção da configuração de logging
- **SC-008**: Após iniciar com `SEED_ADMIN=true` e banco vazio, é possível autenticar com `admin`/`admin` e obter token JWT válido
- **SC-009**: O seed não executa quando `SEED_ADMIN` não está definido ou é diferente de `true`
- **SC-010**: O rate limiting global (120 req/min) não bloqueia requisições legítimas do frontend durante operações normais de navegação e CRUD, verificado por teste de carga com múltiplas requisições simultâneas a diferentes endpoints
- **SC-011**: Todos os endpoints de listagem paginada retornam corretamente os dados com suas relações, mesmo quando nenhum filtro opcional é informado, verificado por teste de integração que valida o carregamento de `relations` aninhadas

## Assumptions

- O sistema já possui `jsonwebtoken` e `bcrypt` disponíveis como dependências ou serão instaladas durante a implementação
- O banco de dados já contém usuários com senhas criptografadas em AES que precisarão ser migradas para bcrypt
- A rota `POST /usuario/login` é a única rota pública que não exige autenticação JWT
- O valor padrão `http://localhost:5173` para CORS em desenvolvimento é adequado para o fluxo de trabalho atual
- O módulo `crypto` nativo do Node.js será utilizado, e o pacote npm `crypto` obsoleto será removido
- O rate limiting será aplicado globalmente, mas com impacto perceptível apenas no endpoint de login
