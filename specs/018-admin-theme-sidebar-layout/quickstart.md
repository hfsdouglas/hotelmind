# Quickstart & Validation Guide: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

## 1. Pré-requisitos

- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Executa os testes unitários do provedor de tema e do componente Sidebar
pnpm --filter admin test run src/contexts/ThemeContext.spec.tsx src/hooks/useTheme.spec.tsx src/components/layout/Sidebar.spec.tsx
```

## 3. Roteiro de Validação Manual

1. **Alternância de Tema no Admin**:
   - Acesse o painel administrativo (`packages/admin`).
   - Abra a barra lateral e localize o botão com ícone de lua/sol no canto superior direito do card do usuário.
   - Clique no botão: a interface deve alternar instantaneamente para o tema escuro.
   - Recarregue a página com `F5`: o tema escuro deve permanecer ativo.
   - Clique novamente para retornar ao tema claro.
2. **Link Textual Sair**:
   - Na barra lateral de `admin` e de `web`, confirme que há um link textual sublinhado com a palavra "Sair" logo abaixo do cargo ou do hotel.
   - Clique no link "Sair" e confirme o redirecionamento imediato para a tela de login.
3. **Ausência do Rodapé Antigo**:
   - Inspecione a base da barra lateral e confirme que o antigo rodapé com os botões de logout e tema foi completamente removido.
