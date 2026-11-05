# Quickstart: validar Reservas e FNRH

## Pré-requisitos

- PostgreSQL com extensão `btree_gist` disponível; `pnpm install` na raiz.
- Hotel com ao menos: 1 regime ativo, 1 categoria, 2 quartos ativos da mesma categoria (capacidade ≥ 2) e tarifário cobrindo o período de teste; 1 parceiro ativo.

## Setup

```bash
pnpm --filter api db:migrate
pnpm --filter api db:seed:routes  # registra rotas de navegação
pnpm --filter api dev & pnpm --filter web dev
```

## Testes automatizados

```bash
pnpm --filter api test
pnpm --filter web test
pnpm biome check .
```

## Cenários manuais

1. **Criar reserva** (US1): `/reservas/nova` com titular, período, 2 pessoas, regime e quarto. Esperado: reserva `A confirmar`, código, valor = soma das diárias, 2 hóspedes pendentes.
2. **Sem tarifa**: período fora da cobertura do tarifário → quarto/regime não selecionável; via API retorna 422.
3. **Conflito** (FR-004a): criar segunda reserva no mesmo quarto com datas sobrepostas → 409 com alternativas; escolher alternativa em um clique. Check-in no dia do check-out da primeira → permitido. Cancelar a primeira → conflito desaparece.
4. **Consulta** (US2): filtrar por status, período, quarto, parceiro e por nome do titular; conferir indicador de fichas.
5. **Link FNRH** (US3): copiar link no detalhe, abrir em janela anônima (viewport 375 px). Ver 2 formulários; salvar rascunho; tentar "Enviar ao hotel" com ficha incompleta → bloqueado; completar e enviar → confirmação e selo "dados enviados" na reserva interna.
6. **Reenvio**: reabrir link, corrigir dado e reenviar → `fnrh_enviada_em` atualizado.
7. **Link inválido**: regenerar link e abrir o antigo; desativar; cancelar reserva → todos mostram mensagem genérica.
8. **Hotel preenche ficha** (US4): editar ficha no detalhe; indicador atualiza; reduzir pessoas com ficha preenchida na última posição → 422.
9. **Parceiro** (US5): criar com e sem parceiro; inativar parceiro → não aparece na seleção, reserva antiga continua exibindo.
10. **Rate limit**: >30 GET/min no link público → 429.

Contratos e modelo: [contracts/reservas.md](contracts/reservas.md), [data-model.md](data-model.md).
