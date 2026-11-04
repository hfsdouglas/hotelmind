# Phase 0 Research: Painel de Visão Geral Operacional e Métricas Hoteleiras

## 1. Calendário com Dropdown para Mês e Ano no Popover

- **Decision**: Customizar o componente `Calendar` (`packages/web/src/components/ui/calendar.tsx`) utilizando `react-day-picker` com `captionLayout="dropdown"`, substituindo os botões nativos por componentes `Select` do design system estilizados com Radix UI.
- **Rationale**:
  - Usuários precisam saltar diretamente entre anos e meses sem precisar clicar dezenas de vezes nas setas de próximo/anterior.
  - A integração com Radix UI `Select` garante conformidade com acessibilidade WAI-ARIA, suporte a teclado e consistência visual com os demais formulários do sistema.
- **Alternatives considered**:
  - `Input type="date"` nativo do navegador: rejeitado por variação inconsistente de design entre sistemas operacionais e navegadores.

## 2. Reatividade dos Indicadores Operacionais à Data de Referência

- **Decision**: Estruturar a geração e cálculo dos dados do dashboard em uma função pura memorizada via `useMemo(() => generateMockData(date), [date])`.
- **Rationale**:
  - Permite que o operador audite indicadores operacionais de dias passados ou antecipe previsões de ocupação para datas futuras de forma instantânea.
  - O isolamento em função pura desacopla os cálculos da renderização e facilita a substituição futura por chamada a endpoint de API `/dashboard/metricas?data=YYYY-MM-DD`.
- **Alternatives considered**:
  - Recarregar a página inteira ao alterar a data: rejeitado por criar lentidão e quebrar o estado da sessão.

## 3. Sincronização do Título do Documento com Hook Dedicado

- **Decision**: Criar o hook `usePageTitle(title: string)` em `packages/web/src/hooks/use_document_title.ts`, atualizando `document.title` dentro de um `useEffect` e restaurando opcionalmente no unmount.
- **Rationale**:
  - Melhora a ergonomia do operador que mantém várias abas abertas no navegador (ex.: Dashboard, Reservas, Quartos), identificando imediatamente cada aba pelo nome da tela.
