---
description: "Task list for light/dark theme support in admin and sidebar layout reorganization"
---

# Tasks: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

**Input**: Design documents from `/specs/018-admin-theme-sidebar-layout/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup & Theme Context in Admin

- [X] T001 Implementar `ThemeContext` e `ThemeProvider` em `packages/admin/src/contexts/ThemeContext.tsx`, com leitura inicial do `localStorage` e sincronização da classe `.dark`.
- [X] T002 Implementar hook `useTheme` em `packages/admin/src/hooks/useTheme.ts`.
- [X] T003 Envolver a aplicação com `ThemeProvider` em `packages/admin/src/App.tsx` e helpers de teste em `render_with_providers.tsx`.
- [X] T004 [P] Criar testes unitários para `ThemeContext.spec.tsx` e `useTheme.spec.tsx` em `packages/admin`.

## Phase 2: User Story 1 & 2 - Alternância de Tema e Cabeçalho da Sidebar

- [X] T005 Refatorar `Sidebar.tsx` em `packages/admin/src/components/layout/Sidebar.tsx` integrando o botão de alternância de tema no cabeçalho superior direito ao lado do perfil do usuário.
- [X] T006 [P] Refatorar `Sidebar.tsx` em `packages/web/src/components/layout/Sidebar.tsx` espelhando a mesma posição para o botão de tema.
- [X] T007 Adicionar testes de renderização e clique no botão de tema em `packages/admin/src/components/layout/Sidebar.spec.tsx`.

## Phase 3: User Story 3 - Link Textual Sair e Remoção do Rodapé

- [X] T008 Inserir o link textual clicável "Sair" com estilo sublinhado abaixo dos dados do usuário na sidebar de `packages/admin`.
- [X] T009 Inserir o link textual clicável "Sair" na sidebar de `packages/web`.
- [X] T010 Remover o rodapé inferior antigo (`border-t p-4`) com botões de logout e tema em ambas as sidebars.
- [X] T011 [P] Executar testes automatizados da suíte via `quickstart.md`.
