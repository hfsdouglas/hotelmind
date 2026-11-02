# Implementation Plan: Gestão de Tarifários e Calendário de Tarifação

**Branch**: `014-rate-plan-calendar` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-rate-plan-calendar/spec.md`

## Summary

Implementar o módulo de Gestão de Tarifários e Calendário de Tarifação do HotelMind para ambientes multi-tenant, contemplando listagem paginada e filtrável (`/tarifarios`), inclusão (`/tarifarios/novo`), edição (`/tarifarios/:id/editar`), ativação e desativação preservando histórico, componente reutilizável de calendário mensal para seleção visual de períodos sincronizado com os campos do formulário, prevenção de conflitos de períodos ativos por `hotel_id + categoria_quarto_id` (em nível de UI, domínio e banco PostgreSQL com `btree_gist` e constraint de exclusão sobre `daterange(data_inicio, data_fim, '[)')`), e serviço de domínio para cálculo de reservas aplicando a regra do menor valor de diária por noite.

## Technical Context

**Language/Version**: TypeScript 5.7, Node.js runtime, React 19

**Primary Dependencies**: Fastify, `fastify-type-provider-zod`, Zod, Prisma Client, PostgreSQL (`btree_gist`), React Router DOM 7, TanStack Query 5, React Hook Form, Axios, Sonner, Lucide React, Tailwind CSS, shadcn/ui (Radix UI primitives)

**Storage**: PostgreSQL via Prisma (`NUMERIC(12,2)` para valores monetários, `DATE` para vigência e `EXCLUDE USING gist` com `daterange('[)')`)

**Testing**: Vitest (testes unitários de entidades, serviços de domínio, use cases, schemas Zod, injeção HTTP no Fastify e testes de componentes/páginas React com Testing Library)

**Target Platform**: Servidor Linux (API Fastify) e navegadores modernos desktop/tablet/mobile (SPA Vite + React)

**Project Type**: Monorepo web application (`packages/.contracts`, `packages/api`, `packages/web`)

**Performance Goals**: Consultas de listagem e de períodos do calendário respondendo em menos de 1 segundo para o escopo de hotel + categoria; feedback imediato na seleção de intervalo e sincronização bidirecional entre calendário e campos de data

**Constraints**: Isolamento estrito de tenant via `request.user.hotelId`; intervalo semiaberto `[data_inicio, data_fim)` na API/banco convertido para datas efetivas inclusivas na UI; proibição de ponto flutuante para persistência monetária (`NUMERIC(12,2)`); constraint de exclusão PostgreSQL retornando HTTP `409` em sobreposições e condições de corrida; convenção `snake_case` em todos os arquivos, pastas, rotas, schemas, repositórios, use cases e serviços

**Scale/Scope**: 1 novo agregado (`Tarifario`), 1 migration Prisma com `btree_gist`, 1 serviço de precificação (`TarifarioPricingService`), 8 use cases de domínio, 7 endpoints HTTP, 3 páginas web (`index`, `novo`, `editar`) e 5 componentes reutilizáveis de tarifário e calendário

## Constitution Check

*Gate before design: PASS.*

- **I — Contract-First Development**: Todas as interfaces compartilhadas (`Tarifario`, payloads de criação/edição, filtros de listagem, períodos do calendário e cálculo de reserva) são definidas em `packages/.contracts/src/tarifarios.ts` e exportadas em `packages/.contracts/src/index.ts` antes da implementação na API e Web.
- **II — Clean Architecture & Strict Layer Boundaries**: Rotas (`routes/tarifarios/`) apenas validam I/O HTTP e delegam aos use cases (`core/usecases/tarifarios/`); use cases orquestram entidades, `TarifarioPricingService` e interfaces de repositório (`core/repositories/tarifarios/`); adaptador Prisma fica isolado em `implementation/postgres_tarifario_repository.ts`.
- **III — SOLID Principles**: Um use case para cada intenção do usuário (`criar`, `editar`, `listar`, `buscar`, `ativar`, `desativar`, `consultar_periodos`, `calcular_tarifa_reserva`); inversão de dependência via `TarifarioRepository` e `CategoriaQuartoRepository`.
- **IV — Explicit over Implicit**: Conversão explícita entre intervalo semiaberto `[data_inicio, data_fim)` e datas efetivas da interface; `hotel_id` injetado explicitamente a partir do token autenticado; erros de domínio explícitos (`TarifarioNotFoundError`, `TarifarioPeriodConflictError`, `CategoriaQuartoInativaError`).
- **V — Low Coupling, High Cohesion**: Comunicação entre `packages/web` e `packages/api` exclusivamente via HTTP tipado com `@hotelmind/contracts`.
- **VI — Clean Code**: Todos os novos arquivos e diretórios seguem rigorosamente `snake_case`.
- **VII — Testability by Design**: Use cases e `TarifarioPricingService` testáveis em memória com repositórios fake; schemas testados para entradas válidas e inválidas; rotas testadas com `app.inject`; constraint PostgreSQL verificada contra sobreposição e concorrência.

## Project Structure

### Documentation (this feature)

```text
specs/014-rate-plan-calendar/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Decisões arquiteturais e técnicas (Phase 0)
├── data-model.md        # Modelo de dados, intervalos e constraints (Phase 1)
├── quickstart.md        # Guia de execução e validação (Phase 1)
├── contracts/
│   └── tarifarios.md    # Contratos compartilhados e endpoints HTTP (Phase 1)
└── tasks.md             # Lista de tarefas de implementação (/speckit-tasks)
```

### Source Code (repository root)

```text
packages/.contracts/src/
├── tarifarios.ts
└── index.ts

packages/api/
├── src/prisma/schema.prisma
├── src/prisma/migrations/<timestamp>_create_tarifarios/migration.sql
├── src/core/
│   ├── entities/
│   │   ├── tarifario.ts
│   │   └── tarifario.spec.ts
│   ├── errors/
│   │   └── tarifario_errors.ts
│   ├── repositories/tarifarios/
│   │   ├── tarifario.repository.ts
│   │   └── implementation/
│   │       └── postgres_tarifario_repository.ts
│   ├── services/
│   │   ├── tarifario_pricing_service.ts
│   │   └── tarifario_pricing_service.spec.ts
│   └── usecases/tarifarios/
│       ├── criar_tarifario_use_case.ts
│       ├── editar_tarifario_use_case.ts
│       ├── listar_tarifarios_use_case.ts
│       ├── buscar_tarifario_use_case.ts
│       ├── desativar_tarifario_use_case.ts
│       ├── ativar_tarifario_use_case.ts
│       ├── consultar_periodos_tarifarios_use_case.ts
│       ├── calcular_tarifa_reserva_use_case.ts
│       └── tarifarios_use_cases.spec.ts
├── src/schemas/tarifarios/
│   ├── tarifarios_schema.ts
│   └── tarifarios_schema.spec.ts
├── src/routes/tarifarios/
│   ├── tarifarios_routes.ts
│   └── tarifarios_routes.spec.ts
├── src/plugins/fastify_routes.ts
└── src/db/seeds/index.ts

packages/web/src/
├── api/
│   └── tarifarios.service.ts
├── schemas/
│   ├── tarifario.schema.ts
│   └── tarifario.schema.spec.ts
├── hooks/
│   └── use_tarifarios.ts
├── components/tarifarios/
│   ├── tarifario_form.tsx
│   ├── tarifario_calendar.tsx
│   ├── tarifario_calendar_day.tsx
│   ├── tarifario_period_summary.tsx
│   ├── tarifario_status_badge.tsx
│   └── tarifario_calendar.spec.tsx
├── pages/app/tarifarios/
│   ├── index.tsx
│   ├── novo.tsx
│   ├── [id]/editar.tsx
│   └── tarifarios_pages.spec.tsx
└── routes.tsx
```

**Structure Decision**: Seguir a arquitetura de pacotes do monorepo (`packages/.contracts`, `packages/api`, `packages/web`) e adaptar a estrutura sugerida na especificação às convenções `snake_case` e ao layout autenticado (`pages/app/tarifarios/`) já utilizados por `quartos` e `categorias_quartos`.

## Implementation Design

### 1. Shared Contracts (`packages/.contracts`)

1. Criar `packages/.contracts/src/tarifarios.ts` com `Tarifario`, `TarifarioListResponse`, `TarifarioListParams`, `CreateTarifarioPayload`, `UpdateTarifarioPayload`, `PeriodoTarifarioCalendario`, `ConsultarCalendarioTarifariosParams`, `ConsultarCalendarioTarifariosResponse`, `NoiteCalculadaReserva` e `CalculoTarifaReserva`.
2. Reexportar os tipos em `packages/.contracts/src/index.ts`.

### 2. Persistência, Domínio e API (`packages/api`)

1. **Prisma Schema & Migration**:
   - Adicionar o model `Tarifario` (`@@map("tarifarios")`) em `packages/api/src/prisma/schema.prisma` com `id`, `hotel_id`, `categoria_quarto_id`, `nome` (`VarChar(100)`), `data_inicio` (`@db.Date`), `data_fim` (`@db.Date`), `valor_diaria` (`@db.Decimal(12, 2)`), `ativo` (`@default(true)`), `criado_em` e `atualizado_em`, além das relações em `Hotel` e `CategoriaQuarto`.
   - Criar a migration SQL habilitando `CREATE EXTENSION IF NOT EXISTS btree_gist`, adicionando check constraints (`data_inicio < data_fim`, `valor_diaria >= 0`) e a constraint de exclusão `EXCLUDE USING gist ("hotel_id" WITH =, "categoria_quarto_id" WITH =, daterange("data_inicio", "data_fim", '[)') WITH &&) WHERE ("ativo" = true)`.
2. **Entidade, Erros e Serviço de Precificação**:
   - Criar `tarifario.ts` e `tarifario_errors.ts` (`TarifarioNotFoundError`, `TarifarioPeriodConflictError`, `TarifarioValidationError`, `TarifarioSemCoberturaError`).
   - Criar `tarifario_pricing_service.ts` para avaliar noite a noite (`[check_in, check_out)`) todos os tarifários ativos elegíveis do mesmo `hotel_id` e `categoria_quarto_id`, aplicando o menor `valor_diaria` aplicável por noite com aritmética decimal exata.
3. **Repositório e Use Cases**:
   - Definir a interface `TarifarioRepository` com métodos de listagem paginada/filtrada, busca por `id` e `hotel_id`, busca de períodos para o calendário, verificação de conflito de período ativo (`find_overlapping_active`), criação, atualização e alteração de status (`ativo`), traduzindo erros de constraint PostgreSQL (`23P01`) em `TarifarioPeriodConflictError`.
   - Implementar os 8 use cases em `src/core/usecases/tarifarios/`:
     - `criar_tarifario_use_case.ts`
     - `editar_tarifario_use_case.ts` (exclui o próprio `id` da verificação de conflitos)
     - `listar_tarifarios_use_case.ts`
     - `buscar_tarifario_use_case.ts`
     - `ativar_tarifario_use_case.ts` (revalida conflitos antes de ativar)
     - `desativar_tarifario_use_case.ts`
     - `consultar_periodos_tarifarios_use_case.ts`
     - `calcular_tarifa_reserva_use_case.ts`
4. **Schemas Zod, Rotas Fastify e Seeds**:
   - Criar `src/schemas/tarifarios/tarifarios_schema.ts` validando `nome` (`trim()`, não vazio, máx. 100), `categoria_quarto_id` (UUID), `data_inicio` e `data_fim` (`YYYY-MM-DD`, `data_inicio < data_fim`), `valor_diaria` (decimal `>= 0` com 2 casas) e `ativo`.
   - Registrar `tarifarios_routes.ts` em `fastify_routes.ts` expondo `GET /tarifarios`, `GET /tarifarios/calendario`, `GET /tarifarios/:id`, `POST /tarifarios`, `PATCH /tarifarios/:id`, `PATCH /tarifarios/:id/ativar` e `PATCH /tarifarios/:id/desativar`.
   - Atualizar `src/db/seeds/index.ts` para incluir as rotas de `Tarifários` (`/tarifarios`, `/tarifarios/novo`) nas permissões do hotel e grupo Administrador, e limpar `tarifario` em `clean()`.

### 3. Frontend Web (`packages/web`)

1. **Serviço HTTP, Hooks e Schemas**:
   - Criar `src/api/tarifarios.service.ts` consumindo todos os endpoints de `/tarifarios`.
   - Criar `src/schemas/tarifario.schema.ts` com validação Zod do formulário e funções utilitárias puras de conversão entre datas efetivas inclusivas da interface (`data_inicio`, `data_fim_efetiva`) e o intervalo semiaberto da API (`[data_inicio, data_fim)` onde `data_fim = add_days(data_fim_efetiva, 1)`).
   - Criar `src/hooks/use_tarifarios.ts` encapsulando queries e mutations do TanStack Query com invalidação de cache de listagem, detalhe e calendário.
2. **Componente Reutilizável de Calendário e Formulário**:
   - `tarifario_status_badge.tsx`: badge semântico para situação Ativo/Inativo.
   - `tarifario_calendar_day.tsx`: célula de dia com diferenciação visual e acessível (além de cor: bordas, ícones, indicadores e rótulos `aria-label`) para dias disponíveis, início/fim selecionado, dias intermediários, períodos ocupados, períodos conflitantes e dia atual, permitindo inspecionar detalhes do tarifário existente.
   - `tarifario_calendar.tsx`: calendário mensal reutilizável com controles de mês anterior, próximo mês, mês/ano atual, limpeza de seleção, seleção em 2 cliques (reiniciando quando a 2ª data é anterior à 1ª) e preservação de seleção ao navegar entre meses.
   - `tarifario_period_summary.tsx`: resumo visual do período selecionado, quantidade de diárias efetivas e alertas de conflito antes do envio.
   - `tarifario_form.tsx`: formulário compartilhado entre inclusão e edição, mantendo sincronização bidirecional entre os inputs de data e o `TarifarioCalendar`.
3. **Páginas e Rotas**:
   - `src/pages/app/tarifarios/index.tsx`: listagem com `ListPageLayout`, `PagedDataTable`, filtros por categoria e situação, e ações de visualizar, editar e ativar/desativar (com confirmação via `AlertDialog` na desativação).
   - `src/pages/app/tarifarios/novo.tsx`: página de inclusão com breadcrumb/navegação, `TarifarioForm`, notificação `toast.success` e redirecionamento para `/tarifarios`.
   - `src/pages/app/tarifarios/[id]/editar.tsx`: página de edição carregando dados atuais, desconsiderando o próprio tarifário na validação de conflitos do calendário e oferecendo ação de desativação confirmada.
   - Registrar `/tarifarios`, `/tarifarios/novo` e `/tarifarios/:id/editar` em `src/routes.tsx`.

## Constitution Check — Post-Design

*Gate after design: PASS.*

- Contratos compartilhados em `packages/.contracts` precedem a implementação de schemas, use cases, rotas e componentes web.
- A lógica de domínio (intervalo semiaberto, prevenção de conflito e regra do menor valor por noite) reside nos use cases e `TarifarioPricingService`, sem acoplamento com Fastify ou Prisma.
- A integridade concorrente (CA11) é garantida pela constraint de exclusão PostgreSQL (`btree_gist`) mapeada no repositório para erro de domínio (`TarifarioPeriodConflictError` -> HTTP `409`).
- Todos os nomes de arquivos e símbolos respeitam a convenção `snake_case`.

## Complexity Tracking

Nenhuma violação da Constituição. Nenhuma exceção de complexidade é necessária.
