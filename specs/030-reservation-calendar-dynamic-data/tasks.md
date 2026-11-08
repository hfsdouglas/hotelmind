# Tasks: Dados Dinâmicos no Calendário de Reservas e Listagem de Quartos

**Input**: Design documents from `/specs/030-reservation-calendar-dynamic-data/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`

## Organization

Tarefas organizadas por User Story para permitir implementação iterativa, independente e testável (TDD), garantindo que nenhuma funcionalidade visual ou interativa existente do frontend seja alterada ou degradada.

---

## Phase 1: Setup & Foundational

**Purpose**: Preparar o ambiente de testes e injeção do `QueryClientProvider` para suportar testes de queries na página de calendário.

- [x] T001 Atualizar `packages/web/src/pages/app/reservas/calendario.spec.tsx` com helper para envolver os testes em `QueryClientProvider` e mocks dos serviços `quartosService` e `reservasService`.

---

## Phase 2: User Story 1 - Carregamento Dinâmico dos Quartos do Hotel (Priority: P1)

**Goal**: Exibir no eixo vertical os quartos reais obtidos da API (`GET /quartos`), com identificação, categoria e ponto de status operacional calculado.

- [x] T002 Integrar `useQuery` para buscar quartos via `quartosService.list({ limite: 250, direcao: 'asc' })` em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T003 Implementar o cálculo dinâmico do status operacional de cada quarto (`bloqueado` se inativo, `ocupado` se houver check-in hoje, `disponivel` caso contrário) e renderizar identificação e categoria na coluna fixa esquerda em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T004 Adicionar testes automatizados em `packages/web/src/pages/app/reservas/calendario.spec.tsx` validando que os quartos retornados pela API são renderizados com os respectivos status operacionais e tooltips.

---

## Phase 3: User Story 2 & 3 - Carregamento Dinâmico de Reservas, Filtragem de Status e 2 Estilos Visuais (Priority: P1)

**Goal**: Carregar as reservas reais da API (`GET /reservas`), filtrar estritamente para que apenas `a_confirmar`, `confirmada` e `check_in` apareçam, aplicar os 2 estilos visuais (`bg-primary` e `bg-primary/50`), e normalizar datas com fuso local.

- [x] T005 Integrar `useQuery` para buscar reservas via `reservasService.list({ limite: 250 })` em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T006 Implementar a filtragem restritiva das reservas: permitir apenas status `a_confirmar`, `confirmada` e `check_in`; omitir completamente `cancelada`, `check_out` e `no_show` em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T007 Mapear reservas para a estrutura do contexto de reservas preservando os 2 estilos visuais: `check_in` com `status_code: 1` (`bg-primary`) e `confirmada`/`a_confirmar` com `status_code: 0` (`bg-primary/50`), aplicando normalização de string de data local `YYYY-MM-DDT00:00:00`.
- [x] T008 Adicionar testes automatizados em `packages/web/src/pages/app/reservas/calendario.spec.tsx` validando que reservas `cancelada`, `check_out` e `no_show` são ignoradas, e que os 2 estilos visuais (`bg-primary` e `bg-primary/50`) são corretamente aplicados.

---

## Phase 4: User Story 4 - Modal de Detalhes da Reserva com Dados Reais (Priority: P2)

**Goal**: Conectar o modal `Dialog` de detalhes da reserva à lista real de quartos e dados retornados da API.

- [x] T009 Conectar a exibição do número do quarto no modal consultando a lista dinâmica de quartos em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T010 Exibir no modal os campos reais de titular, e-mail, telefone, documento, período formatado, status e valor em moeda em `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T011 Adicionar testes automatizados em `packages/web/src/pages/app/reservas/calendario.spec.tsx` validando a abertura do modal e a exibição fidedigna dos dados da reserva selecionada.

---

## Phase 5: User Story 5 - Preservação do Layout, Limpeza e Verificação Final (Priority: P1)

**Goal**: Garantir zero regressão visual, remoção completa dos mocks estáticos e validação com linter.

- [x] T012 Remover completamente os dados estáticos legados (`mockRooms` e `mockReservations`) de `packages/web/src/pages/app/reservas/calendario.tsx`.
- [x] T013 Garantir que todo o layout e estilos originais (`isolate`, `z-20`, `z-30`, `sticky`, botões de navegação, cálculo responsivo de dias) permanecem intactos.
- [x] T014 Executar os testes automatizados com `pnpm --filter web test src/pages/app/reservas/calendario.spec.tsx --run`.
- [x] T015 Executar o linter e formatador Biome com `pnpm biome check packages/web/src/pages/app/reservas/calendario.tsx packages/web/src/pages/app/reservas/calendario.spec.tsx packages/web/src/test/setup.ts`.
