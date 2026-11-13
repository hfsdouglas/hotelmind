# Research: Seleção de Reserva e Check-in pelo Calendário

## R1. Alvo da navegação para preencher FNRH

- **Decision**: Navegar para `/reservas/:id?fnrh=pendente`. `DetalheReservaPage` (`pages/app/reservas/[id]/index.tsx`) lê o parâmetro com `useSearchParams`, e após carregar a reserva define `hospedeEmEdicao` com a primeira ficha `ficha_status !== 'preenchida'` (menor `posicao`) e remove o parâmetro com `setSearchParams(..., { replace: true })`. Um `useRef` garante execução única.
- **Rationale**: É a única página com `ReservaHospedesSection` + `ModalEditarFichaFnrh`. Reaproveita mutação, toasts e validações existentes.
- **Alternatives**: (a) adicionar FNRH em `[id]/editar.tsx`: duplica formulário e viola SRP do `CrudFormLayout`; (b) abrir `ModalEditarFichaFnrh` no próprio calendário: exige trazer mutação de ficha para o calendário e foge do pedido "abrir a página".

## R2. Ordem check-in x navegação

- **Decision**: Trocar status primeiro; navegar só em sucesso.
- **Rationale**: FNRH é opcional; o operador já decidiu o check-in. Evita voltar ao calendário para repetir o check-in.
- **Alternatives**: navegar sem check-in (exige segundo passo manual; risco de esquecer o check-in).

## R3. Validação de FNRH na API

- **Decision**: Nenhuma mudança na API. `AlterarStatusReservaUseCase` só valida a transição (`ReservaStatusService`). Adicionar testes de caracterização: `alterar_status_reserva_use_case.spec.ts` e casos `PATCH /reservas/:id/status` em `reservas_routes.spec.ts` (200, 422, 404 cross-hotel, 401). Hoje não há nenhum teste desse endpoint.
- **Rationale**: Pedido diz "não obrigatório"; a pendência é verificada no front a partir de `hospedes[].ficha_status` já retornado pela listagem.
- **Alternatives**: endpoint dedicado `POST /reservas/:id/check-in` com resposta de pendências: mais superfície sem ganho; a regra de pendência é informativa.

## R4. Fonte da tipagem de cama

- **Decision**: `Quarto.camas` (`ConfiguracaoCama[]`, contrato `quartos.ts`), já retornado por `quartosService.list` usado pelo calendário. O mapeamento junta reserva + quarto por `quarto_id`. Rótulos em `lib/camas.ts` a partir de `TIPOS_CAMA`.
- **Alternatives**: incluir camas em `Reserva.quarto` na API (mudança de contrato e de repositório sem necessidade).

## R5. Dados do resumo/modais

- **Decision**: `GET /reservas` (repositório Postgres usa `RESERVA_DEFAULT_INCLUDE`, que inclui `hospedes`, `quarto`, `regime_alimentacao`, `parceiro`) já entrega tudo. O view model do calendário passa a carregar esses campos (hoje são descartados em `calendario.tsx` L715-781).
- **Alternatives**: `GET /reservas/:id` ao abrir modal (latência extra; o tooltip precisaria de N requisições).

## R6. View model e números mágicos

- **Decision**: Substituir `Reservation.status_code` (0/1/2) e `pagamento` por `status: ReservaStatus` + `status_label`, e campos reais (ver data-model). Mapeamento puro em `lib/calendario_reserva.ts`, testado isoladamente.
- **Rationale**: Constituição VI (sem literais mágicos) e IV (explícito). Dados de pagamento eram inventados.

## R7. Gerência da seleção de reserva

- **Decision**: Novo hook `hooks/use_reserva_selecionada.ts` com estado `selecionadaId`, e efeitos: Esc (quando não pausado) limpa; `pointerdown` fora das `regionRefs` (grade + barra de ações) limpa; limpa quando o id não está em `reservasVisiveis`. A página: ao selecionar reserva chama `clear()` da seleção de período; `onRangeStart` limpa a reserva; navegação de datas limpa ambas. `useCalendarRangeSelection.paused` passa a ser `novaReservaOpen || detalhesOpen || checkInOpen` (não mais `selectedReservation !== null`).
- **Rationale**: Mesmo padrão do hook da spec 031 (regiões e pausa por modal), SRP, testável sem página. Portais de modal ficam fora da região, por isso a pausa evita limpar a seleção ao clicar dentro de modais.
- **Alternatives**: estender `useCalendarRangeSelection` (mistura duas responsabilidades).

## R8. Destaque de seleção (brand-design-specialist)

- **Decision**: Classes na barra selecionada: `ring-2 ring-selection-ring ring-offset-1 ring-offset-transparent shadow-[0_0_0_4px_var(--selection-glow),inset_0_1px_0_var(--selection-highlight)] z-[4]` (forma exata do shadow pode ser um utilitário `.shadow-selection` em `index.css`). Tokens em `index.css` (claro/escuro) conforme FR-004; cor `selection-ring` em `tailwind.config.ts`.
- **Clipping**: o contêiner `overflow-auto` da grade (`calendario.tsx` ~L396) e o `thead` sticky podem cortar o anel na primeira linha. Mitigação: a barra já fica dentro do `td` com `h-8` centralizado; garantir `py` suficiente na célula (≥ 3px acima/abaixo da barra) e verificar no E2E com screenshot/bounding box da primeira linha. Se ainda cortar, adicionar `pt-1` no `tbody` primeiro `tr`.
- **Alternatives**: `outline` com `outline-offset` (não aceita glow coordenado; Tailwind ring já é padrão do projeto).

## R9. Laranja de check-in e manutenção

- **Decision**: Tokens `--status-checkin` (claro `oklch(0.6 0.17 50)`, escuro `oklch(0.74 0.14 50)`) e `--status-checkin-foreground` (claro `oklch(0.42 0.11 50)`, escuro `oklch(0.84 0.12 55)`); `--status-maintenance` passa a ardósia (claro `oklch(0.55 0.02 250)`, escuro `oklch(0.7 0.02 250)`). Tailwind: `status.checkin`, `status['checkin-foreground']` via `withOpacity`. Barra check-in `bg-status-checkin`; dot `bg-status-checkin`; selo `bg-status-checkin/10 text-status-checkin-foreground border-status-checkin/40`.
- **Rationale**: Decisão do brand-design-specialist; HEX só documental (verificar com conversor), tokens canônicos em OKLCH como os existentes.

## R10. Status da suíte

- **Decision**: `derive_suite_status(quarto, reservas)`: `status === 'N'` → `bloqueado`; existe reserva da suíte com `status === 'check_in'` → `checkin`; senão `disponivel`. `RoomStatus` troca `ocupado` por `checkin` (rótulo "Check-in"); `manutencao`/`limpeza` permanecem no tipo (sem fonte de dados hoje).
- **Alternatives**: manter regra "ocupado hoje" por data (deixaria suíte sem laranja em check-in antecipado/atrasado; pedido liga a cor ao status de check-in).

## R11. Tooltip rico

- **Decision**: Manter `Tooltip` do shadcn (Radix) com `delayDuration={300}`, `TooltipContent` com `className="w-80 max-w-[22rem] p-3 bg-popover text-popover-foreground border shadow-md"` e conteúdo `ReservaResumoCard`. Durante arraste (`isDragging`) o tooltip recebe `open={false}`. Foco por teclado abre (comportamento Radix).
- **Alternatives**: `HoverCard` (shadcn) — não abre por foco por padrão; Tooltip já é usado e acessível.

## R12. Ícones (Lucide)

- **Decision**: Nova Reserva `CalendarPlus`; Check-in `BellRing` (sino; `Bell` aceitável) ; Detalhes `Info`.

## R13. Erros da troca de status

- **Decision**: Classificar por `error.response.status`: 422 → transição inválida; 404 → não encontrada; demais/sem resposta → genérico. Mensagem da API em `response.data.message` quando houver.

## R14. Invalidações

- **Decision**: Em sucesso, `invalidateQueries({ queryKey: ['reservas'] })` (cobre `['reservas','calendario']` e a lista paginada) e `['reserva', id]`.

## R15. Badge de status compartilhado

- **Decision**: Extrair `getStatusBadge` duplicado em `pages/app/reservas/index.tsx` e `[id]/index.tsx` para `components/reservas/reserva_status_badge.tsx`, trocando check-in para tokens laranja.
- **Rationale**: Remove duplicação e garante a cor única (FR-016).

## R16. Componente antigo não usado

- **Decision**: `components/reservas/modal_alterar_status_reserva.tsx` não é reaproveitado (é genérico, sem dados da reserva nem FNRH). Fica como está (fora de escopo removê-lo).
