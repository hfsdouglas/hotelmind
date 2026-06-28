---
description: "Task list for Sidebar UI Polish"
---

# Tasks: Sidebar UI Polish

**Feature**: `005-sidebar-ui-polish`
**Input**: `specs/005-sidebar-ui-polish/plan.md`, `spec.md`, `research.md`, `quickstart.md`

**Scope**: 1 package afetado — `packages/web` (4 arquivos, todos existentes).
3 user stories independentes sem dependências cruzadas obrigatórias.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Paralelizável — arquivos diferentes, sem dependências incompletas
- **[Story]**: Qual user story (US1, US2, US3)
- Caminhos relativos ao repositório raiz

---

## Phase 1: Setup

**Objetivo**: Confirmar que o baseline está verde antes de qualquer mudança.

- [X] T001 Run `npx tsc --noEmit` em `packages/web` — confirmar zero erros antes de qualquer alteração

---

## Phase 2: US1 — Sidebar Overlay & Defaults (P1) 🎯 MVP

**Goal**: Sidebar flutua sobre o conteúdo (sem deslocamento), inicia fechado, é ligeiramente mais largo, animação suave.

**Independent Test**: Abrir e fechar o menu — o conteúdo da página não se move. Menu está fechado ao carregar.

### Implementation for US1

- [X] T002 [P] [US1] Update `packages/web/src/pages/_layouts/app.tsx`:
  - Alterar `useState(true)` → `useState(false)` (menu fechado por padrão)
  - Remover as classes dinâmicas `ml-60`/`ml-0` do div de conteúdo (sempre `ml-0`)
  - Adicionar overlay invisível: `{sidebarOpen && <div className="fixed inset-0 z-30" onClick={() => setSidebarOpen(false)} />}`
  - O overlay deve ser renderizado entre `<Sidebar>` e o div de conteúdo

- [X] T003 [P] [US1] Update `packages/web/src/components/layout/Sidebar.tsx`:
  - Alterar `w-60` → `w-72` (288px)
  - Alterar `z-20` → `z-40`
  - Alterar `duration-200` → `duration-300` na classe de transição

**Checkpoint**: Menu inicia fechado. Abrir o menu — conteúdo não se move. Clicar fora — menu fecha.

---

## Phase 3: US2 — Sidebar Controls & Toggle Accessibility (P2)

**Goal**: Botões de tema e logout ficam no rodapé do sidebar. Ícone power substitui LogOut. Botão sanduíche sempre visível acima do sidebar.

**Independent Test**: Abrir menu — botão ☰ da navbar visível e clicável acima do sidebar. Rodapé do sidebar contém os botões de tema e power.

### Implementation for US2

- [X] T004 [US2] Update `packages/web/src/components/layout/Sidebar.tsx` (depends on T003):
  - Remover o `<div className="flex gap-1">` com os botões de tema e logout da seção de cabeçalho
  - Garantir que `<nav>` tenha `flex-1 overflow-y-auto` (para ocupar o espaço disponível)
  - Adicionar após o `</nav>` um novo bloco:
    ```tsx
    <div className="border-t p-4 flex gap-1">
      {/* botão de tema */}
      {/* botão de logout */}
    </div>
    ```
  - Substituir `import { ..., LogOut, ... }` → `Power` (remover LogOut, adicionar Power)
  - Substituir `<LogOut className="h-4 w-4" />` → `<Power className="h-4 w-4" />`
  - Substituir `handleLogout` local por `useLogout` hook:
    - Remover `const navigate = useNavigate()` (se não for mais usado por outra coisa)
    - Adicionar `import { useLogout } from '@/hooks/useLogout'`
    - Adicionar `const { logout } = useLogout()` no corpo do componente
    - Substituir `onClick={handleLogout}` → `onClick={logout}` no botão
  - Adicionar `className="h-12 w-12"` ao componente `<Avatar>` (avatar maior)

- [X] T005 [P] [US2] Update `packages/web/src/components/layout/TopNavbar.tsx`:
  - Alterar `z-10` → `z-50` na className do `<header>` para garantir que a navbar fique acima do sidebar (z-40)

**Checkpoint**: Botão ☰ visível com o menu aberto. Rodapé do sidebar exibe ícone power e botão de tema. Clicar no power → redireciona para `/login`.

---

## Phase 4: US3 — Navbar & Notifications Polish (P3)

**Goal**: Navbar só com notificações (sem logout). Dropdown de notificações com fundo sólido.

**Independent Test**: Navbar exibe apenas sino de notificações. Abrir dropdown — fundo opaco visível.

### Implementation for US3

- [X] T006 [US3] Update `packages/web/src/components/layout/TopNavbar.tsx` (depends on T005):
  - Remover `import { LogOut, Menu }` → manter apenas `import { Menu } from 'lucide-react'`
  - Remover `import { useLogout } from '@/hooks/useLogout'`
  - Remover `const { logout } = useLogout()` do corpo do componente
  - Remover o `<Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">` com `<LogOut />`
  - O `<div className="ml-auto flex items-center gap-2">` deve conter apenas `<NotificationsDropdown />`

- [X] T007 [P] [US3] Update `packages/web/src/components/layout/notifications-dropdown.tsx`:
  - Substituir `bg-popover` → `bg-card` no `<div>` do dropdown aberto
  - Resultado: `className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border bg-card p-2 shadow-md"`

**Checkpoint**: Navbar sem botão de logout. Dropdown de notificações com fundo sólido (bg-card).

---

## Phase 5: Polish & Validation

- [X] T008 Run `npx tsc --noEmit` em `packages/web` — zero erros de tipo após todas as mudanças

- [X] T009 Validar manualmente os cenários do `quickstart.md`:
  - Menu fechado ao carregar ✓
  - Overlay sem deslocamento de conteúdo ✓
  - Fechar pelo clique fora ✓
  - Botão ☰ acessível com menu aberto ✓
  - Controles no rodapé do menu ✓
  - Ícone power ✓
  - Navbar só com notificações ✓
  - Avatar maior ✓
  - Dropdown com fundo opaco ✓
  - Logout pelo menu funciona ✓

---

## Dependencies & Execution Order

| Task | Depends on | Arquivo | Notas |
|------|-----------|---------|-------|
| T001 | — | — | Baseline |
| T002 | T001 | `app.tsx` | Paralelo com T003 |
| T003 | T001 | `Sidebar.tsx` | Paralelo com T002 |
| T004 | T003 | `Sidebar.tsx` | Mesmo arquivo que T003 — sequencial |
| T005 | T001 | `TopNavbar.tsx` | Independente de T002–T004 |
| T006 | T005 | `TopNavbar.tsx` | Mesmo arquivo que T005 — sequencial |
| T007 | T001 | `notifications-dropdown.tsx` | Totalmente independente — pode ser [P] a qualquer momento |
| T008 | T004, T006, T007 | — | Validação final |
| T009 | T008 | — | Validação manual |

### Parallel Opportunities

```
# US1 (arquivos diferentes — paralelo total):
T002  packages/web/src/pages/_layouts/app.tsx
T003  packages/web/src/components/layout/Sidebar.tsx

# US2 (TopNavbar.tsx independente de Sidebar.tsx):
T004  packages/web/src/components/layout/Sidebar.tsx
T005  packages/web/src/components/layout/TopNavbar.tsx

# US3 (arquivos diferentes — paralelo total):
T006  packages/web/src/components/layout/TopNavbar.tsx
T007  packages/web/src/components/layout/notifications-dropdown.tsx
```

---

## Implementation Strategy

### MVP (US1 apenas — comportamento de overlay)

1. T001: baseline
2. T002 + T003 (paralelo): overlay + sidebar maior
3. T008: type check
4. **STOP e VALIDE**: menu inicia fechado, overlay funciona, sem deslocamento

### Full Delivery

1. US1 (T001–T003) → overlay e tamanho ✅
2. US2 (T004–T005) → controles no rodapé, acessibilidade do toggle ✅
3. US3 (T006–T007) → navbar limpa, dropdown opaco ✅
4. Polish (T008–T009) → type check + validação manual ✅

---

## Notes

- Avatar maior (h-12 w-12) está no T004 pois toca o mesmo arquivo (Sidebar.tsx) já modificado em US2
- T007 (notifications-dropdown.tsx) pode ser executado em paralelo com qualquer outro task de US2 ou US3
- Nenhum arquivo novo — apenas modificações em arquivos existentes
- Nenhuma alteração em `packages/api`
- `useLogout` hook já existe (criado na feature 004) — apenas importar
