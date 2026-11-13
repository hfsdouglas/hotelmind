# UI Contracts: 031-calendar-range-selection

Contratos internos do `packages/web` (props/retornos). Nenhum contrato HTTP novo;
endpoints consumidos sem alteração: `GET /reservas/disponibilidade`,
`POST /reservas` (409 → `ReservaConflitoErro`), `GET /regimes_alimentacao`,
`GET /comercial/parceiros`, `GET /quartos` e `GET /tarifarios` (os dois últimos só
para resolver os regimes da suíte preferida). Tipos compartilhados vêm de `@hotelmind/contracts`.

## `useCalendarRangeSelection` (`src/hooks/use_calendar_range_selection.ts`)

```ts
useCalendarRangeSelection(options: {
  regionRefs: ReadonlyArray<RefObject<HTMLElement | null>> // grade + barra de ações
  paused: boolean                                           // true com modal aberto
}): {
  selection: CalendarRangeSelection | null
  isDragging: boolean
  startDrag(quarto: { id: string; identificacao: string }, dia: string): void
  extendDrag(dia: string): void
  clear(): void
  getCellState(quarto_id: string, dia: string): CellSelectionState
}
```

Comportamento obrigatório:
- registra `mouseup` na `window` enquanto `isDragging` (finaliza; descarta 1 dia);
- registra `mousedown` no `document` e `keydown` (Esc) quando `!paused`; alvo dentro de qualquer `regionRefs` não limpa;
- remove todos os listeners no unmount.

## `CalendarDayCell` (`src/components/reservas/calendar_day_cell.tsx`)

```ts
interface CalendarDayCellProps {
  quarto: { id: string; numero: string }
  day: Date
  reservationsIntermediate: Reservation[]
  reservationsForCheckOut: Reservation[]
  reservationsForCheckIn: Reservation[]
  selectionState: CellSelectionState
  onSelectReservation(reservation: Reservation): void
  onRangeStart(quarto: { id: string; identificacao: string }, dia: string): void
  onRangeExtend(dia: string): void
}
```

- Renderiza `<td data-testid="calendar-day-cell-{quarto.id}-{AAAA-MM-DD}" data-selection={state !== 'none' ? state : undefined}>`.
- `onMouseDown` só com `button === 0` → `preventDefault()` (evita seleção de texto) + `onRangeStart`.
- `onMouseEnter` → `onRangeExtend` (o hook ignora se não estiver arrastando).
- O `td` não tem `cursor-pointer` (com ou sem reservas); a área livre mantém o cursor padrão (FR-019).
- Overlay de seleção conforme tabela do plan.md, sempre com a mesma cor `bg-range-selection` em `start`, `middle` e `end` (nenhum tom `-strong`/`-border`) (`middle` célula inteira; `start` parte direita e `end` parte esquerda com a mesma geometria da barra de reserva de `reservation_cell.tsx`, sem contorno), `aria-hidden`, `pointer-events-none`, `z-0`, primeiro filho do contêiner `relative w-full h-8 isolate`; barras de reserva na mesma ordem atual, por cima.

## `ReservationCell` (alteração)

- `onMouseDown={e => e.stopPropagation()}` no elemento `role="button"`.
- O elemento `role="button"` (a barra) é o único com `cursor-pointer` na célula de dia (FR-019).

## `useNovaReservaOpcoes` (`src/hooks/use_nova_reserva_opcoes.ts`)

```ts
useNovaReservaOpcoes(criterios: {
  checkIn: string; checkOut: string; regimeId: string; totalPessoas: number; parceiroId: string
  quartoPreferidoId?: string
}): {
  regimes: RegimeAlimentacao[]
  carregandoRegimes: boolean
  erroRegimes: boolean
  parceiros: ParceiroComercial[]
  disponiveis: QuartoDisponivel[]
  podeConsultar: boolean
  carregandoDisponibilidade: boolean
}
```

Mesmas query keys e parâmetros de hoje (`regimes_alimentacao_ativos`, `parceiros_comerciais_ativos`, `reservas_disponibilidade`), mais, só com `quartoPreferidoId` (FR-020/FR-021):

- `['quartos', 'para_regimes', 'lista']` → `GET /quartos?limite=250`, habilitada só com `quartoPreferidoId`; a categoria é o `categoria_id` da suíte com `id === quartoPreferidoId`.
- `['tarifarios', 'ativos_da_categoria', categoriaId]` → `GET /tarifarios?categoria_quarto_id={categoriaId}&ativo=true&limite=250`, habilitada só com a categoria resolvida. (Keys com prefixo de domínio: invalidar `['quartos']`/`['tarifarios']` as atinge.)
- `regimes` = regimes ativos cujo `id` aparece (distinto) em `regime_alimentacao_id` desses tarifários (inclui tarifários de parceiros); lista vazia se nenhum.
- `erroRegimes` = `true` se `GET /regimes_alimentacao` falhar ou, com `quartoPreferidoId`, se `GET /quartos` ou `GET /tarifarios` falharem (falha fechada, FR-025).
- `carregandoRegimes` = `!erroRegimes && (regimes ativos pendentes || (com suíte && (/quartos pendente || (categoria resolvida && /tarifarios pendente))))`. Vale para os dois casos (com e sem suíte), FR-021.
- `regimes` = `[]` sempre que `carregandoRegimes` ou `erroRegimes` for `true`; consumidores distinguem carregando, erro e vazio-após-sucesso pelas duas flags.
- Categoria não resolvida numa resposta **bem-sucedida** de `/quartos` (suíte fora das primeiras 250) → `regimes` = todos os regimes ativos (fallback), `carregandoRegimes = false`, `erroRegimes = false`.
- Sem `quartoPreferidoId`: `/quartos` e `/tarifarios` nunca são chamados; `regimes` = todos os ativos após a carga; `carregandoRegimes` só reflete a lista de regimes; `erroRegimes` só reflete `/regimes_alimentacao`.
- Período (`checkIn`/`checkOut`) não influencia `regimes`. Nenhuma requisição envia `hotel_id`.

## `useNovaReservaForm` (`src/hooks/use_nova_reserva_form.ts`)

```ts
useNovaReservaForm(options: {
  valoresIniciais?: NovaReservaValoresIniciais
  onSuccess(reserva: Reserva): void
}): {
  form: UseFormReturn<NovaReservaFormData>
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
  isPending: boolean
  conflito: { open: boolean; mensagem: string; alternativas: QuartoDisponivel[] }
  fecharConflito(): void
  selecionarAlternativa(alternativa: QuartoDisponivel): void
}
```

- Sucesso: invalida `['reservas']`, `toast.success("Reserva {codigo} cadastrada com sucesso!")`, chama `onSuccess`.
- 409: abre `conflito` com `message`/`alternativas` (fallback "A suíte selecionada já possui reserva no período.").
- Outros erros: `toast.error(message ?? 'Erro ao cadastrar reserva.')`.
- `selecionarAlternativa`: `setValue('quarto_id', alt.quarto_id)`, fecha, `toast.info("Suíte {identificacao} selecionada como alternativa.")`.

## `NovaReservaFormFields` (`src/components/reservas/nova_reserva_form_fields.tsx`)

```ts
interface NovaReservaFormFieldsProps {
  controller: ReturnType<typeof useNovaReservaForm>
  quartoPreferido?: QuartoPreferido
}
```

- Renderiza inputs ocultos, Passo 1 a Passo 5, Cupom, resumo e `ModalConflitoReserva`, com os mesmos textos de `nova.tsx` atual.
- Suíte preferida (research R6) e aviso `role="status"`: "A suíte {identificacao} não está disponível para os critérios informados. Escolha outra suíte."
- Não renderiza `<form>` nem botões de ação.
- Passa `quartoPreferidoId: quartoPreferido?.id` para `useNovaReservaOpcoes`.
- Passo 3 (regimes), sempre visível, inclusive antes das datas (FR-023), com precedência nesta ordem:
  - `carregandoRegimes` → texto "Consultando regimes disponíveis para a suíte..." (com `quartoPreferido`) ou "Consultando regimes disponíveis..." (sem) (FR-021);
  - `erroRegimes` → bloco `role="alert"` "Não foi possível carregar os regimes de alimentação." (FR-025);
  - `regimes.length === 0` (só após carga bem-sucedida) → "Nenhum regime de alimentação disponível para esta suíte." (com `quartoPreferido`) ou "Nenhum regime de alimentação ativo cadastrado." (sem);
  - senão, texto de apoio "Selecione o plano de refeições desejado para carregar as acomodações com tarifários vigentes:" e a grade de cards; o card marcado exibe "Selecionado ✓"; clicar num card faz `setValue('regime_alimentacao_id', id, { shouldValidate: true })` e `setValue('quarto_id', '', { shouldValidate: true })`.
- Pré-seleção do primeiro regime (FR-026 a FR-028, research R11): `useEffect` com flag `useRef(false)`; quando a flag está desligada, há `quartoPreferido`, `checkIn && checkOut && checkIn < checkOut`, `!carregandoRegimes && !erroRegimes`, `regimes[0]` existe e `regime_alimentacao_id` está vazio → `setValue('regime_alimentacao_id', regimes[0].id, { shouldValidate: true })` e liga a flag (uma vez por formulário montado = uma vez por abertura do modal). Não toca em `quarto_id`; a suíte preferida é marcada pelo efeito de R6 depois da disponibilidade. Nunca roda sem suíte preferida, sem período válido, com lista vazia, carregando ou em erro.
- Passo 4 inalterado: suítes vêm de `GET /reservas/disponibilidade` quando `podeConsultar`.

## `ModalNovaReserva` (`src/components/reservas/modal_nova_reserva.tsx`)

```ts
interface ModalNovaReservaProps {
  open: boolean
  onOpenChange(open: boolean): void
  valoresIniciais?: NovaReservaValoresIniciais
  quartoPreferido?: QuartoPreferido
  onCreated(reserva: Reserva): void
}
```

- Conteúdo do form montado só com `open === true` (estado novo a cada abertura; também reinicia a flag de pré-seleção do primeiro regime).
- `DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-none"`: rola verticalmente com a barra oculta (FR-024). `.scrollbar-none` vive em `src/index.css` sob `@layer utilities` (`scrollbar-width: none; -ms-overflow-style: none;` e `::-webkit-scrollbar { display: none; }`).
- `DialogTitle` "Nova Reserva"; `<form onSubmit={controller.onSubmit}>`; botões "Cancelar" (`type="button"`, fecha) e `SaveButton` "Salvar" (`isPending`).

## Página do calendário (`calendario.tsx`)

- Refs: contêiner da grade (`div.flex-1.overflow-auto`) e barra de ações inferior.
- Botão "Nova Reserva": `onClick` abre `ModalNovaReserva` com `range_to_periodo(selection)` e `quartoPreferido` quando `selection` existe.
- Região `role="status"` (`sr-only`) com `format_range_announcement(selection)`.
- `paused = novaReservaOpen || selectedReservation !== null`.
- `onCreated`: fecha modal e `clear()`.
- Navegação de datas e seletor de mês chamam `clear()`.

## MSW (padrões para unit + E2E)

- `GET /reservas/disponibilidade` → `[{ quarto_id: 'quarto-1', identificacao: '101', categoria_id: 'categoria-1', categoria_nome: 'Suíte Luxo', limite_hospedes: 2, valor_total: '900.00' }, { quarto_id: 'quarto-2', identificacao: '102', ... limite_hospedes: 3 }]`.
- `POST /reservas` → 201 com `Reserva` `id: 'reserva-nova'`, `codigo: 'RES-0002'`, ecoando o corpo.
- `GET /regimes_alimentacao` → dois regimes ativos: "Pensão Completa" (`REGIME_PENSAO_COMPLETA_ID`) e "Meia Pensão" (`REGIME_MEIA_PENSAO_ID = '00000000-0000-4000-8000-0000000000a2'`) (UUIDs válidos nos ids usados em formulário, pois o schema valida `uuid`).
- `GET /tarifarios` (`src/mocks/tarifarios/tarifarios_handlers.ts`, `make_tarifario`) → um tarifário ativo de "Pensão Completa" para a categoria das suítes 101/102; filtra por `categoria_quarto_id` (contra `categoria_quarto_ids`) e `ativo=true`. "Meia Pensão" não tem tarifário nessa categoria, então o modal com suíte mostra só "Pensão Completa" (pré-selecionado, com a 101 marcada em seguida) e sem suíte mostra os dois, nenhum marcado.

> Nota: `novaReservaFormSchema` exige UUID em `regime_alimentacao_id` e `quarto_id`, e a suíte preferida (id da linha do calendário, vindo de `GET /quartos`) precisa casar com `quarto_id` da disponibilidade. Por isso os ids mock `quarto-1`/`quarto-2` em `src/mocks/quartos/quartos_handlers.ts` passam a ser UUIDs exportados como constantes (`QUARTO_101_ID = '00000000-0000-4000-8000-000000000101'`, `QUARTO_102_ID = '00000000-0000-4000-8000-000000000102'`), reutilizados em `reservas_handlers.ts` (lista, disponibilidade) e o regime mock usa `REGIME_PENSAO_COMPLETA_ID = '00000000-0000-4000-8000-0000000000a1'`. Apenas specs com `vi.mock` usam os ids literais antigos e não são afetados.
>
> Os testes novos da página do calendário ficam em `src/pages/app/reservas/calendario_selecao.spec.tsx` (MSW), porque `calendario.spec.tsx` faz `vi.mock` dos serviços para o arquivo inteiro. Datas: fixar o relógio (`vi.setSystemTime` com `shouldAdvanceTime`, no E2E `page.clock.setFixedTime`) em 2026-12-01 para que as células alvo sejam determinísticas.
