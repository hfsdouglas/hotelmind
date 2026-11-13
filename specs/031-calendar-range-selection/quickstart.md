# Quickstart: 031-calendar-range-selection

## Pré-requisitos

- `pnpm install` na raiz.
- Playwright: `pnpm --filter web exec playwright install chromium` (primeira vez).

## Testes focados (nunca a suíte inteira)

```bash
cd packages/web
pnpm exec vitest run src/lib/calendar_range_selection.spec.ts
pnpm exec vitest run src/hooks/use_calendar_range_selection.spec.tsx
pnpm exec vitest run src/hooks/use_nova_reserva_opcoes.spec.tsx src/hooks/use_nova_reserva_form.spec.tsx
pnpm exec vitest run src/components/reservas/calendar_day_cell.spec.tsx src/components/reservas/reservation_cell.spec.tsx
pnpm exec vitest run src/components/reservas/nova_reserva_form_fields.spec.tsx src/components/reservas/modal_nova_reserva.spec.tsx
pnpm exec vitest run src/pages/app/reservas/calendario_selecao.spec.tsx src/pages/app/reservas/calendario.spec.tsx src/pages/app/reservas/nova.spec.tsx
pnpm exec playwright test src/tests/reservas/calendario_selecao.e2e.ts
pnpm exec playwright test src/tests/reservas/reservas.e2e.ts
```

## Validação manual (`pnpm --filter web dev`, MSW: `VITE_E2E_MOCKS=true`)

1. `/reservas/calendario`: pressionar na área livre de um dia da suíte 101, arrastar 3 dias (passando pela 102) e soltar → só a 101 fica azul, com faixa contínua: dias internos na célula inteira, dia inicial só na parte direita e dia final só na parte esquerda, todos no mesmo tom (sem diferença de cor entre início, meio e fim), alinhados com a geometria das barras de reserva e sem contorno; os dias internos se distinguem claramente do fundo das linhas (US1). Se a seleção aparecer sem cor após mudar `tailwind.config.ts`, reinicie o Vite.
2. Passar o ponteiro sobre a área livre de uma célula (com e sem reserva) → cursor padrão; sobre a barra de uma reserva → cursor `pointer` (US1-8, FR-019). Clicar numa barra de reserva → abre "Detalhes da Reserva", sem seleção (US1-6).
3. Clicar na barra lateral, nos botões de navegação ou pressionar Esc → seleção some (US2).
4. Nova seleção → clicar no "+" (Nova Reserva) → modal grande com datas preenchidas; o Passo 3 mostra brevemente "Consultando regimes disponíveis para a suíte..." (sem piscar lista nem "Nenhum regime...") e depois apenas "Pensão Completa" ("Meia Pensão" não tem tarifário na categoria da 101) (US3-11, FR-020/FR-021), **já marcado** ("Selecionado ✓") sem nenhum clique; em seguida a suíte 101 aparece marcada e o resumo "Proposta selecionada: Suíte 101 ..." surge (US3-2, FR-026). Preencher só o titular → Salvar → toast, modal fecha, seleção some (US3-4/15).
4a. Sem seleção, clicar em "Nova Reserva" → Passo 3 já visível sem datas, com "Pensão Completa" e "Meia Pensão", **nenhum marcado** e nenhuma suíte marcada; nenhuma requisição a `/tarifarios` (aba Network); escolher regime e informar datas → suítes carregam no Passo 4 (US3-12/13/16, FR-022/FR-023/FR-027).
4b. No modal, rolar com a roda do mouse, teclado (Tab/PageDown) e no touchpad → o conteúdo rola até "Salvar"/"Cancelar" e nenhuma barra de rolagem aparece (Chrome e Firefox) (US3-14, FR-024).
4c. Com o modal aberto a partir da seleção, clicar no regime já marcado (ou em outro, se a categoria tiver mais de um; nos mocks só há "Pensão Completa") → o regime clicado fica marcado e a 101 é re-marcada se disponível; o primeiro regime não volta sozinho. Fechar e reabrir com a mesma seleção → o primeiro regime volta a vir marcado (uma vez por abertura) (US3-18, FR-028).
4d. Simular erro (DevTools → Network → bloquear `/regimes_alimentacao`, ou `/tarifarios` com seleção) e abrir o modal → bloco "Não foi possível carregar os regimes de alimentação.", sem lista, sem mensagem de vazio e sem pré-seleção (US3-19, FR-025). (Com `VITE_E2E_MOCKS=true` o MSW responde no service worker; para simular o erro, use a API real ou um `server.use` nos testes.)
5. Alternar tema escuro → destaque continua legível e distinto das barras (SC-004).
6. `/reservas/nova` → mesmo formulário, todos os regimes ativos visíveis antes das datas, nenhum pré-selecionado, sem "piscar" de "Nenhum regime de alimentação ativo cadastrado." durante o carregamento; salvar navega para o detalhe (FR-017).

## Saída esperada

Todos os specs acima verdes; `pnpm biome check packages/web` sem erros.
