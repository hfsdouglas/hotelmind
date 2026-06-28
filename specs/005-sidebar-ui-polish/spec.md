# Feature Specification: Sidebar UI Polish

**Feature Branch**: `005-sidebar-ui-polish`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Melhorias visuais e funcionais no front-end — menu lateral sobreposto, maior, animado, botão sanduíche acessível, controles na parte inferior, ícone de power-off, navbar só com notificações, avatar maior, dropdown de notificações com background."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sidebar Overlay & Defaults (Priority: P1)

O usuário acessa o sistema e o menu lateral está fechado por padrão. Ao abrir o menu, ele flutua sobre o conteúdo sem redimensioná-lo. Ao fechar, o conteúdo permanece no mesmo lugar. A transição de abertura e fechamento é animada.

**Why this priority**: É o comportamento mais impactante visualmente e afeta todos os usuários ao navegar. O redimensionamento brusco do conteúdo é a maior queixa de usabilidade.

**Independent Test**: Abrir e fechar o menu lateral — o conteúdo da página não se move. O menu começa fechado ao carregar a aplicação.

**Acceptance Scenarios**:

1. **Given** o usuário acabou de autenticar, **When** a tela é exibida, **Then** o menu lateral está fechado.
2. **Given** o menu está fechado, **When** o usuário clica no botão de menu, **Then** o menu desliza sobre o conteúdo com animação suave.
3. **Given** o menu está aberto, **When** o usuário clica no botão de menu, **Then** o menu recua com animação suave e o conteúdo não muda de posição.
4. **Given** o menu está aberto, **When** o usuário clica fora do menu, **Then** o menu fecha.
5. **Given** o menu está aberto, **When** examinado o layout, **Then** o menu é ligeiramente mais largo que o anterior.

---

### User Story 2 — Sidebar Controls & Toggle Accessibility (Priority: P2)

O botão de abrir/fechar o menu (sanduíche) permanece visível e acessível mesmo com o menu aberto. Os botões de tema (claro/escuro) e de encerrar sessão ficam na parte inferior do menu lateral. O ícone do botão de encerrar sessão é substituído pelo ícone de desligar (power-off).

**Why this priority**: A disposição dos controles afeta a ergonomia diária do operador. Mover ações secundárias (tema, logout) para baixo libera espaço visual na área de navegação principal.

**Independent Test**: Abrir o menu → botão sanduíche está visível e clicável. Verificar que os botões de tema e encerrar sessão estão na parte inferior do menu, com o ícone de power-off para encerrar sessão.

**Acceptance Scenarios**:

1. **Given** o menu está aberto, **When** o usuário observa a tela, **Then** o botão de menu (sanduíche) está visível e não coberto pelo menu lateral.
2. **Given** o menu está aberto, **When** o usuário clica no botão de menu (sanduíche), **Then** o menu fecha normalmente.
3. **Given** o menu está aberto, **When** o usuário rola a navegação até o final, **Then** os botões de tema e encerrar sessão aparecem fixos na parte inferior do menu.
4. **Given** o menu está aberto, **When** o usuário observa o botão de encerrar sessão, **Then** o ícone exibido é o de desligar (power-off), não o ícone de seta de saída.

---

### User Story 3 — Navbar & Notifications Polish (Priority: P3)

A navbar superior exibe apenas o botão de notificações (sem botão de encerrar sessão). O avatar do usuário é maior. O dropdown de notificações possui cor de fundo visível.

**Why this priority**: São refinamentos estéticos que melhoram a legibilidade e a consistência visual. O encerramento de sessão está agora centralizado no menu lateral.

**Independent Test**: Verificar que a navbar contém apenas o botão de notificações. Comparar o tamanho do avatar antes e depois. Abrir o dropdown de notificações e confirmar que o fundo é opaco.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado, **When** observa a navbar, **Then** há apenas o botão de notificações — sem botão de encerrar sessão.
2. **Given** o usuário está na navbar, **When** observa o avatar na sidebar, **Then** o avatar é visivelmente maior que o tamanho anterior.
3. **Given** o usuário clica no sino de notificações, **When** o dropdown abre, **Then** ele possui fundo opaco (não transparente) que contrasta com o conteúdo por trás.

---

### Edge Cases

- O que acontece se o menu for aberto em telas pequenas (mobile)? — O comportamento overlay resolve a sobreposição em qualquer largura.
- O que acontece se o usuário abrir o menu e navegar para outra página? — O menu permanece no estado em que estava (estado gerenciado no layout raiz).
- O que acontece se o usuário clicar no overlay (área fora do menu) — O menu fecha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu lateral DEVE iniciar fechado ao carregar a aplicação.
- **FR-002**: O menu lateral DEVE se sobrepor ao conteúdo principal ao abrir, sem alterar a posição ou largura do conteúdo.
- **FR-003**: O menu lateral DEVE ter largura ligeiramente maior que a versão anterior (w-60 → w-72).
- **FR-004**: A abertura e o fechamento do menu lateral DEVEM ser acompanhados de animação de deslize suave.
- **FR-005**: Clicar fora do menu lateral (no overlay) DEVE fechar o menu.
- **FR-006**: O botão de menu (sanduíche) DEVE permanecer visível e clicável quando o menu estiver aberto.
- **FR-007**: Os botões de tema e encerrar sessão DEVEM estar fixos na parte inferior do menu lateral.
- **FR-008**: O ícone do botão de encerrar sessão no menu lateral DEVE ser o ícone de desligar (Power), não o ícone de saída (LogOut).
- **FR-009**: A navbar superior NÃO DEVE conter botão de encerrar sessão — apenas o botão de notificações.
- **FR-010**: O avatar do usuário no menu lateral DEVE ser visivelmente maior que o tamanho atual.
- **FR-011**: O dropdown de notificações DEVE ter fundo opaco e visível, não transparente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O conteúdo principal não muda de posição ao abrir ou fechar o menu (zero deslocamento de layout).
- **SC-002**: O menu inicia fechado em 100% dos carregamentos da aplicação.
- **SC-003**: O botão de menu está acessível (visível e clicável) em todos os estados do menu (aberto ou fechado).
- **SC-004**: Os controles de tema e encerrar sessão estão sempre visíveis na parte inferior do menu, independentemente da quantidade de itens de navegação.
- **SC-005**: O dropdown de notificações é legível sobre qualquer fundo de página, sem transparência.

## Assumptions

- O encerramento de sessão no menu lateral usará o mesmo hook `useLogout` criado na feature 004.
- Não há requisito de persistência do estado do menu (aberto/fechado) entre navegações ou recarregamentos — abre fechado sempre.
- O overlay de fechamento ao clicar fora aplica-se apenas em desktop; comportamento mobile não é escopo desta feature.
- O avatar maior aplica-se apenas ao menu lateral (a navbar não possui avatar atualmente).
- Animação de abertura/fechamento usa transição CSS (sem biblioteca de animação adicional).
