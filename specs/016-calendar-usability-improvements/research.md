# Phase 0 Research: Melhorias de usabilidade e ajustes no calendário de tarifários

**Feature**: `016-calendar-usability-improvements`
**Date**: 2026-11-02

## 1. Classificação de Dias na Hotelaria (Fim de Semana vs. Dias da Semana)

- **Decision**: Atualizar a regra de negócio de `compute_bulk_selection_dates` em `packages/web/src/schemas/tarifario.schema.ts` para considerar o padrão da hotelaria baseado nos pernoites:
  - **Fim de semana (`weekends`)**: Sexta-feira (`getUTCDay() === 5`) e Sábado (`getUTCDay() === 6`).
  - **Dias de semana (`weekdays`)**: Domingo (`0`), Segunda-feira (`1`), Terça-feira (`2`), Quarta-feira (`3`) e Quinta-feira (`4`) (`getUTCDay() >= 0 && getUTCDay() <= 4`).
- **Rationale**: Na hotelaria, as tarifas de fim de semana incidem sobre os pernoites de sexta-feira e sábado, enquanto domingo a quinta-feira compõem os pernoites de dias de semana. Centralizar essa lógica na função pura `compute_bulk_selection_dates` garante consistência automática em qualquer visualização (`1`, `3`, `6` ou `12` meses).
- **Alternatives considered**:
  - Manter a convenção civil (sábado e domingo): descartado por divergir da regra operacional hoteleira especificada pelo usuário.

## 2. Correção Visual do Texto e Indicadores de Datas Selecionadas

- **Decision**:
  1. Em `TarifarioCalendarDay` (`packages/web/src/components/tarifarios/tarifario_calendar_day.tsx`), refinar o layout interno da célula para evitar cortes ou quebras da palavra `"Selecionado"` / `"Conflito"` ou sobreposição com o badge `"Hoje"` em grades multi-mês (`3`, `6`, `12` meses) ou telas menores:
     - Ajustar espaçamentos e tamanhos mínimos da célula (`min-w-0 overflow-hidden`), garantindo que o texto de status (`Selecionado` / `Conflito`) utilize `truncate` sem quebrar letras no meio e permaneça legível e oculto de sobreposições, enquanto o checkbox visual (`Check`), a borda destacada e o contador global identificam claramente o estado em qualquer largura de coluna.
  2. Em `TarifarioPeriodSummary` (`packages/web/src/components/tarifarios/tarifario_period_summary.tsx`) e no badge `calendar-selected-count` de `TarifarioCalendar` (`packages/web/src/components/tarifarios/tarifario_calendar.tsx`), garantir `min-w-0 break-words` e `shrink-0` nos elementos adequados para que listas de datas e contadores nunca sofram corte horizontal ou sobreposição.
- **Rationale**: Quando 3 meses são exibidos lado a lado (`xl:grid-cols-3`), cada coluna do calendário tem `1/7` de `1/3` do card (~38–48px de largura). Um texto longo sem controle de overflow ou cabeçalho de célula apertado gera quebra inadequada ou sobreposição.
- **Alternatives considered**:
  - Aumentar a largura mínima forçada com scroll horizontal em todos os meses: descartado porque prejudica a visão panorâmica responsiva de 3, 6 e 12 meses.

## 3. Substituição do Botão "Mês atual" por Seletor de Mês e Ano + Botões de Navegação Apenas com Ícones

- **Decision**:
  1. Remover o botão `"Mês atual"` em `TarifarioCalendar` e substituí-lo por dois controles seletores compactos (ou seletor combinado de Mês e Ano) para **Mês** (`Janeiro` a `Dezembro`) e **Ano** (faixa dinâmica de anos cobrindo `ano_atual - 5` até `ano_atual + 10`, incluindo o ano atualmente visualizado), com `aria-label="Selecionar mês"` e `aria-label="Selecionar ano"`.
  2. Ao alterar o mês ou o ano, chamar `navigate_to(year, month)` preservando integralmente `selectedDates` e `months_count` (`1`, `3`, `6` ou `12`).
  3. Remover os textos visíveis (`Mês anterior`, `Período anterior`, `Próximo mês`, `Próximo período`) dos botões de avanço e recuo, mantendo apenas os ícones `<ChevronLeft />` e `<ChevronRight />` com `size="icon"` e preservando `aria-label` acessível.
- **Rationale**: Dois seletores nativos/acessíveis (`mês` e `ano`) posicionados entre os botões de seta (`<` `[Mês] [Ano]` `>`) oferecem seleção direta em 1 clique para qualquer mês/ano, atualizam automaticamente quando o usuário usa as setas e deixam a barra de ferramentas limpa e compacta.
- **Alternatives considered**:
  - Input `<input type="month">`: descartado porque o suporte e a aparência do picker nativo `type="month"` variam drasticamente entre navegadores (Firefox desktop, Safari e Chrome) e dificultam a estilização consistente com o design system do projeto.

## 4. Correção do Dropdown "Mais filtros" na Página de Pesquisa de Tarifários

- **Decision**:
  - Atualizar `TarifariosPage` (`packages/web/src/pages/app/tarifarios/index.tsx`) para utilizar o componente `Popover` (`Popover`, `PopoverTrigger`, `PopoverContent`) com o botão `"Mais filtros"` (`<Filter className="mr-2 h-4 w-4" /> Mais filtros`), seguindo exatamente o padrão da página de `Quartos` (`packages/web/src/pages/app/quartos/index.tsx`), e posicionar os filtros de **Categoria de quarto** e **Situação** dentro do `PopoverContent` com largura adequada (`min-w-[280px] sm:min-w-[320px]`), z-index elevado (`z-50`) e botão de `"Limpar filtros"` quando houver filtro ativo.
  - Garantir em `Popover` (`packages/web/src/components/ui/popover.tsx`) que interações com portais do Radix Select (`[data-radix-popper-content-wrapper]`, `[data-radix-select-content]`, `[role="listbox"]`, `[role="option"]`) dentro do `PopoverContent` não fechem o dropdown `"Mais filtros"` ao selecionar uma opção.
- **Rationale**: Na página de pesquisa de tarifários, os filtros estavam expostos fora do padrão `"Mais filtros"` ou sujeitos a fechamento/corte ao interagir com selects internos. O uso de `Popover` padronizado com suporte completo a interações em `Select` garante abertura confiável, posicionamento correto em relação ao botão e exibição integral das opções.
- **Alternatives considered**:
  - Exibir os selects soltos na barra de pesquisa: descartado porque o requisito 5 exige explicitamente o funcionamento e apresentação do dropdown `"Mais filtros"` na página de pesquisa de tarifários.

## 5. Remoção de Breadcrumbs nas Páginas de Inclusão e Edição de Tarifários

- **Decision**: Remover o elemento `<nav aria-label="Breadcrumb">Tarifários / {title}</nav>` de `TarifarioForm` (`packages/web/src/components/tarifarios/tarifario_form.tsx`), que é compartilhado pelas páginas `NovoTarifarioPage` (`/tarifarios/novo`) e `EditarTarifarioPage` (`/tarifarios/:id/editar`).
- **Rationale**: `CrudFormLayout` já exibe o cabeçalho da página com o botão de voltar (`Voltar`) e o título (`Novo tarifário` / `Editar tarifário`), tornando o breadcrumb superior redundante e inconsistente com as demais telas de cadastro do sistema.
- **Alternatives considered**:
  - Ocultar via CSS apenas em algumas resoluções: descartado pois a especificação determina remover completamente a estrutura de ambas as páginas.
