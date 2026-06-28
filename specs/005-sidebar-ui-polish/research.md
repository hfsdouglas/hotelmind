# Research: Sidebar UI Polish

## Decision 1: Overlay Strategy

**Decision**: Sidebar permanece `fixed` com z-index elevado (z-40). O layout principal (`app.tsx`) remove o `ml-60`/`ml-0` dinâmico e mantém sempre `ml-0`. Um `<div>` overlay invisível (`fixed inset-0 z-30`) é renderizado atrás do sidebar quando aberto — clicar nele fecha o menu.

**Rationale**: É o padrão "drawer overlay" usado em dashboards. Não requer nenhuma biblioteca adicional — apenas posicionamento CSS com z-index em camadas.

**Alternatives considered**:
- Push layout (ml-72 quando aberto): rejeitado porque causa deslocamento do conteúdo, exatamente o problema a corrigir.
- Portal/modal: desnecessário, CSS position fixed já isola do fluxo do documento.

---

## Decision 2: Toggle Button Accessibility

**Decision**: A `TopNavbar` tem `z-50` — superior ao z-40 do sidebar. O botão sanduíche vive na navbar; como a navbar tem z-index maior, nunca fica coberta pelo sidebar.

**Rationale**: Mudança mínima — apenas um ajuste de z-index na navbar. Sem mover nem duplicar o botão.

**Alternatives considered**:
- Botão flutuante fixo com z-60: moveria o botão para fora da navbar, quebrando o layout.
- Botão dentro do sidebar: exigiria um segundo ponto de controle para fechar quando o menu está fechado.

---

## Decision 3: Bottom Controls in Sidebar

**Decision**: O `<nav>` recebe `flex-1 overflow-y-auto` para ocupar o espaço disponível. Os botões de tema e logout são colocados em um `<div>` após o `<nav>`, com `border-t p-4` — sempre visíveis no rodapé independente da quantidade de itens.

**Rationale**: Padrão de sidebar com `footer`. O `flex-col` já existe no aside; basta reorganizar os filhos.

---

## Decision 4: Power Icon

**Decision**: Substituir `LogOut` por `Power` de `lucide-react` no botão de encerrar sessão do sidebar.

**Rationale**: O ícone `Power` (desligar) comunica melhor "encerrar sessão" no contexto de um sistema de gestão operacional. `LogOut` sugere logout de conta; `Power` sugere encerramento de turno/sessão.

---

## Decision 5: Logout Handler in Sidebar

**Decision**: Substituir `handleLogout` local (que chama `clearSession()` + `navigate('/')`) pelo hook `useLogout` criado na feature 004. Isso garante que o sidebar use o mesmo fluxo completo: chamada à API, fallback com toast de erro, e navegação para `/login`.

**Rationale**: Reutilização do hook existente. Elimina código duplicado e garante consistência de comportamento.

---

## Decision 6: Sidebar Width

**Decision**: Aumentar de `w-60` (240px) para `w-72` (288px).

**Rationale**: `w-72` é o próximo passo de 48px na escala Tailwind — ligeiramente maior sem ser excessivo. Mantém a sidebar proporcional em telas padrão (1280px+).

---

## Decision 7: Avatar Size

**Decision**: Adicionar `className="h-12 w-12"` ao componente `<Avatar>` no sidebar. Tamanho atual implícito: 32px (`h-8 w-8`). Novo tamanho: 48px.

**Rationale**: Avatar maior no sidebar melhora reconhecimento visual do usuário logado.

---

## Decision 8: Notifications Dropdown Background

**Decision**: Substituir `bg-popover` por `bg-card` no dropdown de notificações. Adicionar `border` explícito se não presente.

**Rationale**: `--popover` no tema shadcn/ui pode ter canal alpha, resultando em fundo semitransparente. `bg-card` usa `--card` que é sólido por padrão em todos os temas gerados pelo shadcn.

---

## Decision 9: Sidebar Default State

**Decision**: Alterar `useState(true)` para `useState(false)` em `app.tsx`.

**Rationale**: Requisito explícito do usuário. Menu fechado ao carregar permite foco imediato no conteúdo.

---

## Decision 10: Animation Duration

**Decision**: Manter `transition-transform duration-200` no sidebar (já existente). Não adicionar biblioteca de animação.

**Rationale**: O CSS transform já produz a animação de slide-in/out. Aumentar para `duration-300` se o usuário achar muito rápido — ajuste trivial pós-implementação.
