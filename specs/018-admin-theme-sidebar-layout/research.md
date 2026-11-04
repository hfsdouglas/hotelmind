# Phase 0 Research: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

## 1. Gerenciamento do Tema com Tailwind CSS (`classList.toggle('dark')`)

- **Decision**: Criar um contexto React `ThemeContext` em `packages/admin/src/contexts/ThemeContext.tsx` que lê a chave `'theme'` do `localStorage` no momento da inicialização (com fallback para `'light'`) e adiciona ou remove a classe `'dark'` diretamente no elemento `document.documentElement`.
- **Rationale**:
  - O Tailwind CSS utiliza a classe CSS `.dark` no elemento raiz `<html>` para ativar as variantes `dark:*` de estilos.
  - Sincronizar diretamente o DOM (`document.documentElement.classList`) garante que toda a árvore de componentes reaja instantaneamente sem recarregar scripts.
- **Alternatives considered**:
  - Usar atributos de dados (`data-theme="dark"`): rejeitado porque a configuração do Tailwind no projeto já adota a estratégia baseada em classe `.dark`.

## 2. Reposicionamento do Botão de Tema e Logout no Cabeçalho da Sidebar

- **Decision**: Modificar o cabeçalho superior da barra lateral (`Sidebar`) em `admin` e `web` para usar layout `flex items-center justify-between p-4`:
  - Lado esquerdo: Avatar com iniciais, Nome do usuário, papel/hotel e um link "Sair" com `href="#logout"` e `onClick` chamando `logout()`.
  - Lado direito: Botão de alternar tema com ícone `Sun` (quando escuro) ou `Moon` (quando claro).
- **Rationale**:
  - Elimina o rodapé fixo da barra lateral, permitindo que a lista de módulos de navegação ocupe todo o espaço vertical disponível.
  - O link textual "Sair" é muito mais legível e acessível para o usuário do que um pequeno ícone de power isolado na base da tela.
- **Alternatives considered**:
  - Menu suspenso (dropdown) no avatar: rejeitado por adicionar um clique a mais para uma ação comum (alternar tema ou sair).

## 3. Mock e Ambiente de Testes para `localStorage`

- **Decision**: Configurar o mock global de `localStorage` em `packages/admin/src/test/setup.ts` com métodos `getItem`, `setItem`, `removeItem` e `clear`.
- **Rationale**:
  - No ambiente de testes Node/JSDOM, chamadas a `localStorage` podem gerar avisos ou falhas se o mock em memória não estiver explicitamente configurado no `setupFiles`.
