# Feature Specification: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

**Feature Branch**: `018-admin-theme-sidebar-layout`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Implementar suporte completo aos temas claro e escuro no painel administrativo (admin), com persistência no armazenamento local e alternância dinâmica da classe dark. Reorganizar a barra lateral (sidebar) tanto no admin quanto no web, reposicionando o botão de alternância de tema no cabeçalho superior ao lado do perfil do usuário e substituindo o botão de logout isolado no rodapé por um link textual 'Sair' imediatamente abaixo das informações do usuário autenticado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alternância e Persistência do Tema no Painel Administrativo (Priority: P1)

Como administrador gerenciando o painel de administração da plataforma, quero alternar facilmente entre o modo claro e o modo escuro a qualquer momento, com a preferência sendo salva para as próximas sessões, para ter uma experiência visual confortável em diferentes condições de iluminação.

**Why this priority**: O suporte a tema escuro reduz a fadiga visual durante jornadas prolongadas de trabalho e alinha o painel `admin` ao mesmo padrão visual e de acessibilidade já existente no sistema `web`.

**Independent Test**: Acessar o painel administrativo, clicar no botão de alternância de tema no cabeçalho da sidebar, constatar a mudança imediata nas cores de fundo, textos e bordas de todos os componentes da aplicação, recarregar a página e verificar que o tema selecionado foi preservado.

**Acceptance Scenarios**:

1. **Given** que o administrador está usando o tema claro, **When** clica no botão de alternar tema, **Then** o sistema aplica o tema escuro (`classList.add('dark')`), atualiza o ícone/título para indicar que o próximo clique ativará o modo claro e salva `'dark'` no armazenamento local (`theme`).
2. **Given** que o administrador está usando o tema escuro, **When** clica no botão de alternar tema, **Then** o sistema remove a classe escura (`classList.remove('dark')`), exibe o ícone/título para o modo escuro e salva `'light'` no armazenamento local.
3. **Given** que um usuário salvou sua preferência como tema escuro em uma visita anterior, **When** recarrega a página ou retorna à aplicação em uma nova aba, **Then** o painel carrega diretamente no modo escuro sem piscar ou reverter para o tema claro.

---

### User Story 2 - Reposicionamento do Controle de Tema no Perfil do Usuário na Barra Lateral (Priority: P1)

Como usuário ou administrador acessando a barra lateral de navegação (em `web` ou `admin`), quero que o botão de alternar tema esteja localizado no topo da barra, integrado ao card de identificação do usuário, para que eu possa alternar o tema rapidamente sem precisar rolar até a base do menu.

**Why this priority**: Na navegação lateral longa com muitos módulos, botões no rodapé frequentemente exigiam rolagem desnecessária ou entravam em conflito com o rodapé da viewport.

**Independent Test**: Abrir a barra lateral em `web` e em `admin`, verificar que o botão de tema se encontra no canto superior direito do card do usuário autenticado e que ao clicar ele alterna o tema sem fechar a barra.

**Acceptance Scenarios**:

1. **Given** a barra lateral aberta, **When** o usuário observa o cabeçalho superior da barra, **Then** visualiza a foto/iniciais do usuário, nome, perfil/hotel e, à direita, o botão com ícone de sol (quando escuro) ou lua (quando claro).
2. **Given** que o usuário clica no botão de tema no cabeçalho da barra lateral, **When** o clique é registrado, **Then** o tema é alterado imediatamente e a barra lateral permanece aberta e navegável.

---

### User Story 3 - Link Direto de Encerramento de Sessão no Perfil do Usuário (Priority: P2)

Como usuário autenticado, quero ter um link textual claro "Sair" posicionado diretamente abaixo das minhas credenciais (nome e papel/hotel) na barra lateral, para que eu possa encerrar minha sessão com total clareza e sem depender de ícones ambíguos no rodapé.

**Why this priority**: Um link explícito com texto "Sair" reduz dúvidas operacionais e elimina a necessidade de uma seção de rodapé dedicada apenas para ações de encerramento de sessão.

**Independent Test**: Clicar no link "Sair" exibido abaixo das informações do usuário na barra lateral de `web` e `admin`, e verificar que a sessão é encerrada redirecionando o usuário para a página de login correspondente.

**Acceptance Scenarios**:

1. **Given** o usuário autenticado na aplicação, **When** visualiza o bloco de perfil na barra lateral, **Then** um link "Sair" sublinhado e destacado em tom suave (`text-muted-foreground underline hover:text-foreground`) é exibido abaixo do cargo/hotel.
2. **Given** que o usuário clica no link "Sair", **When** o evento de clique é acionado, **Then** o método de logout da sessão ativa é executado e o usuário é redirecionado para a tela de autenticação.
3. **Given** a reorganização da barra lateral, **When** o usuário inspeciona a base da barra, **Then** o antigo rodapé com botões isolados de tema e logout não é mais exibido, deixando o espaço inteiramente para a lista de navegação.

---

### Edge Cases

- **Primeiro acesso (sem preferência de tema salva)**: O sistema deve adotar o tema claro por padrão ou respeitar a preferência inicial sem disparar erros no carregamento inicial.
- **Nomes longos de usuário ou hotel**: O texto do nome e hotel no card superior deve possuir truncamento com reticências (`truncate`) para nunca sobrepor o botão de tema alinhado à direita.
- **Telas móveis com sidebar em gaveta sobreposta**: A ação de logout e de tema no cabeçalho da barra lateral deve funcionar perfeitamente em telas touch, respeitando a área de toque recomendada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O pacote `packages/admin` DEVE disponibilizar um contexto `ThemeContext` e um hook `useTheme` fornecendo o tema atual (`'light' | 'dark'`) e uma função para alternância (`toggleTheme`).
- **FR-002**: O provedor `ThemeProvider` DEVE inicializar o tema consultando o valor armazenado na chave `'theme'` do `localStorage`, aplicando a classe `dark` no elemento raiz `document.documentElement` quando o valor for `'dark'`.
- **FR-003**: Toda alteração de tema acionada pelo usuário DEVE atualizar o estado em memória, alternar a classe `dark` no documento HTML e gravar o novo valor no `localStorage`.
- **FR-004**: O componente `Sidebar` do painel administrativo (`packages/admin`) DEVE incorporar o `ThemeContext` e renderizar o botão de alternância de tema no cabeçalho superior do painel lateral, alinhado à direita do avatar e dados do administrador.
- **FR-005**: O componente `Sidebar` da aplicação de hotéis (`packages/web`) DEVE reposicionar o botão de alternância de tema no cabeçalho superior ao lado do avatar, nome do usuário e nome fantasia do hotel.
- **FR-006**: Ambas as barras laterais (`admin` e `web`) DEVEM renderizar um elemento âncora textual clicável com o rótulo "Sair", com estilo sublinhado e cursor pointer, que execute a função de logout ao ser clicado.
- **FR-007**: As barras laterais DEVEM remover a antiga barra inferior de rodapé (`border-t p-4`) que continha os botões isolados de tema e logout, permitindo que a navegação ocupe o restante do espaço.
- **FR-008**: O ambiente de testes de `packages/admin` DEVE incluir testes unitários para `ThemeContext`, `useTheme` e para a integração do `Sidebar` com o botão de tema e ação de logout.

### Key Entities

- **Theme**: Estado tipado representando o esquema visual ativo (`'light' | 'dark'`).
- **ThemeContext**: Interface do contexto React expondo `theme: Theme` e `toggleTheme: () => void`.
- **SidebarProfile**: Bloco superior de identificação do usuário na barra lateral que agrupa avatar, nome, papel/hotel, link de logout e botão de tema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A alternância de tema entre claro e escuro no `admin` ocorre em menos de 100ms sem recarregar a página.
- **SC-002**: 100% das preferências de tema selecionadas pelo administrador persistem após encerramento da aba ou recarregamento completo da página (`F5`).
- **SC-003**: O botão de tema e o link de logout estão visíveis e utilizáveis imediatamente ao abrir a barra lateral, em 100% das telas sem exigir rolagem vertical.
- **SC-004**: Todos os testes unitários do provedor de tema e do layout da sidebar executam com 100% de aprovação.

## Assumptions

- O Tailwind CSS de `packages/admin` está configurado com estratégia de tema via classe (`darkMode: 'class'`).
- O usuário possui `localStorage` disponível e habilitado no navegador.
- O fluxo de logout existente em `AuthContext` é reutilizado sem alterações na sua lógica de expiração de token.
