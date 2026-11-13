---
description: "Task list for 031-calendar-range-selection"
---

# Tasks: Seleção de Período por Arraste no Calendário e Nova Reserva em Modal

**Input**: Design documents from `specs/031-calendar-range-selection/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui_contracts.md, quickstart.md

**Tests**: TDD obrigatório (constituição + `CLAUDE.md`). Cada tarefa de teste vem antes da produção correspondente e DEVE falhar (Red) antes da implementação.

**Ownership**: tarefas cujo texto começa com **TEST:** escrevem testes, mocks MSW ou fixtures → `qa-tester`. As demais são produção → `fullstack-specialist`.

**Escopo de pacotes**: apenas `packages/web`. Sem mudanças em `packages/.contracts` (tipos `Reserva`, `CreateReservaPayload`, `QuartoDisponivel`, `ReservaConflitoErro` já existem) nem em `packages/api` (sem back-end, sem in-memory fakes nesta feature).

**Regras de teste**: MSW apenas (`server.use(...)` para cenários; nunca `vi.mock` de Axios/serviços nos specs novos); asserções por `getByRole`/`getByText`/`data-testid`/`data-selection`; relógio fixo em 2026-12-01 (`vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date(2026, 11, 1))`, no E2E `page.clock.setFixedTime(new Date(2026, 11, 1))`); rodar só os arquivos da tarefa (`pnpm exec vitest run <path>`).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (tokens e tipos)

- [X] T001 [P] Adicionar os tokens do brand-design-specialist em `packages/web/src/index.css`: em `:root` `--range-selection: oklch(0.85 0.07 230); --range-selection-border: oklch(0.5 0.13 230); --range-selection-foreground: var(--foreground);` e em `.dark` `--range-selection: oklch(0.4 0.08 230); --range-selection-border: oklch(0.7 0.11 230); --range-selection-foreground: var(--foreground);` (junto aos tokens `--status-*` existentes). Sem `--range-selection-strong` (removido na revisão "cor única").
- [X] T002 [P] Adicionar em `packages/web/tailwind.config.ts` (em `theme.extend.colors`) `'range-selection': { DEFAULT: withOpacity('--range-selection'), border: withOpacity('--range-selection-border'), foreground: withOpacity('--range-selection-foreground') }` (com o Vite rodando, reiniciar para regenerar as utilities).
- [X] T003 [P] Criar os tipos de view em `packages/web/src/types/calendar_range_selection.ts`: `CalendarRangeSelection { quarto_id: string; quarto_identificacao: string; anchor: string; focus: string }` (datas `AAAA-MM-DD`), `CellSelectionState = 'none' | 'start' | 'middle' | 'end'`, `NovaReservaValoresIniciais { check_in?: string; check_out?: string }`, `QuartoPreferido { id: string; identificacao: string }` (ver data-model.md).

---

## Phase 2: Foundational (mocks MSW e helpers puros)

**Bloqueia todas as user stories.**

- [X] T004 [P] TEST: Em `packages/web/src/mocks/quartos/quartos_handlers.ts` exportar `QUARTO_101_ID = '00000000-0000-4000-8000-000000000101'` e `QUARTO_102_ID = '00000000-0000-4000-8000-000000000102'` e usá-los no lugar de `'quarto-1'`/`'quarto-2'` (identificações `101`/`102` inalteradas).
- [X] T005 TEST: Em `packages/web/src/mocks/reservas/reservas_handlers.ts` (depende de T004): trocar `quarto_id`/`quarto.id` `'quarto-1'` por `QUARTO_101_ID`; adicionar `http.get(\`${BASE_URL}/reservas/disponibilidade\`)` retornando 101 e 102 (`categoria_id: 'categoria-1'`, `categoria_nome: 'Suíte Luxo'`, `limite_hospedes` 2 e 3, `valor_total: '900.00'`) e `http.post(\`${BASE_URL}/reservas\`)` retornando 201 com `Reserva` `id: 'reserva-nova'`, `codigo: 'RES-0002'`, status `a_confirmar`, ecoando `check_in`, `check_out`, `quarto_id`, `titular_nome` do corpo. A rota de disponibilidade DEVE ser declarada antes de qualquer `/reservas/:id`.
- [X] T006 [P] TEST: Criar `packages/web/src/mocks/regimes_alimentacao/regimes_alimentacao_handlers.ts` com `export const REGIME_PENSAO_COMPLETA_ID = '00000000-0000-4000-8000-0000000000a1'` e `http.get('http://localhost:3000/regimes_alimentacao')` retornando `{ data: [{ id: REGIME_PENSAO_COMPLETA_ID, titulo: 'Pensão Completa', ativo: true, cor_pulseira: '#10B981', ... }, { id: REGIME_MEIA_PENSAO_ID /* '00000000-0000-4000-8000-0000000000a2' */, titulo: 'Meia Pensão', ativo: true, ... }], meta }`; criar `packages/web/src/mocks/tarifarios/tarifarios_handlers.ts` (`make_tarifario`, `http.get('http://localhost:3000/tarifarios')` filtrando por `categoria_quarto_id` e `ativo=true`, com um único tarifário ativo de "Pensão Completa" para a categoria das suítes 101/102); registrar `regimes_alimentacao_handlers` e `tarifarios_handlers` em `packages/web/src/mocks/handlers.ts`.
- [X] T007 [P] TEST: Escrever `packages/web/src/lib/calendar_range_selection.spec.ts` (falhando) cobrindo: `to_iso_day` usa data local (`new Date(2026, 11, 1)` → `'2026-12-01'`); `normalize_range` ordena anchor/focus em ambos os sentidos; `is_valid_range` é `false` para mesmo dia e `true` para 2+ dias; `range_to_periodo` retorna `{ check_in: inicio, check_out: fim }`; `get_cell_selection_state` retorna `none` para outra suíte, fora do intervalo ou seleção `null`, `start`/`middle`/`end` nos dias corretos e `start` quando anchor = focus; `format_range_announcement` → `'Período selecionado: Suíte 101, de 20/12/2026 a 23/12/2026'`.
- [X] T008 Implementar `packages/web/src/lib/calendar_range_selection.ts` (funções puras `to_iso_day`, `normalize_range`, `is_valid_range`, `range_to_periodo`, `get_cell_selection_state`, `format_range_announcement`; comparação de strings ISO; constante nomeada para o formato) até T007 passar.

**Checkpoint**: mocks e helpers prontos.

---

## Phase 3: User Story 1 - Selecionar período por arraste na linha de uma suíte (P1)

**Goal**: arrastar marca D..D+n só na suíte de origem, com o destaque `range-selection`.

**Independent Test**: em `/reservas/calendario`, mousedown na área livre de 101 em 01/12, mouseenter em 04/12 (passando pela linha 102), mouseup → células 01..04/12 da 101 com `data-selection` `start`/`middle`/`middle`/`end`; nenhuma célula da 102 com `data-selection`.

### Tests (Red)

- [X] T009 [P] [US1] TEST: Escrever `packages/web/src/hooks/use_calendar_range_selection.spec.tsx` (parte de arraste, com `renderHook` e refs de elementos reais no `document`): `startDrag` cria seleção com `anchor = focus` e `isDragging = true`; `extendDrag` atualiza `focus` e mantém `quarto_id` mesmo se chamado após passar por outra linha; `extendDrag` sem arraste ativo é ignorado; `mouseup` na `window` finaliza (`isDragging = false`); `mouseup` com 1 dia descarta (`selection = null`); novo `startDrag` substitui seleção anterior; `getCellState` delega ao helper.
- [X] T010 [P] [US1] TEST: Em `packages/web/src/components/reservas/reservation_cell.spec.tsx` adicionar caso: `mouseDown` na barra não propaga para um `onMouseDown` do elemento pai, e `click` continua chamando `onSelect`; a barra (`role="button"`) tem `cursor-pointer` (FR-019).
- [X] T011 [P] [US1] TEST: Escrever `packages/web/src/components/reservas/calendar_day_cell.spec.tsx` (renderizado dentro de `<table><tbody><tr>`): `data-testid="calendar-day-cell-{quarto.id}-{AAAA-MM-DD}"`; sem `data-selection` quando `none`; overlay `aria-hidden` primeiro filho do contêiner com `inset-0 bg-range-selection` (`middle`), `top-0 h-8 right-0 w-1/3 bg-range-selection rounded-l` (`start`) e `top-0 h-8 left-0 w-1/3 bg-range-selection rounded-r` (`end`), mesma cor nos três estados (nunca `bg-range-selection-strong`), sem classes `ring` (geometria igual à barra de `reservation_cell.tsx`); o `td` não recebe classes de cor de seleção nem `cursor-pointer` (com ou sem reservas, FR-019); `mouseDown` com `button: 0` chama `onRangeStart({ id, identificacao }, 'AAAA-MM-DD')`; `button: 2` não chama; `mouseEnter` chama `onRangeExtend`; `mouseDown` sobre a barra de reserva não chama `onRangeStart` e o clique chama `onSelectReservation`; barras continuam renderizadas acima (ordem: overlay, intermediárias, check-out, check-in).
- [X] T012 [P] [US1] TEST: Criar `packages/web/src/pages/app/reservas/calendario_selecao.spec.tsx` (MSW, `QueryClientProvider` + `MemoryRouter`, relógio fixo) com cenários US1 1-7 da spec: arraste 01→04/12 na 101; travamento de linha passando por células da 102; arraste para trás 06→03/12 normalizado; `mouseup` disparado na `window` fora da tabela finaliza; mousedown/mouseup na mesma célula não deixa seleção; clique na barra da reserva RES-0001 (101, 20-22/12 após navegar) abre "Detalhes da Reserva" sem `data-selection`; nova seleção na 102 substitui a da 101; região `role="status"` anuncia "Período selecionado: Suíte 101, de 01/12/2026 a 04/12/2026".

### Implementation (Green)

- [X] T013 [US1] Implementar a parte de arraste de `packages/web/src/hooks/use_calendar_range_selection.ts` conforme `contracts/ui_contracts.md` (`selection`, `isDragging`, `startDrag`, `extendDrag`, `clear`, `getCellState`; listener de `mouseup` na `window` só durante o arraste, removido no cleanup) até T009 passar.
- [X] T014 [P] [US1] Adicionar `onMouseDown={e => e.stopPropagation()}` ao elemento `role="button"` em `packages/web/src/components/reservas/reservation_cell.tsx` até T010 passar.
- [X] T015 [US1] Criar `packages/web/src/components/reservas/calendar_day_cell.tsx` movendo para ele o `<td>` de dia de `calendario.tsx` (contêiner `relative w-full h-8 isolate`, barras na mesma ordem), com overlay de seleção, `data-selection`, `onMouseDown` (constante `PRIMARY_MOUSE_BUTTON = 0`, `preventDefault`) e `onMouseEnter`, até T011 passar.
- [X] T016 [US1] Integrar em `packages/web/src/pages/app/reservas/calendario.tsx`: usar `useCalendarRangeSelection` (com `regionRefs` da grade e da barra de ações, `paused` ainda `false`), renderizar `CalendarDayCell` por dia com `selectionState = getCellState(room.id, to_iso_day(day))`, `select-none` no contêiner da grade durante `isDragging`, região `<div role="status" className="sr-only">` com `format_range_announcement(selection)`; manter todos os comportamentos atuais (`calendario.spec.tsx` sem alterações deve continuar verde). Rodar T012 (cenários US1) até passar.

### E2E

- [X] T017 [US1] TEST: Criar `packages/web/src/tests/reservas/calendario_selecao.e2e.ts` com `login_as_staff`, `page.clock.setFixedTime(new Date(2026, 11, 1))` e teste "seleciona período por arraste apenas na linha da suíte": `page.mouse` move/down na célula `calendar-day-cell-{QUARTO_101_ID}-2026-12-01`, move até a célula da 102 em 2026-12-04, up → células 01..04 da 101 com `data-selection`, nenhuma da 102. Inclui o bloco "US1 - cor uniforme e cursor": overlays de início, meio e fim com a mesma cor computada; `td` sem cursor `pointer` e barra de reserva com cursor `pointer` (US1-8, FR-019).

**Checkpoint**: US1 entregue e testável sozinha.

---

## Phase 4: User Story 2 - Remover a seleção ao clicar fora (P1)

**Goal**: clique fora da região (grade + barra de ações), Esc ou navegação de datas limpam; clique em "Nova Reserva" e interação no modal não limpam.

**Independent Test**: com seleção ativa, clicar na barra lateral ou em "Próximo dia" → nenhuma célula com `data-selection`; clicar no botão "Nova Reserva" → seleção permanece.

### Tests (Red)

- [X] T018 [P] [US2] TEST: Ampliar `packages/web/src/hooks/use_calendar_range_selection.spec.tsx`: `mousedown` no `document.body` fora das refs limpa; `mousedown` dentro de qualquer ref não limpa; `keydown` `Escape` limpa; com `paused: true` nem clique fora nem Esc limpam; listeners removidos no unmount (spy em `removeEventListener`).
- [X] T019 [P] [US2] TEST: Em `packages/web/src/pages/app/reservas/calendario_selecao.spec.tsx` adicionar cenários US2 1, 2, 3 e 5: clique (mousedown) num elemento fora da página do calendário limpa; "Dia anterior", "Próximo dia", "Voltar 15 dias", "Avançar 15 dias" e escolha de mês no popover limpam; clique no botão "Nova Reserva" mantém `data-selection`; Esc limpa; com o modal "Detalhes da Reserva" aberto, Esc fecha o modal mas não limpa a seleção.

### Implementation (Green)

- [X] T020 [US2] Implementar em `packages/web/src/hooks/use_calendar_range_selection.ts` os listeners `mousedown` no `document` (ignora alvos contidos em `regionRefs`) e `keydown` Esc, ambos ativos só com `paused === false`, até T018 passar.
- [X] T021 [US2] Em `packages/web/src/pages/app/reservas/calendario.tsx`: chamar `clear()` em `handlePreviousDay`, `handleNextDay`, `handlePreviousWeek`, `handleNextWeek` e `handleSelectMonthYear`; passar `paused = selectedReservation !== null` (o modal de nova reserva entra em T034); anexar as refs ao contêiner da grade e à barra de ações inferior. Rodar T019 até passar.

### E2E

- [X] T022 [US2] TEST: Em `packages/web/src/tests/reservas/calendario_selecao.e2e.ts` adicionar "remove a seleção ao clicar fora do calendário": selecionar por arraste, clicar no título "Calendário" → sem `data-selection`; selecionar de novo, clicar em "Próximo dia" → sem `data-selection`.

**Checkpoint**: US1 + US2 funcionam juntas.

---

## Phase 5: User Story 3 - Criar reserva em modal a partir da seleção (P1)

**Goal**: "Nova Reserva" abre modal grande (rolagem com barra oculta) com o mesmo formulário de `/reservas/nova`, pré-preenchido e com os regimes restritos à suíte preferida quando houver; sucesso fecha, limpa e recarrega.

**Independent Test**: selecionar 01→04/12 na 101, clicar em "Nova Reserva", ver check-in 01/12/2026 e check-out 04/12/2026, "Pensão Completa" já com "Selecionado ✓" e "Suíte 101" marcada sem nenhum clique (FR-026), preencher "Nome Completo *", "Salvar" → toast "Reserva RES-0002 cadastrada com sucesso!", modal fecha, sem `data-selection`.

### Tests (Red)

- [X] T023 [P] [US3] TEST: Escrever `packages/web/src/hooks/use_nova_reserva_opcoes.spec.tsx` (MSW): retorna `regimes` e `parceiros`; `podeConsultar` falso sem datas válidas, regime ou pessoas; com critérios completos chama `GET /reservas/disponibilidade` com `check_in`, `check_out`, `regime_alimentacao_id`, `pessoas`, `parceiro_id` e retorna `disponiveis`. Regimes da suíte preferida (FR-020 a FR-022): com `quartoPreferidoId` retorna só os regimes vendidos para a categoria da suíte (`GET /tarifarios` com `categoria_quarto_id`, `ativo=true`, `limite=250`), cada regime uma vez mesmo com vários tarifários, `[]` quando a categoria não tem tarifário; sem `quartoPreferidoId` retorna todos os regimes ativos e nunca chama `/tarifarios`; nenhuma requisição envia `hotel_id`. Estados de carregamento e erro (FR-021/FR-025): `carregandoRegimes` `true` e `regimes` `[]` enquanto a lista de regimes está pendente (com e sem suíte) e, com suíte, enquanto `/quartos` ou `/tarifarios` estão pendentes (nunca expõe a lista completa durante `/quartos`); sem suíte, uma lista de regimes atrasada termina com todos os regimes; `erroRegimes` `true` e `regimes` `[]` quando `/regimes_alimentacao` falha (com e sem suíte) ou, com suíte, quando `/quartos` ou `/tarifarios` falham; fallback para todos os regimes ativos só quando a suíte está ausente de uma resposta bem-sucedida de `/quartos`; nenhum erro no caminho feliz.
- [X] T024 [P] [US3] TEST: Escrever `packages/web/src/hooks/use_nova_reserva_form.spec.tsx` (MSW, `renderHook`, `Toaster` ou spy em `sonner`): `valoresIniciais` mesclados sobre os padrões (`quantidade_adultos: 2`); submit válido envia o mesmo payload de hoje (telefone desmascarado, `parceiro_comercial_id` `null` para vazio/`'direta'`, `cupom_desconto` trim ou `null`) **sem `hotel_id`**, chama `toast.success('Reserva RES-0002 cadastrada com sucesso!')`, invalida `['reservas']` e chama `onSuccess(reserva)`; 409 preenche `conflito` com `message`/`alternativas` (fallback "A suíte selecionada já possui reserva no período."); 500 chama `toast.error` com a mensagem da API ou "Erro ao cadastrar reserva." e não chama `onSuccess`; `selecionarAlternativa` define `quarto_id`, fecha o conflito e chama `toast.info('Suíte 102 selecionada como alternativa.')`.
- [X] T025 [P] [US3] TEST: Escrever `packages/web/src/components/reservas/nova_reserva_form_fields.spec.tsx` (MSW; harness que usa `useNovaReservaForm` e renderiza `<form>` + campos): renderiza os títulos "Passo 1: Período e Hóspedes", "Passo 2: Parceiro Comercial", "Passo 3: Regime de Alimentação", "Cupom de Desconto", "Passo 4: Acomodação (Suítes Disponíveis pelo Tarifário)", "Passo 5: Dados do Titular da Reserva" e os rótulos "Data de Check-in *", "Data de Check-out *", "Adultos *", "Crianças", "Pets (opcional)", "Nome Completo *", "Celular / WhatsApp *", "E-mail"; com `quartoPreferido` 101 e regime marcado, "Suíte 101" fica selecionada automaticamente; com `quartoPreferido` ausente da disponibilidade (`server.use` retornando só 102) mostra `role="status"` "A suíte 101 não está disponível para os critérios informados. Escolha outra suíte." e nenhuma suíte marcada; se o operador escolher a 102, a preferida não sobrescreve; sem `quartoPreferido` nenhum aviso; não renderiza `<form>` nem botões de ação próprios. Regimes (FR-020 a FR-023): com período e `quartoPreferido` mostra só "Pensão Completa", exibe "Consultando regimes disponíveis para a suíte..." sem piscar a lista completa durante a consulta e "Nenhum regime de alimentação disponível para esta suíte." quando a suíte não tem regime; sem período e sem suíte mostra todos os regimes ativos antes de qualquer data, carrega as suítes só depois de datas e regime e nunca chama `/tarifarios`. Carregamento/erro (FR-021/FR-022/FR-025): texto "Consultando regimes disponíveis para a suíte..." (com suíte) ou "Consultando regimes disponíveis..." (sem); a lista aparece após uma consulta de regimes atrasada (sem suíte); nunca mostra a lista completa enquanto `/quartos` carrega nem a mensagem de vazio enquanto `/tarifarios` carrega; erro em `/regimes_alimentacao` (ou, com suíte, `/quartos`/`/tarifarios`) mostra `role="alert"` "Não foi possível carregar os regimes de alimentação." sem lista e sem mensagem de vazio. Pré-seleção (FR-026 a FR-028): com período e suíte, marca o primeiro regime ("Selecionado ✓") e a "Suíte 101" sem nenhum clique; sem suíte ou sem período não pré-seleciona nada e não consulta a disponibilidade; categoria sem regime não pré-seleciona; erro nos regimes não pré-seleciona; a escolha posterior do operador é mantida (suíte re-marcada) e o primeiro regime não é re-aplicado.
- [X] T026 [P] [US3] TEST: Escrever `packages/web/src/components/reservas/modal_nova_reserva.spec.tsx` (MSW): com `open` renderiza `dialog` "Nova Reserva" com classes `max-w-6xl` e `max-h-[90vh]`, botões "Salvar" e "Cancelar"; o dialog mantém `overflow-y-auto` e tem `scrollbar-none` (rolagem preservada, barra oculta, FR-024); `valoresIniciais` aparecem nos campos de data (01/12/2026, 04/12/2026); "Cancelar" chama `onOpenChange(false)` sem request; submit inválido aberto **sem** `quartoPreferido` (sem pré-seleção) mostra "Selecione um regime de alimentação." e "Selecione uma suíte disponível." sem POST; aberto com `quartoPreferido` e período, vem com o primeiro regime e a suíte marcados (Salvar só acusa o titular) e salvar sem escolher regime/suíte envia `regime_alimentacao_id` do primeiro regime e `quarto_id` da 101 sem `hotel_id` (FR-026); fluxo válido chama `onCreated` com `codigo: 'RES-0002'`; 409 abre o modal de conflito sobre o dialog; 500 mantém o dialog aberto; reabrir após fechar mostra formulário limpo.
- [X] T027 [P] [US3] TEST: Em `packages/web/src/pages/app/reservas/calendario_selecao.spec.tsx` adicionar cenários US3 1, 2, 4, 8 e 9: com seleção 01→04/12 na 101, "Nova Reserva" abre o dialog com as datas; logo após abrir, sem clique, "Pensão Completa" tem "Selecionado ✓" e "Suíte 101" está marcada; clicar em "Pensão Completa" mantém "Suíte 101" marcada; sem seleção, nada vem pré-selecionado; salvar → toast de sucesso, dialog fechado, sem `data-selection` e `GET /reservas` chamado de novo; "Cancelar", Esc e o botão X fecham e mantêm `data-selection` (FR-016); desmontar e remontar a página não restaura a seleção e nada é gravado em URL/`localStorage`/`sessionStorage` (FR-006, US2 cenário 6); sem seleção, "Nova Reserva" abre o dialog com datas vazias; clique dentro do dialog não limpa a seleção.
- [X] T028 [P] [US3] TEST: Confirmar a rede de segurança da página: rodar `packages/web/src/pages/app/reservas/nova.spec.tsx` antes da refatoração (verde) e acrescentar caso que garanta que, após salvar, a página navega para `/reservas/{id}` (US3 cenário 10 / FR-017), sem alterar as asserções existentes.

### Implementation (Green)

- [X] T029 [P] [US3] Criar `packages/web/src/hooks/use_nova_reserva_opcoes.ts` movendo de `nova.tsx` as queries `regimes_alimentacao_ativos`, `parceiros_comerciais_ativos` e `reservas_disponibilidade` (mesmos parâmetros e `enabled`), e adicionar `quartoPreferidoId?` com as queries `['quartos','para_regimes','lista']` (`GET /quartos`, `limite=250`) e `['tarifarios','ativos_da_categoria', categoriaId]` (`GET /tarifarios`) para filtrar os regimes pela categoria da suíte, retornando `carregandoRegimes` (regimes pendentes em qualquer caso; com suíte, também `/quartos`/`/tarifarios` pendentes) e `erroRegimes` (falha fechada), com `regimes` `[]` em ambos e fallback para todos os regimes ativos só se a suíte estiver ausente de uma resposta bem-sucedida de `/quartos`, até T023 passar.
- [X] T030 [P] [US3] Criar `packages/web/src/hooks/use_nova_reserva_form.ts` movendo de `nova.tsx` o `useForm` (zodResolver `novaReservaFormSchema`, padrões atuais + `valoresIniciais`), a `useMutation` (mesmo mapeamento de payload), a invalidação de `['reservas']`, toasts e o estado de conflito 409, com `onSuccess` injetado, até T024 passar.
- [X] T031 [US3] Criar `packages/web/src/components/reservas/nova_reserva_form_fields.tsx` movendo de `nova.tsx` os inputs ocultos, todas as seções, o resumo e o `ModalConflitoReserva` (textos idênticos), usando `useNovaReservaOpcoes`; adicionar prop `quartoPreferido` com o efeito de auto-seleção e o aviso (research R6), passando `quartoPreferido?.id` como `quartoPreferidoId` ao hook; Passo 3 sempre visível (mesmo sem datas), com texto de carregamento com/sem suíte, bloco `role="alert"` de erro, mensagens de vazio com/sem suíte só após carga bem-sucedida e texto de apoio sem "para este período" (research R9/R10); efeito com flag `useRef` que pré-seleciona `regimes[0]` uma vez com suíte preferida e período válido (research R11), até T025 passar.
- [X] T032 [US3] Refatorar `packages/web/src/pages/app/reservas/nova.tsx` para `CrudFormLayout` + `useNovaReservaForm({ onSuccess: r => navigate(\`/reservas/${r.id}\`) })` + `NovaReservaFormFields`; mesmos `title`, `backTo`, `submitLabel`, `isSubmitting`. T028 e `nova.spec.tsx` DEVEM continuar verdes.
- [X] T033 [US3] Criar `packages/web/src/components/reservas/modal_nova_reserva.tsx` (`Dialog` + `DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-none"`, com a utility `.scrollbar-none` em `packages/web/src/index.css` sob `@layer utilities`, `DialogTitle` "Nova Reserva", `DialogDescription`, conteúdo montado só com `open` (cada abertura remonta o formulário e reinicia a pré-seleção do primeiro regime), `<form onSubmit={controller.onSubmit}>`, rodapé `flex justify-end gap-3 [&>button]:min-w-[140px]` com "Cancelar" outline e `SaveButton` "Salvar"), até T026 passar.
- [X] T034 [US3] Em `packages/web/src/pages/app/reservas/calendario.tsx`: estado `novaReservaOpen`; `onClick` no botão "Nova Reserva" da barra de ações; renderizar `ModalNovaReserva` com `valoresIniciais = selection ? range_to_periodo(selection) : undefined` e `quartoPreferido = selection ? { id: selection.quarto_id, identificacao: selection.quarto_identificacao } : undefined`; `onCreated` fecha o modal e chama `clear()`; `paused = novaReservaOpen || selectedReservation !== null`. Rodar T027 até passar.

### E2E

- [X] T035 [US3] TEST: Em `packages/web/src/tests/reservas/calendario_selecao.e2e.ts` adicionar "cria reserva pelo modal a partir da seleção": arrastar 01→04/12 na 101, clicar "Nova Reserva", conferir datas, clicar "Pensão Completa" (funciona com o regime já pré-selecionado: re-marca a suíte), conferir "Suíte 101" selecionada, preencher "Nome Completo *", "Salvar" → toast "Reserva RES-0002 cadastrada com sucesso!", dialog fechado, sem `data-selection`. Inclui o bloco "US3 - regime e suíte pré-selecionados no modal": com seleção, abre com "Pensão Completa" em "Selecionado ✓" e "Proposta selecionada: Suíte 101", salva só com o titular e o POST leva `regime_alimentacao_id` = `REGIME_PENSAO_COMPLETA_ID`, `quarto_id` = `QUARTO_101_ID`, sem `hotel_id`; sem seleção, nenhum "Selecionado ✓" nem proposta. E o bloco "Regimes do modal e rolagem": com seleção mostra apenas os regimes da suíte; sem seleção mostra todos os regimes; esconde a barra de rolagem do modal mantendo a rolagem; não envia `hotel_id` ao carregar os regimes da suíte (`/tarifarios` consultado).

**Checkpoint**: US1-US3 completas.

---

## Phase 6: User Story 4 - Isolamento entre hotéis (P1)

**Goal**: provar que o fluxo do modal não envia `hotel_id` e só usa suítes da disponibilidade do hotel logado.

**Independent Test**: interceptar `POST /reservas` e verificar ausência de `hotel_id` e `quarto_id` = suíte da disponibilidade; suíte preferida fora da disponibilidade não é marcada.

- [X] T036 [P] [US4] TEST: Em `packages/web/src/pages/app/reservas/calendario_selecao.spec.tsx` adicionar "isolamento entre hotéis": capturar o corpo do `POST /reservas` via `server.use` e afirmar `expect(body).not.toHaveProperty('hotel_id')` e `body.quarto_id === QUARTO_101_ID`; com `server.use` fazendo `GET /reservas/disponibilidade` retornar apenas uma suíte de outro id (simulando que a 101 não pertence ao escopo), afirmar aviso "A suíte 101 não está disponível..." e nenhuma suíte marcada.
- [X] T037 [US4] TEST: Em `packages/web/src/tests/reservas/calendario_selecao.e2e.ts` adicionar "não envia hotel_id ao criar pelo modal": `page.waitForRequest` em `POST **/reservas` e afirmar que `request.postDataJSON()` não tem `hotel_id`.
- [X] T038 [US4] Se T036/T037 falharem, corrigir em `packages/web/src/hooks/use_nova_reserva_form.ts` (payload) ou `packages/web/src/components/reservas/nova_reserva_form_fields.tsx` (auto-seleção); caso contrário, nenhuma mudança de produção (registrar "sem alterações" no PR).

---

## Phase 7: Polish & Cross-Cutting

- [ ] T039 TEST: Rodar as specs de regressão sem alterar asserções: `packages/web/src/pages/app/reservas/calendario.spec.tsx`, `packages/web/src/pages/app/reservas/nova.spec.tsx`, `packages/web/src/components/reservas/reservation_cell.spec.tsx` e `packages/web/src/tests/reservas/reservas.e2e.ts` (o E2E existente usa textos `101`/`102`, que não mudam).
- [X] T040 Rodar Biome em `packages/web` (`pnpm biome check --write packages/web`) e corrigir os avisos restantes nos arquivos tocados (`calendario.tsx`, `nova.tsx`, novos componentes, hooks, lib, mocks, specs).
- [ ] T041 Executar a validação manual de `specs/031-calendar-range-selection/quickstart.md` (inclui tema escuro, SC-004).

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 → US3 → US4 → Polish.
- US2 depende de US1 (mesmo hook e página). US3 depende de US1/US2 apenas para o pré-preenchimento e o `paused`; as tarefas T023-T033 (hooks, campos, modal, refatoração da página) podem começar logo após a Phase 2 em paralelo com US1/US2. US4 depende de US3.
- Dentro de cada story: TEST (Red) → produção (Green) → E2E.
- Arquivos compartilhados que impedem paralelismo: `calendario.tsx` (T016, T021, T034), `calendario_selecao.spec.tsx` (T012, T019, T027, T036), `use_calendar_range_selection.ts`/`.spec.tsx` (T009/T018, T013/T020), `calendario_selecao.e2e.ts` (T017, T022, T035, T037).

## Parallel Examples

- Phase 1: T001, T002, T003 juntos.
- Phase 2: T004, T006, T007 juntos; depois T005 e T008.
- US1 testes: T009, T010, T011, T012 juntos; produção T014 em paralelo com T013.
- US3 testes: T023, T024, T025, T026, T027, T028 juntos; produção T029 e T030 juntos.

## Implementation Strategy

1. MVP = Phases 1-2 + US1 (seleção visual) + US2 (limpeza): entrega a interação pedida sem risco ao formulário.
2. Incremento 2 = US3: extração do formulário (protegida por `nova.spec.tsx`) e modal.
3. Incremento 3 = US4 (prova de isolamento) + Polish.

## Ownership Summary

- **qa-tester (TEST:)**: T004, T005, T006, T007, T009, T010, T011, T012, T017, T018, T019, T022, T023, T024, T025, T026, T027, T028, T035, T036, T037, T039.
- **fullstack-specialist (produção)**: T001, T002, T003, T008, T013, T014, T015, T016, T020, T021, T029, T030, T031, T032, T033, T034, T038, T040, T041.
