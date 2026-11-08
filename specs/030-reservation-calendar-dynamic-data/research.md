# Research: Integração de Dados Dinâmicos no Calendário de Reservas

## Context & Objectives

A tela de calendário de reservas (`packages/web/src/pages/app/reservas/calendario.tsx`) implementou com sucesso a visualização matricial temporal, controles de período (1 dia, 15 dias, mês, ano), cálculo responsivo de dias sem scroll horizontal forçado, e células com repartição inteligente de check-in / check-out. No entanto, os dados de quartos e reservas estavam mantidos como constantes estáticas (`mockRooms` e `mockReservations`).

O objetivo é substituir essas constantes estáticas por chamadas à API via TanStack Query (`useQuery`), preservando integralmente o layout, estilos CSS, acessibilidade e interatividade da interface, com as seguintes regras de negócio estritas:
1. Listar quartos dinamicamente via `quartosService.list({ limite: 250, direcao: 'asc' })`.
2. Listar reservas dinamicamente via `reservasService.list({ limite: 250 })`.
3. Filtrar e exibir exclusivamente reservas com status:
   - `a_confirmar`
   - `confirmada`
   - `check_in`
4. Excluir explicitamente reservas com status `cancelada`, `check_out` e `no_show`.
5. Preservar as 2 representações visuais existentes nas células de reserva:
   - Check-in (`r.status === 'check_in'`): `bg-primary` (`status_code: 1`)
   - Confirmada ou A Confirmar (`r.status === 'confirmada' || r.status === 'a_confirmar'`): `bg-primary/50` (`status_code: 0`)
6. Calcular dinamicamente o status do quarto na coluna fixa:
   - Se `quarto.status === 'N'` -> `bloqueado` (`bg-status-blocked`)
   - Se o quarto possuir reserva ativa com status `check_in` cobrindo o dia de hoje (`today`) -> `ocupado` (`bg-status-occupied`)
   - Caso contrário -> `disponivel` (`bg-status-available`).

## Architectural Patterns & Decisions

### Decision 1: Consumo via Serviços Existentes
- **Opção A**: Criar novas rotas dedicadas no backend especificamente para o calendário.
- **Opção B (Escolhida)**: Utilizar os serviços padronizados existentes em `packages/web`:
  - `quartosService.list({ limite: 250, direcao: 'asc' })`
  - `reservasService.list({ limite: 250 })`
  - **Justificativa**: Os endpoints `GET /quartos` e `GET /reservas` já estão totalmente implementados, autenticados por JWT com isolamento estrito de `hotel_id` no backend, e atendem com precisão às necessidades da visualização.

### Decision 2: Tratamento de Fuso Horário em Strings de Data ISO
- **Problema**: Strings no formato `YYYY-MM-DD` passadas para `new Date('YYYY-MM-DD')` são interpretadas em UTC meia-noite pelo padrão ECMAScript. No fuso horário brasileiro (UTC-3), isso gera um deslocamento de -3 horas, recuando a data para as 21:00 do dia anterior e desalinhando a célula de check-in em relação à coluna do dia no calendário.
- **Solução**: Garantir que as datas sejam normalizadas para `YYYY-MM-DDT00:00:00`, forçando a interpretação no fuso horário local onde a tabela foi construída.

### Decision 3: Estrutura do Modal de Detalhes
- O modal atual consulta `selectedReservation.quartoId` em `mockRooms`. Ao tornar os dados dinâmicos, a consulta passa a ser feita na lista real de `rooms` obtida da API (`rooms.find(r => r.id === selectedReservation.quartoId)?.numero`), garantindo consistência com o número e dados reais do quarto.
- O campo documento busca `hospedes?.[0]?.numero_documento` caso exista ou exibe `-`.
- O valor é formatado em moeda brasileira `R$ 0,00`.

### Decision 4: Tolerância de Carregamento e Fallback Seguro
- Enquanto as queries do TanStack Query estão carregando (`isLoadingQuartos` ou `isLoadingReservas`), a interface renderiza a estrutura com segurança, permitindo feedback suave e testes com injeção de QueryClient sem quebrar renderizações síncronas.
