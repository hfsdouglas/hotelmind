---
description: "Task list for 032-reservation-selection-checkin"
---

# Tasks: Seleção de Reserva e Check-in pelo Calendário

**Input**: Design documents from `specs/032-reservation-selection-checkin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api_alterar_status.md, contracts/ui_components.md, quickstart.md

**Tests**: TDD obrigatório (constituição + `CLAUDE.md`). Cada tarefa de teste vem antes da produção correspondente e DEVE falhar (Red) antes da implementação (exceção: testes de caracterização da API, que podem passar de primeira porque o comportamento já existe).

**Ownership**: tarefas cujo texto começa com **TEST:** escrevem testes, mocks MSW, fixtures ou fakes in-memory → `qa-tester`. As demais são produção → `fullstack-specialist`.

**Escopo de pacotes**: `packages/web` (principal); `packages/api` só testes de caracterização (produção só muda se um teste revelar defeito); `packages/.contracts` sem mudanças (apenas verificação).

**Regras de teste**: MSW apenas nos specs novos (`server.use(...)` para cenários; nunca `vi.mock` de Axios/serviços); asserções por `getByRole`/`getByText`/`aria-pressed`/`data-status`/`data-reserva-id`; relógio fixo em 2026-12-01 (`vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date(2026, 11, 1))`; no E2E `page.clock.setFixedTime(new Date(2026, 11, 1))`); rodar só os arquivos da tarefa (`pnpm exec vitest run <path>`), nunca a suíte inteira nem watch.

**Fixtures (usadas por todas as histórias, criadas em T010)**: suítes `QUARTO_101_ID` (101, camas `casal x1` + `solteiro x1`) e `QUARTO_102_ID` (102, camas `casal x1`), ambas ativas.

| id / código | Suíte | Período | Status | Hóspedes (posição: nome, ficha) | Outros |
|---|---|---|---|---|---|
| `reserva-101` / RES-0101 | 101 | 2026-12-02 → 2026-12-04 | `confirmada` | 1: "Ana Souza", preenchida; 2: "Bruno Souza", preenchida | 2 adultos, 0 crianças, valor `'1500.00'`, obs "Chegada tardia", regime "Pensão Completa", sem parceiro |
| `reserva-102` / RES-0102 | 102 | 2026-12-01 → 2026-12-03 | `confirmada` | 1: sem nome, pendente; 2: "Carlos Lima", rascunho | 2 adultos, 1 criança, valor `'980.50'`, obs `null`, parceiro "Agência Sol" |
| `reserva-103` / RES-0103 | 101 | 2026-12-06 → 2026-12-08 | `a_confirmar` | 1: sem nome, pendente | 1 adulto |
| `reserva-104` / RES-0104 | 102 | 2026-12-05 → 2026-12-07 | `check_in` | 1: "Diana Reis", preenchida | 1 adulto |

O fixture existente `reserva-1` / RES-0001 (2026-12-20 → 2026-12-22) e o código `RES-0002` do POST de criação permanecem como estão (specs da 031 dependem deles).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (tokens de design)

- [X] T001 [P] Em `packages/web/src/index.css` adicionar, em `:root`: `--selection-ring: oklch(0.6 0.16 250); --selection-glow: oklch(0.6 0.16 250 / 0.35); --selection-highlight: oklch(1 0 0 / 0.3); --status-checkin: oklch(0.6 0.17 50); --status-checkin-foreground: oklch(0.42 0.11 50);` e trocar `--status-maintenance` por `oklch(0.55 0.02 250)`; em `.dark`: `--selection-ring: oklch(0.74 0.12 250); --selection-glow: oklch(0.74 0.12 250 / 0.4); --selection-highlight: oklch(1 0 0 / 0.2); --status-checkin: oklch(0.74 0.14 50); --status-checkin-foreground: oklch(0.84 0.12 55);` e `--status-maintenance: oklch(0.7 0.02 250)`. Adicionar a utility `.shadow-selection { box-shadow: 0 0 0 4px var(--selection-glow), inset 0 1px 0 var(--selection-highlight); }` em `@layer utilities` (junto de `.bg-reservation-to-confirm`).
- [X] T002 [P] Em `packages/web/tailwind.config.ts` adicionar ao grupo `status`: `checkin: withOpacity('--status-checkin')`, `'checkin-foreground': withOpacity('--status-checkin-foreground')`; e em `theme.extend.colors`: `'selection-ring': withOpacity('--selection-ring')`. Reiniciar o Vite após a mudança.

---

## Phase 2: Foundational (contratos, view model, backend, mocks, regras puras)

**Bloqueia todas as user stories.**

### Contratos

- [X] T003 Verificar em `packages/.contracts/src/index.ts` que `Reserva`, `Hospede`, `FichaStatus`, `ReservaStatus`, `ChangeReservaStatusPayload`, `Quarto`, `ConfiguracaoCama`, `TipoCama` e `TIPOS_CAMA` são exportados (`export * from './quartos.js'` e `'./reservas.js'`). Nenhuma mudança de contrato é esperada; se algum não estiver exportado, exportar ali antes de qualquer consumidor.

### Data model (view models do web)

- [X] T004 Criar `packages/web/src/types/calendario_reserva.ts` (apenas tipos e constantes de rótulo, conforme `data-model.md`): `CalendarioStatusReserva = Extract<ReservaStatus, 'a_confirmar' | 'confirmada' | 'check_in'>`; `STATUS_EXIBIDOS_NO_CALENDARIO: readonly CalendarioStatusReserva[] = ['a_confirmar', 'confirmada', 'check_in']`; `STATUS_RESERVA_LABEL: Record<ReservaStatus, string>` (a_confirmar "A Confirmar", confirmada "Confirmada", check_in "Check-in", check_out "Check-out", no_show "No-show", cancelada "Cancelada"); `CalendarioHospede { posicao: number; nome: string | null; ficha_status: FichaStatus }`; `Reservation` com os campos exatos da tabela "Reservation" do data-model (`id, codigo, quartoId, quarto_identificacao, categoria_nome, camas, checkIn, checkOut, diarias, status, status_label, titular { nome, email: string | null, telefone: string | null }, adultos, criancas, regime_titulo: string | null, parceiro_nome: string | null, valor_total: number, observacoes: string | null, hospedes: CalendarioHospede[], fichas_preenchidas, total_hospedes`); `RoomStatus = 'disponivel' | 'bloqueado' | 'manutencao' | 'limpeza' | 'checkin'`; `Room { id, numero, tipo, camas: ConfiguracaoCama[], status: RoomStatus }`; `ROOM_STATUS_LABEL` (disponivel "Disponível", bloqueado "Bloqueado", manutencao "Manutenção", limpeza "Limpeza", checkin "Check-in"); `OpcaoCheckIn = 'confirmar' | 'preencher_fnrh' | 'sem_preencher'`; `AvaliacaoCheckIn = { permitido: true } | { permitido: false; motivo: string }`.

### Backend (api, caracterização + isolamento entre hotéis, US7)

- [X] T005 [P] TEST: Criar `packages/api/src/core/usecases/reservas/alterar_status_reserva_use_case.spec.ts` usando `InMemoryReservaRepository` (+ `InMemoryReservaHospedeRepository`) de `packages/api/src/core/repositories/reservas/in-memory/`: (a) reserva `confirmada` do hotel A → `execute({ status_novo: 'check_in', hotel_id: A, user_id })` retorna `status: 'check_in'` e `repo.historico` recebe `{ status_anterior: 'confirmada', status_novo: 'check_in', user_id }`; (b) `a_confirmar → check_in` lança `ReservaTransicaoInvalidaError` e status/histórico ficam inalterados; (c) reserva do hotel A executada com `hotel_id: B` lança `ReservaNotFoundError` e a reserva continua `confirmada` sem histórico novo; (d) `check_in → check_in` não lança (no-op atual). Se o fake não suportar algum cenário, estender apenas o fake in-memory.
- [X] T006 [P] TEST: Em `packages/api/src/routes/reservas/reservas_routes.spec.ts` adicionar `describe('PATCH /reservas/:id/status')` com `app.inject` e `make_token`: 200 `confirmada → check_in` com corpo `{ status: 'check_in' }` retornando `status: 'check_in'`; 422 para `a_confirmar → check_in`; 404 `{ message }` quando o token é do hotel B e a reserva é do hotel A, e a reserva do hotel A continua `confirmada` (verificar no `reservas_repo`); 401 sem token; 400 com `status` inválido.
- [X] T007 Rodar `pnpm --filter api exec vitest run src/core/usecases/reservas/alterar_status_reserva_use_case.spec.ts src/routes/reservas/reservas_routes.spec.ts`. Esperado: verde sem mudança de produção. Se algum caso falhar, corrigir minimamente `packages/api/src/core/usecases/reservas/alterar_status_reserva_use_case.ts` ou `packages/api/src/routes/reservas/reservas_routes.ts` (hotel sempre de `request.user.hotelId`).

### Mocks MSW (web)

- [X] T008 [P] TEST: Em `packages/web/src/mocks/quartos/quartos_handlers.ts` deixar a suíte 101 com `camas: [{ id: 'cama-1', tipo: 'casal', quantidade: 1 }, { id: 'cama-2', tipo: 'solteiro', quantidade: 1 }]` e a 102 com `camas: [{ id: 'cama-3', tipo: 'casal', quantidade: 1 }]`; ambas `status: 'S'`.
- [X] T009 TEST: Em `packages/web/src/mocks/reservas/reservas_handlers.ts` (depende de T008): adicionar os fixtures `reserva-101`..`reserva-104` da tabela acima (com `quarto`, `regime_alimentacao`, `parceiro`, `hospedes` completos no formato `Hospede`, `fichas_preenchidas`/`total_hospedes` coerentes); manter os fixtures numa variável mutável inicializada por `function criar_fixtures_reservas()` e exportar `reset_reservas_fixtures()`; adicionar `http.get(`${BASE_URL}/reservas/:id`)` (404 `{ message: 'Reserva não encontrada.' }` se não existir) declarado DEPOIS de `/reservas/disponibilidade`; adicionar `http.patch(`${BASE_URL}/reservas/:id/status`)` conforme `contracts/api_alterar_status.md` (404, 422 `{ message: 'Transição de status inválida: a_confirmar → check_in' }`, 200 mutando o fixture) e guardar o último corpo recebido, exposto por `export function ultimo_corpo_alterar_status(): unknown`; adicionar `http.put(`${BASE_URL}/reservas/:id/hospedes/:posicao`)` retornando 200 com o hóspede atualizado (usado pelo E2E de FNRH). Chamar `reset_reservas_fixtures()` no `afterEach` de `packages/web/src/tests/setup.ts`. Ajustar asserções de contagem/linhas em specs existentes que consomem `GET /reservas` (ex.: `packages/web/src/pages/app/reservas/index.spec.tsx`, `calendario.spec.tsx`, `calendario_selecao.spec.tsx`, `calendario_selecao.e2e.ts`) se os novos fixtures as afetarem.

### Regras puras (web) - testes primeiro

- [X] T010 [P] TEST: Criar `packages/web/src/lib/reserva_status.spec.ts`: `avaliar_check_in(null)` → `{ permitido: false, motivo: 'Selecione uma reserva para fazer check-in' }`; `a_confirmar` → motivo `'Confirme a reserva antes do check-in'`; `check_in` → motivo `'Check-in já realizado'`; `confirmada` → `{ permitido: true }`; `is_check_in_antecipado('2026-12-02T00:00:00', new Date(2026, 11, 1))` → `true`, mesmo dia → `false`, dia anterior → `false`.
- [X] T011 [P] TEST: Criar `packages/web/src/lib/fnrh.spec.ts`: `fichas_pendentes` retorna só `ficha_status !== 'preenchida'` ordenadas por `posicao` (entrada desordenada); `rotulo_hospede({ posicao: 1, nome: null })` → `'Hóspede 1'`, com nome → o nome; `rotulo_ficha_status('pendente')` → `'Pendente'`, `'rascunho'` → `'Rascunho'`; `primeira_ficha_pendente([])` → `null`; todas preenchidas → `null`.
- [X] T012 [P] TEST: Criar `packages/web/src/lib/camas.spec.ts`: `formatar_camas([{ tipo: 'casal', quantidade: 1 }, { tipo: 'solteiro', quantidade: 2 }])` → `'1 Casal, 2 Solteiro'`; cada `TipoCama` mapeia para `Solteiro`, `Casal`, `Queen`, `King`, `Beliche`, `Sofá-cama`; `[]` → `'Não informada'`.
- [X] T013 [P] TEST: Criar `packages/web/src/lib/calendario_reserva.spec.ts` com objetos `Reserva`/`Quarto` locais: `map_reserva_to_calendario(reserva, quarto)` preenche todos os campos de `Reservation` (datas `YYYY-MM-DDT00:00:00` a partir de `'2026-12-02'` e de `'2026-12-02T00:00:00.000Z'`; `diarias` = 2 para 02→04; `valor_total` `'980.50'` → 980.5 e `'abc'` → 0; `observacoes` `''` → `null`; `nome_completo` vazio → `nome: null`; hóspedes ordenados por posição; `camas` do quarto; `quarto_identificacao`/`categoria_nome` de `reserva.quarto`, fallback no `quarto`, depois `'-'`; `status_label` "Check-in" para `check_in`); `filtrar_reservas_calendario` descarta `cancelada`, `check_out`, `no_show`; `derive_suite_status`: quarto `status: 'N'` → `'bloqueado'` mesmo com check-in; reserva `check_in` da suíte (com datas no passado ou futuro) → `'checkin'`; só `confirmada` → `'disponivel'`; reserva `check_in` de outra suíte → `'disponivel'`; `map_quarto_to_room` usa `categoria.nome` ou `'Padrão'` e copia `camas`.
- [X] T014 [P] TEST: Atualizar para o novo view model (sem `status_code`, `pagamento`, `hospede`) os fixtures de `packages/web/src/contexts/reservations_context.spec.tsx`, `packages/web/src/components/reservas/reservation_cell.spec.tsx` e `packages/web/src/components/reservas/calendar_day_cell.spec.tsx`, criando um builder compartilhado `packages/web/src/tests/utils/make_calendario_reservation.ts` (`make_calendario_reservation(overrides?: Partial<Reservation>): Reservation`). Assertivas existentes sobre temas passam a usar `status` (`'confirmada'`, `'a_confirmar'`, `'check_in'`).

### Regras puras e view model (web) - produção

- [X] T015 [P] Implementar `packages/web/src/lib/reserva_status.ts` (`avaliar_check_in`, `is_check_in_antecipado`; motivos como constantes nomeadas) até T010 passar.
- [X] T016 [P] Implementar `packages/web/src/lib/fnrh.ts` (`fichas_pendentes`, `primeira_ficha_pendente`, `rotulo_hospede`, `rotulo_ficha_status`) até T011 passar.
- [X] T017 [P] Implementar `packages/web/src/lib/camas.ts` (`CAMA_LABEL: Record<TipoCama, string>`, `formatar_camas`) até T012 passar.
- [X] T018 Implementar `packages/web/src/lib/calendario_reserva.ts` (`map_reserva_to_calendario`, `filtrar_reservas_calendario`, `derive_suite_status`, `map_quarto_to_room`) até T013 passar.
- [X] T019 Em `packages/web/src/contexts/reservations_context.tsx` remover `Guest`/`Payment` e reexportar `Reservation` de `@/types/calendario_reserva`; em `packages/web/src/components/reservas/reservation_cell.tsx` trocar as checagens de `status_code`/rótulo por `reservation.status` (`check_in` → `bg-primary` provisório, `confirmada` → `bg-primary/50`, `a_confirmar` → `bg-reservation-to-confirm`) e adicionar `data-status={reservation.status}` e `data-reserva-id={reservation.id}`; em `packages/web/src/pages/app/reservas/calendario.tsx` substituir os `useMemo` de mapeamento (L715-817) por `filtrar_reservas_calendario` + `map_reserva_to_calendario` + `map_quarto_to_room`, mover `RoomStatus`/`Room` para `@/types/calendario_reserva` e adaptar o modal de detalhes existente aos novos campos (`titular`, sem pagamento). T014 e os specs atuais de `calendario.spec.tsx`/`calendario_selecao.spec.tsx` devem passar.

**Checkpoint**: base pronta; API caracterizada; regras puras verdes.

---

## Phase 3: User Story 1 - Selecionar uma reserva com destaque azul (Priority: P1) MVP

**Goal**: clique seleciona (sem modal), anel azul com espaço transparente, regras de saída.

**Independent Test**: spec.md US1.

### Tests (Red)

- [X] T020 [P] [US1] TEST: Criar `packages/web/src/hooks/use_reserva_selecionada.spec.tsx` (renderHook com duas `div` reais como regiões): `selecionar('a')` → `selecionadaId === 'a'`; `selecionar('b')` troca; Esc → `null`; Esc com `paused: true` mantém; `pointerdown` fora das regiões → `null`; dentro de uma região mantém; com `paused: true` o `pointerdown` fora mantém; rerender com `idsVisiveis` sem o id → `null`; `limpar()` → `null`.
- [X] T021 [P] [US1] TEST: Em `packages/web/src/components/reservas/reservation_cell.spec.tsx`: `isSelected` → `aria-pressed="true"` e classes `ring-2`, `ring-selection-ring`, `ring-offset-1`, `ring-offset-transparent`, `shadow-selection`, `z-[4]`; `isSelected={false}` → `aria-pressed="false"` sem essas classes; `aria-label` "Reserva RES-0101 - Ana Souza"; clique e Enter/Espaço chamam `onSelect` uma vez; `mousedown` não propaga (comportamento 031).
- [X] T022 [P] [US1] TEST: Em `packages/web/src/components/reservas/calendar_day_cell.spec.tsx`: com `selectedReservationId` igual ao id de uma das reservas do dia, só essa barra tem `aria-pressed="true"`; com `null`, todas `false`.
- [X] T023 [US1] TEST: Em `packages/web/src/pages/app/reservas/calendario_selecao.spec.tsx` substituir o cenário "clicar na barra abre Detalhes da Reserva" por: clicar numa barra de RES-0101 não abre `role="dialog"` e todas as barras com `data-reserva-id="reserva-101"` ficam `aria-pressed="true"`; clicar em RES-0102 move o destaque; clicar de novo em RES-0102 mantém; Esc limpa; clique fora (ex.: `document.body`) limpa; pressionar a área livre de uma célula limpa a reserva e inicia a seleção de período; com uma seleção de período ativa, clicar numa barra remove o período (`data-selection` some) e seleciona a reserva; botões de navegação de datas limpam a seleção; Enter numa barra focada seleciona.

### Implementation (Green)

- [X] T024 [P] [US1] Implementar `packages/web/src/hooks/use_reserva_selecionada.ts` conforme `contracts/ui_components.md` (listeners `keydown`/`pointerdown` no `document`, removidos no cleanup; efeito que limpa quando o id sai de `idsVisiveis`) até T020 passar.
- [X] T025 [P] [US1] Em `packages/web/src/components/reservas/reservation_cell.tsx` adicionar `isSelected`, `aria-pressed`, `aria-label` e as classes de seleção (research R8) até T021 passar.
- [X] T026 [US1] Em `packages/web/src/components/reservas/calendar_day_cell.tsx` adicionar a prop `selectedReservationId: string | null` repassando `isSelected` a cada `ReservationCell` até T022 passar.
- [X] T027 [US1] Em `packages/web/src/pages/app/reservas/calendario.tsx`: usar `useReservaSelecionada({ regionRefs: [gridRef, actionsBarRef], paused: novaReservaOpen || detalhesOpen, idsVisiveis })`; `onSelectReservation` → `clear()` (período) + `selecionar(id)` (sem abrir modal); `onRangeStart` → `limpar()` antes de `startDrag`; handlers de navegação de datas e do seletor de mês/ano chamam `limpar()`; `useCalendarRangeSelection.paused` passa a `novaReservaOpen || detalhesOpen`; o modal de detalhes existente passa a depender de um estado `detalhesOpen` (sem gatilho até a US4); garantir que o anel não seja cortado na primeira linha (ajustar padding vertical da célula/`tbody` se necessário) até T023 passar.

### E2E

- [ ] T028 [P] [US1] TEST: Criar `packages/web/src/tests/reservas/calendario_selecao_reserva.e2e.ts` (relógio 2026-12-01): clicar numa barra de RES-0101 → nenhum `dialog`, barras com `aria-pressed="true"`; trocar para RES-0102; Esc limpa; a caixa do anel da barra de RES-0102 na primeira linha (102 ou a primeira suíte exibida) fica totalmente dentro do viewport da grade (`boundingBox` da barra com 3px de margem dentro do `boundingBox` do contêiner, abaixo do `thead`).
- [ ] T029 [P] [US1] TEST: Em `packages/web/src/tests/reservas/calendario_selecao.e2e.ts` trocar o passo que esperava o modal de detalhes ao clicar na barra por "a barra fica `aria-pressed=true` e nenhum `dialog` abre".

**Checkpoint**: US1 entregável isoladamente.

---

## Phase 4: User Story 2 - Fazer check-in da reserva selecionada (Priority: P1)

**Goal**: botão sino, modal com dados + observação, troca de status, tema e suíte laranja.

**Independent Test**: spec.md US2.

### Tests (Red)

- [X] T030 [P] [US2] TEST: Criar `packages/web/src/hooks/use_check_in_reserva.spec.tsx` (MSW + QueryClient real + `Toaster` ou spy em `toast` do sonner): sucesso → `PATCH /reservas/reserva-101/status` com corpo exatamente `{ status: 'check_in' }` (`ultimo_corpo_alterar_status()`), `toast.success('Check-in da reserva RES-0101 realizado com sucesso!')`, `onSucesso` chamado, queries `['reservas', 'calendario']` e `['reserva', 'reserva-101']` invalidadas; `isPending` true durante a requisição; 422 (`reserva-103`) → `toast.error` com a mensagem da API e `onTransicaoInvalida`; 422 sem `message` → `'Não foi possível realizar o check-in.'`; 404 → `toast.error('Reserva não encontrada.')` e `onNaoEncontrada`; 500 (`server.use`) → `toast.error` com a mensagem ou fallback e nenhum callback.
- [X] T031 [P] [US2] TEST: Criar `packages/web/src/components/reservas/modal_check_in_reserva.spec.tsx` (sem pendências; `hoje = new Date(2026, 11, 1)`): título "Confirmar check-in"; mostra "RES-0101", "Ana Souza", "101", categoria, "02/12/2026", "04/12/2026", "2 diárias", "2 adultos", "Pensão Completa", "R$ 1.500,00", "Chegada tardia", "2 de 2 fichas FNRH preenchidas"; reserva sem observação → "Sem observações"; sem parceiro → linha de parceiro omitida; entrada 02/12 com hoje 01/12 → "Check-in antecipado: a entrada prevista é 02/12/2026"; entrada hoje → sem aviso; `total_hospedes: 0` → "Nenhuma ficha FNRH cadastrada" e botão "Confirmar check-in"; clicar "Confirmar check-in" → `onConfirmar('confirmar')`; `isPending` → botão desabilitado; "Cancelar" → `onOpenChange(false)`.
- [X] T032 [P] [US2] TEST: Criar `packages/web/src/components/reservas/calendario_barra_acoes.spec.tsx`: botões "Nova Reserva" e "Check-in" nessa ordem, com ícones `lucide-calendar-plus` e `lucide-bell-ring` (classe do SVG); sem seleção "Check-in" desabilitado e hover/foco mostra "Selecione uma reserva para fazer check-in"; `a_confirmar` → "Confirme a reserva antes do check-in"; `check_in` → "Check-in já realizado"; `confirmada` → habilitado e clique chama `onCheckIn`; "Nova Reserva" chama `onNovaReserva` com ou sem seleção.
- [X] T033 [P] [US2] TEST: Criar `packages/web/src/components/reservas/suite_status_indicator.spec.tsx`: para cada `RoomStatus` o dot tem `data-status` e a classe `bg-status-{available|blocked|maintenance|cleaning|checkin}`; hover mostra o rótulo de `ROOM_STATUS_LABEL` ("Check-in" para `checkin`); exibe número e categoria.
- [X] T034 [P] [US2] TEST: Em `packages/web/src/components/reservas/reservation_cell.spec.tsx` adicionar: `status: 'check_in'` → classe `bg-status-checkin` (não `bg-primary`); `confirmada` → `bg-primary/50`; `a_confirmar` → `bg-reservation-to-confirm`.
- [X] T035 [US2] TEST: Criar `packages/web/src/pages/app/reservas/calendario_check_in.spec.tsx` (página `Calendario` com MSW, relógio 2026-12-01): suíte 102 inicia com dot `data-status="checkin"` (RES-0104) e 101 com `disponivel`; selecionar RES-0101 → "Check-in" → modal com "Chegada tardia" → "Confirmar check-in" → toast de sucesso, modal fecha, barras de `reserva-101` com `data-status="check_in"` e `aria-pressed="true"`, dot da 101 `data-status="checkin"`, botão "Check-in" desabilitado; "Cancelar" não envia requisição e mantém a seleção; Esc com o modal aberto fecha só o modal (reserva continua selecionada); 422 via `server.use` → toast de erro, modal fecha, reservas recarregadas; 404 via `server.use` → toast "Reserva não encontrada.", seleção removida; 500 → modal continua aberto.

### Implementation (Green)

- [X] T036 [P] [US2] Implementar `packages/web/src/hooks/use_check_in_reserva.ts` conforme `contracts/ui_components.md` e research R13/R14 (classificação por `error.response?.status`, mensagens como constantes) até T030 passar.
- [X] T037 [P] [US2] Implementar `packages/web/src/components/reservas/modal_check_in_reserva.tsx` (shadcn `Dialog`; valores BRL com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; datas `dd/MM/yyyy` com date-fns `ptBR`; observações com `whitespace-pre-wrap`; usa `is_check_in_antecipado`; neste passo só o caminho sem pendências) até T031 passar.
- [X] T038 [P] [US2] Implementar `packages/web/src/components/reservas/calendario_barra_acoes.tsx` com "Nova Reserva" (`CalendarPlus`) e "Check-in" (`BellRing`), botões de ícone `h-8 w-8 p-0` `variant="outline"`, `sr-only` com o nome, tooltip com o motivo (`avaliar_check_in`) e gatilho em `span` para botões desabilitados, até T032 passar.
- [X] T039 [P] [US2] Implementar `packages/web/src/components/reservas/suite_status_indicator.tsx` (extraído de `calendario.tsx` L436-484) até T033 passar.
- [X] T040 [P] [US2] Em `packages/web/src/components/reservas/reservation_cell.tsx` usar `bg-status-checkin` para `check_in` até T034 passar.
- [X] T041 [US2] Em `packages/web/src/pages/app/reservas/calendario.tsx`: substituir a barra inferior pelo `CalendarioBarraAcoes`; substituir o bloco do dot por `SuiteStatusIndicator`; estado `checkInOpen`, `ModalCheckInReserva` com `hoje={today}`; `useCheckInReserva` com `onSucesso` (fecha modal), `onNaoEncontrada` (fecha modal + `limpar()`), `onTransicaoInvalida` (fecha modal); `paused` de ambos os hooks inclui `checkInOpen`; até T035 passar.

### E2E

- [ ] T042 [US2] TEST: Criar `packages/web/src/tests/reservas/calendario_check_in.e2e.ts`: selecionar RES-0101, clicar "Check-in", ver "Chegada tardia" e "Check-in antecipado", confirmar; capturar a requisição `PATCH **/reservas/reserva-101/status` com `page.waitForRequest` e afirmar `postDataJSON()` igual a `{ status: 'check_in' }` (sem `hotel_id`, US7 cenário 2); toast de sucesso; barra `data-status="check_in"`; dot da 101 `data-status="checkin"`; selecionar RES-0103 e verificar "Check-in" desabilitado.

**Checkpoint**: US1 + US2 = MVP de check-in.

---

## Phase 5: User Story 3 - Oferecer o preenchimento das FNRHs pendentes (Priority: P1)

**Goal**: aviso de pendências, opções com/sem preenchimento, navegação para o modal de ficha.

**Independent Test**: spec.md US3.

### Tests (Red)

- [X] T043 [P] [US3] TEST: Em `packages/web/src/components/reservas/modal_check_in_reserva.spec.tsx` adicionar (RES-0102): "2 fichas FNRH pendentes", "0 de 2 fichas FNRH preenchidas", lista "Hóspede 1 - Pendente" e "Carlos Lima - Rascunho", "O preenchimento é opcional."; botões "Fazer check-in e preencher FNRHs" → `onConfirmar('preencher_fnrh')`, "Fazer check-in sem preencher" → `onConfirmar('sem_preencher')`, "Cancelar"; "Confirmar check-in" ausente; `isPending` desabilita os dois botões de confirmação; com 1 pendência o texto é "1 ficha FNRH pendente".
- [X] T044 [US3] TEST: Em `packages/web/src/pages/app/reservas/calendario_check_in.spec.tsx` adicionar (rotas `/reservas/calendario` e `/reservas/:id` com um elemento que mostra `location.pathname + location.search`): RES-0102 → "Fazer check-in e preencher FNRHs" → PATCH enviado, toast de sucesso, rota atual `/reservas/reserva-102?fnrh=pendente`; com 422 via `server.use` → sem navegação; "Fazer check-in sem preencher" → continua no calendário com a barra `data-status="check_in"`.
- [X] T045 [P] [US3] TEST: Criar `packages/web/src/pages/app/reservas/detalhe_fnrh_pendente.spec.tsx` (`DetalheReservaPage` com MSW, `MemoryRouter` em `/reservas/reserva-102?fnrh=pendente`): após carregar, abre o diálogo "Editar ficha" (título/rótulo usado por `ModalEditarFichaFnrh`) para a posição 1 e a URL passa a não ter `fnrh`; fechar o diálogo não o reabre; `/reservas/reserva-101?fnrh=pendente` (todas preenchidas) → nenhum diálogo e parâmetro removido; sem o parâmetro → nenhum diálogo.

### Implementation (Green)

- [X] T046 [P] [US3] Em `packages/web/src/components/reservas/modal_check_in_reserva.tsx` adicionar o bloco de pendências (`fichas_pendentes`, `rotulo_hospede`, `rotulo_ficha_status`; plural/singular) e os botões de FR-008 até T043 passar.
- [X] T047 [US3] Em `packages/web/src/pages/app/reservas/calendario.tsx` guardar a `OpcaoCheckIn` escolhida (ref) e, em `onSucesso` com `preencher_fnrh`, `navigate(`/reservas/${id}?fnrh=pendente`)` até T044 passar.
- [X] T048 [P] [US3] Em `packages/web/src/pages/app/reservas/[id]/index.tsx` usar `useSearchParams`: quando `fnrh === 'pendente'` e a reserva carregou, uma única vez (guarda `useRef`) definir `hospedeEmEdicao` com o `ReservaHospede` da posição de `primeira_ficha_pendente` e remover o parâmetro com `setSearchParams(next, { replace: true })`; constante `FNRH_PENDENTE_PARAM = 'pendente'`; até T045 passar.

### E2E

- [ ] T049 [US3] TEST: Criar `packages/web/src/tests/reservas/calendario_check_in_fnrh.e2e.ts`: RES-0102 → "Check-in" → aviso "2 fichas FNRH pendentes" → "Fazer check-in e preencher FNRHs" → URL `/reservas/reserva-102` (sem `fnrh`) com o diálogo de ficha aberto para o Hóspede 1; voltar ao calendário e verificar a barra de RES-0102 com `data-status="check_in"`. Segundo teste: após `reset`, mesma reserva com "Fazer check-in sem preencher" → permanece em `/reservas/calendario`.

---

## Phase 6: User Story 4 - Detalhes da reserva selecionada (Priority: P2)

**Goal**: botão "Detalhes" com modal de dados reais.

**Independent Test**: spec.md US4.

### Tests (Red)

- [X] T050 [P] [US4] TEST: Criar `packages/web/src/components/reservas/modal_detalhes_reserva.spec.tsx`: título "Detalhes da Reserva"; RES-0102 mostra código, "Confirmada", "102", categoria, "01/12/2026", "03/12/2026", "2 diárias", titular com "-" para e-mail/telefone ausentes, "2 adultos, 1 criança", regime, "Agência Sol", "R$ 980,50", "0 de 2 fichas FNRH preenchidas"; sem observações → seção "Observações" ausente; RES-0101 → "Chegada tardia" e "Balcão / Reserva Direta"; não contém "Pago" nem "Pendente" de pagamento; link "Abrir reserva" com `href="/reservas/reserva-102"`.
- [X] T051 [P] [US4] TEST: Em `packages/web/src/components/reservas/calendario_barra_acoes.spec.tsx` adicionar o terceiro botão "Detalhes" (ícone `lucide-info`): desabilitado sem seleção com dica "Selecione uma reserva para ver os detalhes"; habilitado com seleção chamando `onDetalhes`; ordem final "Nova Reserva", "Check-in", "Detalhes".
- [X] T052 [US4] TEST: Em `packages/web/src/pages/app/reservas/calendario.spec.tsx`: selecionar RES-0101, clicar "Detalhes" → diálogo "Detalhes da Reserva" com "Chegada tardia"; fechar → barra continua `aria-pressed="true"`; com o diálogo aberto, clicar dentro dele não limpa a seleção.

### Implementation (Green)

- [X] T053 [P] [US4] Implementar `packages/web/src/components/reservas/modal_detalhes_reserva.tsx` (extraído do JSX inline de `calendario.tsx`, sem dados de pagamento, `Link` "Abrir reserva") até T050 passar.
- [X] T054 [P] [US4] Em `packages/web/src/components/reservas/calendario_barra_acoes.tsx` adicionar "Detalhes" (`Info`) até T051 passar.
- [X] T055 [US4] Em `packages/web/src/pages/app/reservas/calendario.tsx` remover o `Dialog` inline e os imports não usados, renderizar `ModalDetalhesReserva` controlado por `detalhesOpen` e ligar `onDetalhes` até T052 passar.

### E2E

- [ ] T056 [US4] TEST: Criar `packages/web/src/tests/reservas/calendario_detalhes_reserva.e2e.ts`: "Detalhes" desabilitado sem seleção; selecionar RES-0102 → "Detalhes" → dados reais ("Agência Sol", "R$ 980,50"); "Abrir reserva" navega para `/reservas/reserva-102`.

---

## Phase 7: User Story 5 - Tooltip rico (Priority: P2)

**Goal**: cartão de resumo no hover/foco.

**Independent Test**: spec.md US5.

### Tests (Red)

- [X] T057 [P] [US5] TEST: Criar `packages/web/src/components/reservas/reserva_resumo_card.spec.tsx`: RES-0102 mostra "RES-0102", "Confirmada", titular, hóspedes "Hóspede 1" e "Carlos Lima", "102" + categoria, camas "1 Casal", "2 adultos, 1 criança", regime, período com "2 diárias", "R$ 980,50", "Agência Sol", "FNRH 0 de 2 preenchidas"; sem observações → rótulo "Observações" ausente; com observações → texto com `line-clamp-6`; sem parceiro → "Parceiro" ausente; 0 crianças → "2 adultos" sem crianças; suíte sem camas → "Não informada".
- [X] T058 [P] [US5] TEST: Em `packages/web/src/components/reservas/reservation_cell.spec.tsx` adicionar: hover (user-event, timers avançados > 300 ms) mostra o cartão (`role="tooltip"` contendo o código); foco por teclado mostra; `tooltipDisabled` → nenhum tooltip; clique com o tooltip aberto chama `onSelect`.
- [X] T059 [P] [US5] TEST: Em `packages/web/src/components/reservas/calendar_day_cell.spec.tsx` adicionar: `isDragging` → as barras recebem `tooltipDisabled` (hover não mostra tooltip).

### Implementation (Green)

- [X] T060 [P] [US5] Implementar `packages/web/src/components/reservas/reserva_resumo_card.tsx` (usa `formatar_camas`, `rotulo_hospede`, BRL, datas `dd/MM/yyyy`) até T057 passar.
- [X] T061 [US5] Em `packages/web/src/components/reservas/reservation_cell.tsx` trocar o conteúdo do tooltip por `ReservaResumoCard` com `Tooltip delayDuration={300}`, `open={tooltipDisabled ? false : undefined}` e `TooltipContent className="w-80 max-w-[22rem] p-3 bg-popover text-popover-foreground border shadow-md"` até T058 passar.
- [X] T062 [US5] Em `packages/web/src/components/reservas/calendar_day_cell.tsx` adicionar a prop `isDragging` repassada como `tooltipDisabled`, e em `packages/web/src/pages/app/reservas/calendario.tsx` passar `isDragging` do `useCalendarRangeSelection`, até T059 passar.

### E2E

- [ ] T063 [US5] TEST: Criar `packages/web/src/tests/reservas/calendario_resumo_reserva.e2e.ts`: hover na barra de RES-0101 → tooltip com "1 Casal, 1 Solteiro", "2 adultos", "R$ 1.500,00", "Chegada tardia"; mover o ponteiro para fora → tooltip some; clicar com o tooltip aberto → `aria-pressed="true"`.

---

## Phase 8: User Story 6 - Cores de status e ícones (Priority: P2)

**Goal**: selo laranja de check-in nas listas, manutenção neutra, ícones confirmados.

**Independent Test**: spec.md US6.

### Tests (Red)

- [X] T064 [P] [US6] TEST: Criar `packages/web/src/components/reservas/reserva_status_badge.spec.tsx`: cada `ReservaStatus` renderiza o rótulo de `STATUS_RESERVA_LABEL`; `check_in` tem as classes `bg-status-checkin/10`, `text-status-checkin-foreground`, `border-status-checkin/40` e nenhuma classe `emerald`; os demais mantêm as classes atuais (amber, sky, muted, purple, destructive).
- [X] T065 [P] [US6] TEST: Em `packages/web/src/pages/app/reservas/index.spec.tsx` adicionar: linha de RES-0104 exibe o selo "Check-in" com `text-status-checkin-foreground`. Em `packages/web/src/pages/app/reservas/detalhe_fnrh_pendente.spec.tsx` adicionar: `/reservas/reserva-104` exibe o selo "Check-in" com a mesma classe.

### Implementation (Green)

- [X] T066 [P] [US6] Implementar `packages/web/src/components/reservas/reserva_status_badge.tsx` (extraído de `getStatusBadge`) até T064 passar.
- [X] T067 [US6] Substituir `getStatusBadge` por `ReservaStatusBadge` em `packages/web/src/pages/app/reservas/index.tsx` e `packages/web/src/pages/app/reservas/[id]/index.tsx`, removendo as funções duplicadas, até T065 passar.

### E2E

- [ ] T068 [US6] TEST: Criar `packages/web/src/tests/reservas/calendario_status_cores.e2e.ts`: no calendário, barra de RES-0104 com `data-status="check_in"` e cor de fundo computada diferente da barra `confirmada`; dot da 102 `data-status="checkin"` com tooltip "Check-in"; barra de ações com SVGs `lucide-calendar-plus`, `lucide-bell-ring`, `lucide-info` na ordem; em `/reservas` o selo "Check-in" visível com classe `text-status-checkin-foreground`.

---

## Phase 9: User Story 7 - Isolamento entre hotéis (Priority: P1)

Coberta por T005 e T006 (API: 404 cross-hotel sem alteração de dados) e por T030/T042 (web: corpo exatamente `{ status: 'check_in' }`). Sem tarefas adicionais.

---

## Phase 10: Polish & Cross-Cutting

- [X] T069 [P] Verificar com um conversor OKLCH→HEX os valores do brand-design-specialist usados em T001 e registrar os HEX como comentário ao lado de cada token em `packages/web/src/index.css` (os OKLCH continuam canônicos).
- [X] T070 Remover de `packages/web/src/pages/app/reservas/calendario.tsx` imports e estados mortos (`selectedReservation`, `Plus`, `Dialog*`, `RoomStatus` local) e confirmar que nenhum arquivo referencia `status_code` (`grep -rn status_code packages/web/src`).
- [ ] T071 Rodar apenas os specs desta feature (lista em `quickstart.md`) e os E2E `packages/web/src/tests/reservas/calendario_*.e2e.ts`; corrigir regressões.
- [X] T072 Rodar Biome: `pnpm biome check --write packages/web packages/api` e corrigir o que restar.
- [ ] T073 Validação manual de `quickstart.md` (temas claro/escuro, anel na primeira linha e nas colunas extremas).

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → stories. Dentro da Phase 2: T003 → T004 → (T005, T006 → T007) ∥ (T008 → T009) ∥ (T010-T014 → T015-T018 → T019).
- US1 (Phase 3) depende só da Phase 2.
- US2 depende de US1 (age sobre a reserva selecionada).
- US3 depende de US2 (estende o modal e o fluxo de check-in).
- US4 depende de US1 e de T038 (barra de ações criada na US2).
- US5 depende só da Phase 2 + T025/T026 (mesmos arquivos de célula); pode correr em paralelo a US2-US4 se coordenado nos arquivos `reservation_cell.tsx`/`calendar_day_cell.tsx`.
- US6 depende da Phase 1 (tokens); T066/T067 independentes do calendário.
- Dentro de cada história: TEST (Red) → produção (Green) → E2E.

## Parallel Examples

- Phase 2: T005 ∥ T006 ∥ T008 ∥ T010 ∥ T011 ∥ T012 ∥ T013 ∥ T014; depois T015 ∥ T016 ∥ T017.
- US2: T030 ∥ T031 ∥ T032 ∥ T033 ∥ T034; depois T036 ∥ T037 ∥ T038 ∥ T039 ∥ T040; depois T041.
- US6 em paralelo a US5: T064 ∥ T057.

## Implementation Strategy

1. MVP: Phase 1 + Phase 2 + US1 + US2 (seleção + check-in com tema laranja).
2. Incremento: US3 (FNRH), depois US4 (Detalhes, devolve o acesso aos detalhes removido na US1), US5 (tooltip), US6 (selos e manutenção).
3. Nota: entre US1 e US4 o modal de detalhes fica sem gatilho; se a entrega for parcial, entregar US4 junto com US1.

## Ownership Summary

- **qa-tester (TEST:)**: T005, T006, T008, T009, T010, T011, T012, T013, T014, T020, T021, T022, T023, T028, T029, T030, T031, T032, T033, T034, T035, T042, T043, T044, T045, T049, T050, T051, T052, T056, T057, T058, T059, T063, T064, T065, T068.
- **fullstack-specialist**: T001, T002, T003, T004, T007, T015, T016, T017, T018, T019, T024, T025, T026, T027, T036, T037, T038, T039, T040, T041, T046, T047, T048, T053, T054, T055, T060, T061, T062, T066, T067, T069, T070, T071, T072, T073.
