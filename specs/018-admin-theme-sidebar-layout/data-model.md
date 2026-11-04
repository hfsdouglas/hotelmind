# Data Model: Suporte a Tema Claro e Escuro no Painel Admin e Reorganização de Ações na Barra Lateral

## 1. Tipos de Tema

### 1.1. `Theme`

Representa o modo de cores ativo na interface.

```typescript
type Theme = 'light' | 'dark'
```

### 1.2. `ThemeContextType`

Interface do contexto consumida pelos componentes da aplicação através do hook `useTheme()`.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `theme` | `Theme` | O tema ativo atualmente (`'light'` ou `'dark'`) |
| `toggleTheme` | `() => void` | Função para alternar entre `'light'` e `'dark'` |

## 2. Persistência em Armazenamento Local

- **Chave de armazenamento**: `theme`
- **Valores válidos**: `"light"` ou `"dark"`
- **Efeito colateral no DOM**:
  - Se `theme === 'dark'`: `document.documentElement.classList.add('dark')`
  - Se `theme === 'light'`: `document.documentElement.classList.remove('dark')`

## 3. Estrutura do Cabeçalho da Barra Lateral (`Sidebar`)

O componente `Sidebar` renderiza o bloco do perfil contendo:

```typescript
interface SidebarHeaderData {
  usuario: {
    nome_completo: string
    cargo?: string
    hotel?: string
  }
  acoes: {
    toggleTheme: () => void
    logout: () => void
  }
}
```
