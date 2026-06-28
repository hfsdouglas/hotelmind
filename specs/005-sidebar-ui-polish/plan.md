# Implementation Plan: Sidebar UI Polish

**Branch**: `005-sidebar-ui-polish` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-sidebar-ui-polish/spec.md`

## Summary

Refinamentos visuais e funcionais no layout do painel: o sidebar passa a flutuar sobre o conteúdo (overlay) em vez de empurrá-lo, inicia fechado, recebe animação de slide, botão sanduíche permanece acessível, controles de tema/logout movem-se para o rodapé do sidebar com ícone power, a navbar perde o botão de logout, o avatar fica maior e o dropdown de notificações ganha fundo sólido.

Escopo: **`packages/web` apenas**. 4 arquivos modificados, nenhum novo arquivo, sem alterações de backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: React 18, Tailwind CSS v3, shadcn/ui, lucide-react, React Router v6

**Storage**: N/A (sem alterações de estado persistido; menu sempre inicia fechado)

**Testing**: TypeScript `tsc --noEmit` — nenhum teste de unidade requerido para mudanças puramente visuais

**Target Platform**: Web SPA (browsers modernos, desktop first)

**Project Type**: Frontend web application — `packages/web`

**Performance Goals**: Animação de sidebar a 60fps (CSS transform, sem layout recalc)

**Constraints**: Sem novas dependências; sem alterações de API ou contratos

**Scale/Scope**: 4 arquivos, ~50 linhas alteradas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Aplicável? | Status |
|---|---|---|
| I — Contract-First | Não — sem contratos inter-serviço | ✅ N/A |
| II — Clean Architecture | Parcial — UI não tem camadas de backend | ✅ Componentes respeitam responsabilidade única |
| III — SOLID | ✅ | ✅ Cada componente tem uma única responsabilidade |
| IV — Explicit over Implicit | ✅ | ✅ Estado do sidebar é prop explícita; overlay usa onClick explícito |
| V — Low Coupling | ✅ | ✅ Sidebar recebe `isOpen`/`onClose` via props; não acessa estado global diretamente |
| VI — Clean Code | ✅ | ✅ snake_case, nomes claros, sem magic values |
| VII — Testability | Parcial | ✅ Sem novos testes de unidade; type check valida a implementação |

**Violations**: Nenhuma. Feature é puramente de apresentação dentro de `packages/web`.

## Project Structure

### Documentation (this feature)

```text
specs/005-sidebar-ui-polish/
├── plan.md              ← este arquivo
├── research.md          ← decisões técnicas (Phase 0)
├── quickstart.md        ← cenários de validação (Phase 1)
└── tasks.md             ← gerado por /speckit-tasks
```

### Source Code (files affected)

```text
packages/web/src/
├── pages/_layouts/
│   └── app.tsx                              ← remove ml-offset, add overlay, state=false
├── components/layout/
│   ├── Sidebar.tsx                          ← w-72, controls ao bottom, Power icon, useLogout
│   ├── TopNavbar.tsx                        ← remove logout button
│   └── notifications-dropdown.tsx          ← bg-card (fundo opaco)
```

**Nenhum arquivo novo.** Nenhuma alteração em `packages/api`.

## Implementation Details

### 1. `app.tsx` — Overlay layout

**Antes**:
```tsx
const [sidebarOpen, setSidebarOpen] = useState(true)

<div className={cn('flex flex-1 flex-col transition-all duration-200',
  sidebarOpen ? 'ml-60' : 'ml-0'
)}>
```

**Depois**:
```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)

{/* overlay de fecho ao clicar fora */}
{sidebarOpen && (
  <div
    className="fixed inset-0 z-30"
    onClick={() => setSidebarOpen(false)}
  />
)}

<div className="flex flex-1 flex-col">   {/* ml removido */}
```

Passar `onClose={() => setSidebarOpen(false)}` para `<Sidebar>` não é necessário pois o overlay cobre o clique fora. O botão toggle continua em `TopNavbar`.

### 2. `Sidebar.tsx` — Estrutura redesenhada

Mudanças:
- `w-60` → `w-72` (288px)
- `z-20` → `z-40` (acima do overlay z-30, abaixo da navbar z-50)
- `duration-200` → `duration-300` para animação mais suave
- Avatar: adicionar `className="h-12 w-12"`
- Mover `<div className="flex gap-1">` (botões de tema + logout) para **após** o `<nav>`, antes de fechar o `<aside>`, com `border-t p-4`
- Substituir `LogOut` → `Power` (ícone de desligar)
- Substituir `handleLogout` local → `useLogout` hook
- O `<nav>` mantém `flex-1 overflow-y-auto`

Estrutura resultante do `<aside>`:
```
<aside>
  <div>                    ← cabeçalho: avatar + nome
  <Separator />
  <nav flex-1>             ← navegação principal
  <div border-t p-4>       ← rodapé: tema + power
</aside>
```

### 3. `TopNavbar.tsx` — Remover logout

Remover:
- Import `LogOut` de lucide-react
- Import `useLogout`
- `const { logout } = useLogout()`
- Botão `<Button ... onClick={logout}>` com ícone `LogOut`

Manter apenas: botão sanduíche + `<NotificationsDropdown />`.

Ajustar navbar para `z-50` para garantir que fique acima do sidebar (z-40):
```tsx
<header className="sticky top-0 z-50 ...">
```

### 4. `notifications-dropdown.tsx` — Fundo opaco

Trocar `bg-popover` por `bg-card` no `<div>` do dropdown:
```tsx
<div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border bg-card p-2 shadow-md">
```

## Complexity Tracking

Nenhuma violação de constituição identificada. Tabela não aplicável.
