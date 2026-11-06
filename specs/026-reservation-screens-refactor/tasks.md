# Tasks: Refatoração das Telas de Reservas (Consulta e Nova Reserva)

**Input**: Documentos de design em `specs/026-reservation-screens-refactor/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`

**Tests**: Testes de regressão e renderização das páginas de reservas já existentes em `packages/web` devem ser mantidos e atualizados.

**Organization**: Tarefas agrupadas por fases e por história de usuário para viabilizar execução e validação independentes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação de ambiente e alinhamento dos contratos visuais de design

- [X] T001 Verificar ambiente de desenvolvimento e execução dos testes existentes em `packages/web/src/pages/app/reservas/`
- [X] T002 Validar tokens semânticos e componentes compartilhados de UI disponíveis em `packages/web/src/components/ui/` e `packages/web/src/components/forms/CrudFormLayout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pré-requisitos bloqueantes comuns para o alinhamento visual das telas

**⚠️ CRITICAL**: Nenhuma alteração nas histórias de usuário deve ser iniciada sem validar a conformidade dos componentes base.

- [X] T003 Auditar e catalogar referências visuais e classes utilitárias no padrão consolidado em `packages/web/src/pages/app/reservas/orcamentos/novo.tsx` e `packages/web/src/pages/app/reservas/orcamentos/index.tsx`
- [X] T004 Garantir utilitários de formatação de datas e moeda (`formatarDataBR`, `formatarMoeda`, `usePhoneMask`) compatíveis em `packages/web/src/pages/app/reservas/nova.tsx` e `packages/web/src/pages/app/reservas/index.tsx`

---

## Phase 3: User Story 1 - Nova Reserva com Formulário Padronizado e Alinhado (Priority: P1) 🎯 MVP

**Goal**: Refatorar o formulário de cadastro de nova reserva para alinhar visualmente com o padrão multi-step de orçamentos, adicionando ícones auxiliares em inputs, banner dinâmico de diárias calculadas, cards semânticos de regimes e suítes, e resumo de valor total.

**Independent Test**: Executar os testes em `packages/web/src/pages/app/reservas/nova.spec.tsx` e validar visualmente o preenchimento de ponta a ponta em `/reservas/nova` com feedbacks de período e seleção de quartos.

### Implementation for User Story 1

- [X] T005 [US1] Padronizar cabeçalhos de seção e títulos dos passos (Passos 1 a 4) com ícones temáticos (`text-primary`), tipografia uniforme (`text-lg font-semibold`) e divisores em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T006 [US1] Adicionar cálculo de noites e banner informativo de período selecionado com ícone `CheckCircle2` e datas formatadas no Passo 1 em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T007 [US1] Aplicar ícones decorativos à esquerda (`Users`) com `pl-9 h-9` e alinhamento vertical uniforme para inputs de adultos e crianças no Passo 1 em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T008 [US1] Refatorar grid de seleção de Regimes de Alimentação (Passo 2) utilizando tokens semânticos (`border-border`, `bg-card`, hover, foco `ring-2 ring-primary/20 bg-primary/5 border-primary`) e borda protetora no ponto de cor da pulseira em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T009 [US1] Refatorar cards de Suítes Disponíveis (Passo 3) com tokens semânticos, badge de limite de hóspedes, linha divisória e preço alinhado no rodapé do card em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T010 [US1] Padronizar o estado vazio/informativo da consulta de disponibilidade com ícone `Info` e borda tracejada em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T011 [US1] Refatorar o Card de Resumo de Valor Total Calculado utilizando estrutura temática padronizada com tokens do Design System em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T012 [US1] Adicionar ícones contextuais à esquerda (`User`, `Phone`, `Mail`) com `pl-9 h-9` e alinhar o seletor de Parceiro Comercial em grid de 2 colunas com o campo de Observações no Passo 4 em `packages/web/src/pages/app/reservas/nova.tsx`
- [X] T013 [US1] Atualizar e estender os testes unitários de renderização e interação do formulário em `packages/web/src/pages/app/reservas/nova.spec.tsx`

**Checkpoint**: User Story 1 (Nova Reserva) totalmente funcional, alinhada e validada de forma independente.

---

## Phase 4: User Story 2 - Consulta de Reservas com Filtros e Tabela Harmonizada (Priority: P2)

**Goal**: Harmonizar a tela de listagem de reservas (`/reservas`), alinhando os seletores de filtro à barra de busca em altura e estilo, padronizando as colunas da tabela e adotando botões de ação consistentes.

**Independent Test**: Executar os testes em `packages/web/src/pages/app/reservas/index.spec.tsx` e `packages/web/src/pages/app/reservas/reservas_pages.spec.tsx`, e validar visualmente o alinhamento da barra de ferramentas e das colunas em `/reservas`.

### Implementation for User Story 2

- [X] T014 [US2] Harmonizar os filtros de Status e Parceiro Comercial em `ListPageLayout` com altura `h-9`, borda `border-input`, fundo `bg-background` e cantos arredondados alinhados à `SearchBar` em `packages/web/src/pages/app/reservas/index.tsx`
- [X] T015 [US2] Substituir classes de cores arbitrárias (`text-indigo-600`) na coluna de código por tokens semânticos (`text-primary hover:underline`) em `packages/web/src/pages/app/reservas/index.tsx`
- [X] T016 [US2] Padronizar a exibição da acomodação e do regime com indicador de cor protegido por borda em `packages/web/src/pages/app/reservas/index.tsx`
- [X] T017 [US2] Padronizar os botões de ação por linha da tabela como `variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"` com indicação de acessibilidade em `packages/web/src/pages/app/reservas/index.tsx`
- [X] T018 [US2] Atualizar e validar os testes unitários e de integração de rotas da listagem em `packages/web/src/pages/app/reservas/index.spec.tsx` e `packages/web/src/pages/app/reservas/reservas_pages.spec.tsx`

**Checkpoint**: User Story 2 (Consulta de Reservas) perfeitamente alinhada e testada de forma independente.

---

## Phase 5: User Story 3 - Coerência Visual em Modo Claro e Escuro (Priority: P3)

**Goal**: Garantir que nenhum elemento nas telas de reservas utilize cores fixas arbitrárias, assegurando contraste perfeito e compatibilidade total em temas claro e escuro.

**Independent Test**: Inspeção de código via linter e teste de renderização com alternância de classes de tema dark/light nas telas de reservas.

### Implementation for User Story 3

- [X] T019 [US3] Auditar e remover quaisquer classes residuais `indigo-*` ou cores fixas arbitrárias em `packages/web/src/pages/app/reservas/nova.tsx` e `packages/web/src/pages/app/reservas/index.tsx`
- [X] T020 [US3] Validar e harmonizar os contrastes das badges de status e tags de feedback para renderização idêntica em temas claro e escuro em `packages/web/src/pages/app/reservas/index.tsx`

**Checkpoint**: Telas com suporte íntegro aos temas claro e escuro em estrita conformidade com o Design System.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação global de qualidade, formatação de código e integridade da suíte de testes

- [X] T021 Executar suíte completa de testes de reservas com `npm --prefix packages/web test -- src/pages/app/reservas/`
- [X] T022 Executar verificação e formatação do código com Biome (`npx @biomejs/biome check packages/web/src/pages/app/reservas/`)
- [X] T023 Validar todos os cenários práticos descritos no guia `quickstart.md` em `specs/026-reservation-screens-refactor/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — bloqueia as histórias de usuário.
- **User Story 1 (Phase 3 - P1)**: Depende da Fase Foundational — MVP principal do formulário de criação de reserva.
- **User Story 2 (Phase 4 - P2)**: Depende da Fase Foundational — refatoração da listagem e filtros.
- **User Story 3 (Phase 5 - P3)**: Depende da conclusão de US1 e US2 para varredura e fechamento de contraste nos dois temas.
- **Polish (Phase 6)**: Depende da conclusão de todas as histórias de usuário.

### User Story Dependencies

- **US1 (Nova Reserva)**: Totalmente independente da listagem; foca exclusivamente em `nova.tsx` e `nova.spec.tsx`.
- **US2 (Consulta de Reservas)**: Totalmente independente do formulário; foca em `index.tsx` e `index.spec.tsx` / `reservas_pages.spec.tsx`.
- **US3 (Temas Claro/Escuro)**: Refinamento transversal sobre os arquivos de US1 e US2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup (Phase 1) e Foundational (Phase 2).
2. Implementar User Story 1 (Phase 3: tarefas T005 a T013).
3. Validar de forma independente com os testes de `nova.spec.tsx` e inspeção do formulário `/reservas/nova`.
4. MVP entregue com o formulário de reserva alinhado ao padrão de orçamentos.

### Incremental Delivery

1. MVP entregue (Nova Reserva padronizada).
2. Adicionar User Story 2 (Consulta e Filtros padronizados na listagem).
3. Adicionar User Story 3 (Auditoria de dark/light mode e tokens semânticos).
4. Rodar Polish (Phase 6) garantindo zero regressões e formatação impecável.
