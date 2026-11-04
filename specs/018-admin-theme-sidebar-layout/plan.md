# Implementation Plan: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

**Branch**: `018-admin-theme-sidebar-layout` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/018-admin-theme-sidebar-layout/spec.md)

**Input**: Feature specification from `/specs/018-admin-theme-sidebar-layout/spec.md`

## Summary

Implementar e unificar a gestão de tema e o layout da barra lateral entre as aplicações `admin` e `web`:
1. Provedor de tema `ThemeContext` e hook `useTheme` no pacote `packages/admin`, persistindo a chave `'theme'` (`'light' | 'dark'`) no `localStorage` e alternando a classe `.dark` em `document.documentElement`.
2. Reposicionamento do botão de alternância de tema no cabeçalho superior do componente `Sidebar` (ao lado das informações de perfil do usuário) em `admin` e `web`.
3. Inclusão de link textual de ação rápida "Sair" (`<a>` sublinhada com interceptação de clique) logo abaixo da identificação do usuário na barra lateral.
4. Remoção da seção de rodapé da sidebar em ambos os pacotes, liberando a área para a navegação dos módulos.
5. Criação de testes unitários em Vitest cobrindo o ciclo de vida do tema e a renderização dos componentes na sidebar.

## Technical Context

**Language/Version**: TypeScript 5.8 (React 19 no pacote `packages/admin` e `packages/web`)

**Primary Dependencies**: React 19, Tailwind CSS 4, Lucide React (`Sun`, `Moon`), Vitest + Testing Library

**Storage**: `localStorage` (chave `'theme'`: `'light' | 'dark'`)

**Testing**: Vitest + `@testing-library/react` (`packages/admin`)

**Target Platform**: Navegadores web modernos (desktop e mobile responsivo)

**Project Type**: Frontend compartilhado em monorepo

**Performance Goals**: Alternância de tema instantânea (< 16ms) sem recarregamento da aplicação

**Constraints**: Seguir convenção `snake_case` nos testes e hooks; formatação Biome; sem dependências de pacotes externos pesados

**Scale/Scope**: `ThemeContext.tsx`, `useTheme.ts`, `Sidebar.tsx` em `packages/admin` e `Sidebar.tsx` em `packages/web`, além de testes em `test/setup.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Não envolve contratos compartilhados de rede; estado puramente do cliente.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Contexto de tema isolado na pasta `contexts/`, desacoplado de roteamento ou regras de negócio.
- **III. SOLID Principles**: ✅ Pass — `ThemeProvider` é responsável apenas por temas; `Sidebar` apenas por navegação e apresentação.
- **IV. Explicit over Implicit**: ✅ Pass — Tema lido e gravado explicitamente no `localStorage`.
- **V. Low Coupling, High Cohesion**: ✅ Pass — Os componentes de UI apenas consomem o hook `useTheme`.
- **VI. Clean Code**: ✅ Pass — Nomes expressivos, ausência de magic literals e conformidade com o Biome.
- **VII. Testability by Design**: ✅ Pass — Testes automatizados cobrem o `ThemeProvider`, alternância claro/escuro e eventos de clique no `Sidebar`.

## Project Structure

### Documentation (this feature)

```text
specs/018-admin-theme-sidebar-layout/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Checklist de validação
└── tasks.md             # Phase 2 output
```

### Source Code

```text
packages/
├── admin/src/
│   ├── components/layout/
│   │   ├── Sidebar.tsx
│   │   └── Sidebar.spec.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── ThemeContext.spec.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useTheme.spec.tsx
│   ├── test/
│   │   ├── render_with_providers.tsx
│   │   └── setup.ts
│   └── App.tsx
└── web/src/
    └── components/layout/
        └── Sidebar.tsx
```
