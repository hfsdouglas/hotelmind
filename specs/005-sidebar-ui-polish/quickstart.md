# Quickstart: Sidebar UI Polish

## Pré-requisitos

```sh
# Na raiz do monorepo
pnpm install

# Iniciar o servidor de desenvolvimento
cd packages/web && pnpm dev
```

## Cenários de Validação

### Cenário 1: Menu fechado ao carregar

1. Acesse a aplicação autenticado.
2. **Esperado**: O menu lateral está fechado. O conteúdo ocupa toda a largura disponível.

### Cenário 2: Overlay sem deslocamento de conteúdo

1. Com o menu fechado, clique no botão sanduíche (☰) na navbar.
2. **Esperado**: O menu lateral desliza para a esquerda sobre o conteúdo com animação suave.
3. O conteúdo da página NÃO se move para a direita.

### Cenário 3: Fechar pelo overlay

1. Com o menu aberto, clique em qualquer área da página fora do menu.
2. **Esperado**: O menu fecha com animação.

### Cenário 4: Botão sanduíche acessível com menu aberto

1. Abra o menu lateral.
2. Observe a navbar.
3. **Esperado**: O botão ☰ está visível e clicável acima do menu lateral.
4. Clique no botão ☰.
5. **Esperado**: O menu fecha.

### Cenário 5: Controles no rodapé do menu

1. Abra o menu lateral.
2. Role a navegação (se necessário) e observe o rodapé.
3. **Esperado**: Os botões de tema (sol/lua) e encerrar sessão (ícone power) estão na parte inferior do menu, separados por uma linha divisória.

### Cenário 6: Ícone de power

1. Abra o menu lateral.
2. Observe o botão de encerrar sessão no rodapé.
3. **Esperado**: O ícone é um círculo com traço vertical (power/desligar), não uma seta de saída.

### Cenário 7: Navbar sem logout

1. Observe a navbar superior com o menu aberto ou fechado.
2. **Esperado**: Apenas o ícone de sino (notificações). Sem ícone de sair na navbar.

### Cenário 8: Avatar maior

1. Abra o menu lateral.
2. **Esperado**: O avatar do usuário é visivelmente maior que 32px (tamanho anterior).

### Cenário 9: Dropdown de notificações opaco

1. Clique no ícone de sino na navbar.
2. **Esperado**: O dropdown abre com fundo sólido (não transparente), legível sobre qualquer conteúdo de página.

### Cenário 10: Encerrar sessão pelo menu

1. Abra o menu lateral, clique no botão de encerrar sessão.
2. **Esperado**: Redirecionado para `/login`. Sessão encerrada.
