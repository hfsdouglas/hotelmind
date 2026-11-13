# Data Model: 031-calendar-range-selection

Nenhuma entidade persistida nova. Nenhuma mudança em `packages/.contracts` ou no
banco. Tipos de view (somente `packages/web/src/types/calendar_range_selection.ts`):

## CalendarRangeSelection (estado de UI)

| Campo | Tipo | Regra |
|---|---|---|
| `quarto_id` | `string` | id da suíte (linha) de origem; imutável durante o arraste |
| `quarto_identificacao` | `string` | número exibido (ex.: `101`), usado no anúncio e no aviso do modal |
| `anchor` | `string` (`AAAA-MM-DD`) | dia onde o mouse foi pressionado |
| `focus` | `string` (`AAAA-MM-DD`) | dia da última coluna sob o ponteiro |

Derivados (funções puras em `src/lib/calendar_range_selection.ts`):

- `normalize_range(sel) -> { inicio, fim }`: `inicio = min(anchor, focus)`, `fim = max(anchor, focus)`.
- `is_valid_range(sel) -> boolean`: `inicio < fim` (mínimo 2 dias).
- `range_to_periodo(sel) -> { check_in: inicio, check_out: fim }`.
- `get_cell_selection_state(sel | null, quarto_id, dia) -> CellSelectionState`.
- `format_range_announcement(sel) -> string`: "Período selecionado: Suíte 101, de 20/12/2026 a 23/12/2026".
- `to_iso_day(date: Date) -> string`: data local `AAAA-MM-DD` (sem fuso UTC).

## CellSelectionState

`'none' | 'start' | 'middle' | 'end'`. Regra: célula de outra suíte ou fora de
`[inicio, fim]` = `none`; `dia === inicio` = `start`; `dia === fim` = `end`;
entre os dois = `middle`. Durante o arraste com `anchor === focus`, a célula
única é `start`.

## Ciclo de vida

| De | Evento | Para |
|---|---|---|
| `null` / `selecionada` | `startDrag(quarto, dia)` | `arrastando` (`anchor = focus = dia`) |
| `arrastando` | `extendDrag(dia)` | `arrastando` (`focus = dia`) |
| `arrastando` | `endDrag()` com `is_valid_range` | `selecionada` |
| `arrastando` | `endDrag()` sem `is_valid_range` | `null` |
| qualquer | `clear()` (clique fora, Esc, navegação, sucesso) | `null` |

## NovaReservaValoresIniciais

`{ check_in?: string; check_out?: string }` mesclado sobre os padrões atuais do
form (`quantidade_adultos: 2`, demais vazios/zero).

## QuartoPreferido

`{ id: string; identificacao: string }`, opcional; marcado automaticamente
quando presente na disponibilidade (ver research R6).

Também alimenta o filtro de regimes (FR-020): `quartoPreferido.id` vira
`quartoPreferidoId` em `useNovaReservaOpcoes`.

## Regimes da suíte preferida (derivado, não persistido)

Entradas (tipos existentes de `@hotelmind/contracts`, sem mudança):

| Fonte | Campo usado |
|---|---|
| `Quarto` (`GET /quartos?limite=250`) | `id`, `categoria_id` |
| `Tarifario` (`GET /tarifarios?categoria_quarto_id=…&ativo=true&limite=250`) | `regime_alimentacao_id` |
| `RegimeAlimentacao` (`GET /regimes_alimentacao?ativo=true&limite=250`) | `id` |

Regra: `regimes = regimesAtivos.filter(r => idsDistintos(tarifarios.regime_alimentacao_id).has(r.id))`.
Sem suíte preferida ou com categoria não resolvida (suíte ausente de uma resposta
bem-sucedida de `/quartos`): `regimes = regimesAtivos`.
Carregando (`carregandoRegimes`) ou em erro (`erroRegimes`, falha fechada):
`regimes = []`. O período não participa da regra. Os tarifários incluem os de
parceiros (`parceiro_id`); o filtro é apenas por categoria.

## Pré-seleção do primeiro regime (estado de formulário, não persistido)

Com `QuartoPreferido` e período válido (`check_in < check_out`), quando
`!carregandoRegimes && !erroRegimes` e `regimes[0]` existe, o campo
`regime_alimentacao_id` do formulário recebe `regimes[0].id` se estiver vazio,
uma única vez por formulário montado (flag `useRef`, não `useState`). `quarto_id`
continua sendo preenchido só pela regra de `QuartoPreferido` (disponibilidade).

## Payload de criação

Inalterado: `CreateReservaPayload` de `packages/.contracts/src/reservas.ts`,
montado por `useNovaReservaForm` exatamente como hoje em `nova.tsx`. Nunca
contém `hotel_id`.
