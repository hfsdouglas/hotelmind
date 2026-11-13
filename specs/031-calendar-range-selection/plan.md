# Implementation Plan: Seleção de Período por Arraste no Calendário e Nova Reserva em Modal

**Branch**: `031-calendar-range-selection` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/031-calendar-range-selection/spec.md`

## Summary

Front-end only (`packages/web`). Adiciona ao calendário de reservas uma seleção
efêmera de período por arraste do mouse, travada na linha da suíte de origem,
destacada com os novos tokens `range-selection` (decisão do
brand-design-specialist), removida por clique fora da região do calendário, Esc,
navegação de datas ou sucesso na criação. O botão "Nova Reserva" da barra de
ações passa a abrir `ModalNovaReserva`, que usa o **mesmo** formulário da página
`/reservas/nova`, agora extraído para `NovaReservaFormFields` +
`useNovaReservaForm` + `useNovaReservaOpcoes`. A página é refatorada para usar
as mesmas peças sem mudança de comportamento. Nenhuma mudança em `api` ou
`packages/.contracts`.

Revisão "regimes por suíte e rolagem" (2026-11-12, FR-020 a FR-024): com suíte
preferida, `useNovaReservaOpcoes` resolve a categoria da suíte em `GET /quartos`
e filtra os regimes ativos pelos tarifários ativos da categoria
(`GET /tarifarios`); sem suíte, lista todos os regimes ativos. A grade de
regimes fica visível antes das datas. O modal mantém a rolagem com a barra
oculta (`scrollbar-none`). Ver research R9/R10.

Correção da revisão acima (FR-021/FR-022/FR-025): `useNovaReservaOpcoes` expõe
`carregandoRegimes` (lista de regimes pendente em qualquer caso; com suíte, também
`/quartos` ou `/tarifarios` pendentes) e `erroRegimes` (falha fechada), com
`regimes = []` em ambos; query keys com prefixo de domínio
(`['quartos','para_regimes','lista']`, `['tarifarios','ativos_da_categoria', id]`).

Revisão "regime e suíte pré-selecionados" (2026-11-12, FR-026 a FR-028):
`NovaReservaFormFields` ganha um `useEffect` com flag `useRef` (no molde do
efeito da suíte preferida, sem espelhar estado em `useState`) que, com suíte
preferida e período válido, marca `regimes[0]` uma única vez por formulário
montado assim que `!carregandoRegimes && !erroRegimes` e o regime ainda está
vazio. A suíte é marcada pelo fluxo existente (disponibilidade + efeito R6).
Ver research R11. Arquivos de produção tocados:
`src/hooks/use_nova_reserva_opcoes.ts` e
`src/components/reservas/nova_reserva_form_fields.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), React 19

**Primary Dependencies**: Tailwind CSS + shadcn/ui (Radix Dialog), React Hook Form + Zod, TanStack Query, date-fns (`pt-BR`), Sonner, Lucide React

**Storage**: N/A (seleção em `useState`; criação via `POST /reservas` existente)

**Testing**: Vitest + React Testing Library + MSW (unit/integração); Playwright com `VITE_E2E_MOCKS=true` (E2E)

**Target Platform**: Navegadores desktop (interação por mouse)

**Project Type**: Front-end SPA em monorepo pnpm (`packages/web`)

**Performance Goals**: Destaque acompanha o ponteiro sem atraso perceptível (re-render apenas ao mudar a coluna sob o ponteiro)

**Constraints**: Seleção não persistida; `hotel_id` nunca enviado pelo front; barras de reserva continuam clicáveis acima do destaque; página `/reservas/nova` sem regressão

**Scale/Scope**: ~250 suítes × ~15-40 dias visíveis

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

| Princípio | Aplicação | Status |
|---|---|---|
| I. Contract-First | Usa `CreateReservaPayload`, `QuartoDisponivel`, `ReservaConflitoErro`, `Reserva` já existentes em `packages/.contracts`; nenhum shape novo compartilhado (seleção é estado de UI local, tipado em `src/types/`). | Pass |
| II. Camadas | Página só compõe; componentes em `src/components/reservas/`; dados/mutação em `src/hooks/`; lógica pura de intervalo em `src/lib/calendar_range_selection.ts`. Nenhum `components/` dentro de `pages/`. | Pass |
| III. SOLID | `CalendarDayCell` renderiza uma célula; `useCalendarRangeSelection` só gerencia o estado da seleção; `NovaReservaFormFields` só renderiza campos; `useNovaReservaForm` só orquestra form + mutação; wrappers (página/modal) decidem o pós-sucesso via callback (Open/Closed). | Pass |
| IV. Explícito | Pós-sucesso passado como `onSuccess`; valores iniciais e suíte preferida como props; sem `as T` (exceto a fronteira Axios já existente no erro 409, reaproveitada). Constantes nomeadas para botões do mouse e formato de data. | Pass |
| V. Baixo acoplamento | Modal não conhece o calendário; calendário só conhece a interface pública do modal. | Pass |
| VI. Clean Code | Arquivos snake_case; extração reduz `calendario.tsx` e `nova.tsx`. | Pass |
| VII. Testabilidade | Funções puras testadas isoladamente; hooks com `renderHook`; componentes/páginas com MSW (sem mock de Axios/serviço nos testes novos). | Pass |
| Multi-tenancy | Sem endpoint novo; listas (incluindo `GET /quartos` e `GET /tarifarios` usados para os regimes da suíte) e criação já escopadas pelo JWT na API, nenhuma enviando `hotel_id`. Teste confirma ausência de `hotel_id` no corpo do POST e que suíte fora da disponibilidade não é marcada. | Pass |
| TDD | `tasks.md` ordena specs com falha antes de cada produção. | Pass |

Reavaliação pós-design: sem violações; Complexity Tracking vazio.

## Design de UI (decisão de cor: brand-design-specialist)

Tokens novos (opacos, hue 230):

| Token | `:root` | `.dark` |
|---|---|---|
| `--range-selection` | `oklch(0.85 0.07 230)` | `oklch(0.4 0.08 230)` |
| `--range-selection-border` | `oklch(0.5 0.13 230)` | `oklch(0.7 0.11 230)` |
| `--range-selection-foreground` | `var(--foreground)` | `var(--foreground)` |

`tailwind.config.ts` → `colors['range-selection'] = { DEFAULT: withOpacity('--range-selection'), border: withOpacity('--range-selection-border'), foreground: withOpacity('--range-selection-foreground') }`.

Valores reforçados na revisão de 2026-11-12 (antes: claro 0.9/0.045, 0.84/0.07, 0.58/0.11; escuro 0.36/0.06, 0.44/0.08): o preenchimento anterior ficava só ~0,035 de L abaixo de `bg-muted` e o meio parecia vazio. `--range-selection-border` permanece definido, mas o overlay não o usa mais.

Revisão "cor única" (2026-11-12): início, meio e fim usam o mesmo tom `bg-range-selection`; o token `--range-selection-strong` (claro `oklch(0.78 0.1 230)`, escuro `oklch(0.48 0.1 230)`) e a cor Tailwind `range-selection.strong` foram removidos por não terem mais uso. Com o Vite rodando, mudanças em `tailwind.config.ts` exigem reiniciar o servidor para regenerar as utilities.

Renderização: overlay `aria-hidden` `absolute z-0 pointer-events-none`
como **primeiro filho** de `div.relative.w-full.h-8.isolate` dentro da célula
(as barras de reserva têm `z-[1..3]` e ficam por cima). Não estilizar o `td`.

| Estado da célula | Classes do overlay |
|---|---|
| `middle` | `inset-0 bg-range-selection` (célula inteira) |
| `start` | `top-0 h-8 right-0 w-1/3 bg-range-selection rounded-l` (parte direita, check-in) |
| `end` | `top-0 h-8 left-0 w-1/3 bg-range-selection rounded-r` (parte esquerda, check-out) |

A geometria de `start`/`end` espelha a barra de reserva de `reservation_cell.tsx` (`w-1/3 right-0 rounded-l` / `w-1/3 left-0 rounded-r`), sem contorno; o preenchimento é contínuo do início ao fim. Se a barra mudar para metade, o overlay muda junto.

Se algum texto for renderizado sobre células selecionadas, ele usa
`text-range-selection-foreground` (nunca `text-muted-foreground`); hoje o
overlay não renderiza texto. Durante o arraste: `select-none` no contêiner da grade.

Cursor (FR-019): o `td` de `calendar_day_cell.tsx` não recebe `cursor-pointer`
(nem condicionado a ter reservas); apenas o elemento `role="button"` de
`reservation_cell.tsx` tem `cursor-pointer`. A área livre mantém o cursor padrão.

Modal: `DialogContent` com `w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-none`
(rolagem vertical preservada, barra oculta; utility `.scrollbar-none` em
`src/index.css` sob `@layer utilities`, FR-024),
`DialogTitle` "Nova Reserva", `DialogDescription` com o período quando houver.

Passo 3 (regimes) em `NovaReservaFormFields`: sempre visível (não depende de
diárias > 0, FR-023); estados, nesta ordem de precedência: carregando
(`carregandoRegimes`: "Consultando regimes disponíveis para a suíte..." com suíte
preferida / "Consultando regimes disponíveis..." sem), erro (`erroRegimes`: bloco
`role="alert"` "Não foi possível carregar os regimes de alimentação."), vazio
após carga bem-sucedida ("Nenhum regime de alimentação disponível para esta
suíte." com suíte preferida / "Nenhum regime de alimentação ativo cadastrado."
sem) e grade de cards (card marcado mostra "Selecionado ✓"). Com suíte preferida
e período válido, o primeiro card vem marcado (FR-026).
Rodapé com `Cancelar` (outline) e `SaveButton` "Salvar", alinhados à direita,
mesmas larguras do `CrudFormLayout` (`min-w-[140px]`).

## Fluxo de interação (resumo; detalhes em `contracts/ui_contracts.md`)

1. `mousedown` (botão 0) no `td` → `startDrag(quarto, dia)`; `ReservationCell`
   faz `stopPropagation` no `mousedown` para preservar o clique de detalhes.
2. `mouseenter` em qualquer `td` de dia durante o arraste → `extendDrag(dia)`
   (linha ignorada: trava na suíte de origem).
3. `mouseup` na `window` → `endDrag()`; descarta se 1 dia.
4. `mousedown` no `document` fora das refs (grade + barra de ações) e com o
   listener ativo → `clear()`. O listener fica **pausado** enquanto o modal de
   nova reserva (ou detalhes) está aberto, cobrindo cliques no overlay e no
   portal do Radix.
5. `keydown` Esc com listener ativo → `clear()`.
6. Handlers de navegação de datas/mês chamam `clear()` explicitamente (já estão
   fora da região, mas a chamada explícita evita depender da ordem dos eventos).
7. "Nova Reserva" → `ModalNovaReserva` com `valoresIniciais` =
   `range_to_periodo(selection)` e `quartoPreferido` = suíte da linha. Com
   suíte, o Passo 3 consulta `GET /quartos?limite=250` (categoria) e
   `GET /tarifarios?categoria_quarto_id=…&ativo=true&limite=250` e mostra só os
   regimes da categoria; sem suíte, todos os regimes ativos. As suítes do
   Passo 4 vêm depois, pela disponibilidade (datas + regime + pessoas).
   Com suíte e período válido, o primeiro regime é marcado automaticamente
   (uma vez por abertura); isso habilita `podeConsultar`, a disponibilidade
   roda e o efeito da suíte preferida marca a suíte da linha: o operador só
   preenche o titular.
8. Sucesso → `toast.success`, invalidar `['reservas']` (o hook faz),
   `onCreated` no calendário fecha o modal e chama `clear()`.

## Project Structure

### Documentation (this feature)

```text
specs/031-calendar-range-selection/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui_contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/web/
├── tailwind.config.ts                                   # + range-selection colors
└── src/
    ├── index.css                                        # + --range-selection* tokens, .scrollbar-none utility
    ├── types/
    │   └── calendar_range_selection.ts                  # NEW view types (CalendarRangeSelection, CellSelectionState, NovaReservaValoresIniciais, QuartoPreferido)
    ├── lib/
    │   ├── calendar_range_selection.ts                  # NEW pure helpers
    │   └── calendar_range_selection.spec.ts             # NEW
    ├── hooks/
    │   ├── use_calendar_range_selection.ts              # NEW selection state + listeners
    │   ├── use_calendar_range_selection.spec.tsx        # NEW
    │   ├── use_nova_reserva_opcoes.ts                   # NEW regimes/parceiros/disponibilidade queries (moved from nova.tsx) + regimes da suíte preferida (quartos + tarifarios) + carregandoRegimes/erroRegimes
    │   ├── use_nova_reserva_opcoes.spec.tsx             # NEW
    │   ├── use_nova_reserva_form.ts                     # NEW form + create mutation + 409 state (moved from nova.tsx)
    │   └── use_nova_reserva_form.spec.tsx               # NEW
    ├── components/reservas/
    │   ├── calendar_day_cell.tsx                        # NEW day cell (overlay + bars + drag handlers)
    │   ├── calendar_day_cell.spec.tsx                   # NEW
    │   ├── reservation_cell.tsx                         # stopPropagation on mousedown
    │   ├── reservation_cell.spec.tsx                    # + mousedown case
    │   ├── nova_reserva_form_fields.tsx                 # NEW shared form sections (moved from nova.tsx) + preferred suite + regimes da suíte (grade visível antes das datas, estados carregando/erro/vazio) + pré-seleção do primeiro regime
    │   ├── nova_reserva_form_fields.spec.tsx            # NEW
    │   ├── modal_nova_reserva.tsx                       # NEW large dialog wrapper (scroll com barra oculta)
    │   └── modal_nova_reserva.spec.tsx                  # NEW
    ├── pages/app/reservas/
    │   ├── calendario.tsx                               # uses CalendarDayCell, hook, modal, toolbar onClick, status region
    │   ├── calendario.spec.tsx                          # unchanged (vi.mock-based; regression net)
    │   ├── calendario_selecao.spec.tsx                  # NEW MSW-based selection / click-outside / modal / isolation scenarios
    │   ├── nova.tsx                                     # thin wrapper: CrudFormLayout + shared pieces
    │   └── nova.spec.tsx                                # unchanged expectations (regression safety net)
    ├── mocks/
    │   ├── quartos/quartos_handlers.ts                  # ids -> exported UUID constants (QUARTO_101_ID, QUARTO_102_ID)
    │   ├── reservas/reservas_handlers.ts                # + GET /reservas/disponibilidade, POST /reservas; reuse UUID constants
    │   ├── regimes_alimentacao/regimes_alimentacao_handlers.ts  # NEW GET /regimes_alimentacao ("Pensão Completa" + "Meia Pensão")
    │   ├── tarifarios/tarifarios_handlers.ts            # NEW GET /tarifarios (só "Pensão Completa" na categoria das 101/102)
    │   └── handlers.ts                                  # register regimes + tarifarios handlers
    └── tests/reservas/
        └── calendario_selecao.e2e.ts                    # NEW E2E per user story
```

**Structure Decision**: Pacote `web` apenas. Componentes de domínio em
`src/components/reservas/`, hooks em `src/hooks/`, helpers puros em `src/lib/`
(pasta já usada por `utils.ts` e `axios.ts`), tipos de view em `src/types/`.

## Complexity Tracking

Nenhuma violação a justificar.
