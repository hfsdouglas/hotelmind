# Research: Refatoração das Telas de Reservas (Consulta e Nova Reserva)

**Feature**: Refatoração das Telas de Reservas
**Directory**: `specs/026-reservation-screens-refactor`
**Date**: 2026-11-05

## Contexto & Objetivos

A investigação técnica comparou detalhadamente as telas de orçamentos (`/reservas/orcamentos` e `/reservas/orcamentos/novo`) com as telas de reservas (`/reservas` e `/reservas/nova`) para catalogar as inconsistências visuais, bugs de alinhamento e violações de padrões de interface.

---

## 1. Discrepâncias Identificadas na Comparação

| Aspecto | Orçamentos (`orcamentos/` - Padrão Esperado) | Reservas (`reservas/` - Estado Atual) |
|---|---|---|
| **Cores e Temas** | Tokens semânticos do Design System (`primary`, `primary/5`, `border`, `card`, `muted-foreground`, `foreground`). Funciona perfeitamente em modo claro e escuro. | Cores hardcoded arbitrárias (`indigo-600`, `indigo-700`, `bg-indigo-50/50`, `border-indigo-600`, `zinc-900`, `zinc-500`), quebrando harmonia em dark mode. |
| **Cabeçalhos de Seções/Passos** | `Passo N: [Título]` com `h2 className="text-lg font-semibold text-foreground"`, ícone temático `text-primary` e linha inferior `border-b pb-2`. | Títulos heterogêneos (`1. Período de Hospedagem...`) com `h2 className="text-base font-semibold"` e ícone hardcoded `text-indigo-600`. |
| **Inputs com Ícones Auxiliares** | Inputs enriquecidos com ícone decorativo contextual (`User`, `Phone`, `Mail`, `Users`, `PawPrint`) com `pl-9` e altura uniforme (`h-9`). | Inputs simples sem ícones decorativos, desalinhados com o restante do fluxo e sem padronização de altura. |
| **Feedback de Diárias / Noites** | Banner imediato em destaque (`CheckCircle2`, período formatado `dd/mm/aaaa até dd/mm/aaaa`, contagem de diárias). | Inexistente. O usuário não tem confirmação imediata da contagem de noites após escolher check-in e check-out. |
| **Cards de Seleção (Regimes / Quartos)** | Grid responsivo, bordas suaves (`border-border`), estado selecionado com anel semântico (`ring-2 ring-primary/20 bg-primary/5`), badge com contorno e pulseira protegida (`border border-black/10`). | Botões simples com bordas rígidas `border-zinc-200`, seleção com `border-indigo-600 bg-indigo-50/50 ring-indigo-600/20`, sem borda na pulseira. |
| **Card de Valor Total** | Card estruturado com resumo de ocupantes, valor formatado e contraste equilibrado. | Bloco com classes fixas de verde (`bg-emerald-50`, `text-emerald-700`, `border-emerald-200`) sem adaptação refinada ao tema. |
| **Filtros na Listagem (`index.tsx`)** | `ListPageLayout` limpo, filtros ou selects integrados e estilizados. | Elementos `<select>` nativos sem estilização compatível com o `SearchBar`, desnível de altura e espaçamentos manuais desiguais. |
| **Botões de Ação na Tabela** | `variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"`. | `<Button variant="ghost" size="sm" className="h-8 w-8 p-0">` com cor fixa `text-zinc-600 hover:text-zinc-900`. |

---

## 2. Decisões Técnicas de Design e Arquitetura

### Decisão 1: Unificação de Tokens Semânticos do Tailwind/shadcn
- **Decisão**: Eliminar totalmente classes de paleta hardcoded (`indigo-*`, `zinc-*`) nos componentes de formulário e tabela de reservas, substituindo-as exclusivamente por classes de tokens semânticos (`primary`, `primary/5`, `border`, `card`, `card-foreground`, `foreground`, `muted-foreground`, `ring-primary/20`, `destructive`).
- **Rationale**: Garante suporte pleno e automático a temas (claro e escuro) e unifica a experiência estética com a tela de orçamentos e demais módulos da aplicação.
- **Alternativas consideradas**: Manter a paleta indigo para diferenciar visualmente "reserva confirmada" de "orçamento", mas rejeitado porque a identidade visual da plataforma é definida pelo tema principal (`primary`) e as cores de status já cumprem a função de diferenciação.

### Decisão 2: Padronização do Formulário em Passos (`nova.tsx`)
- **Decisão**: 
  - Estruturar os passos com a convenção:
    - `Passo 1: Período e Ocupantes`
    - `Passo 2: Regime de Alimentação`
    - `Passo 3: Seleção da Suíte (Disponibilidade e Tarifas)`
    - `Passo 4: Dados do Titular e Parceiro Comercial`
  - Incluir banner de período selecionado (`CheckCircle2`) idêntico ao de orçamentos.
  - Aplicar ícones decorativos em inputs (`User`, `Phone`, `Mail`, `Users`) com `relative`, `absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground` e `pl-9 h-9`.
  - Reorganizar o grid do Passo 4 para manter alinhamento estético entre o seletor de Parceiro Comercial e o campo de Observações Internas.
- **Rationale**: Cria ergonomia idêntica entre o processo de orçar e o processo de reservar, facilitando o treinamento da equipe de atendimento.

### Decisão 3: Harmonização dos Controles de Filtro na Listagem (`index.tsx`)
- **Decisão**:
  - Estilizar os selects de filtro com classes consistentes de altura (`h-9`), borda (`border-input`), plano de fundo (`bg-background`), cantos arredondados (`rounded-md`) e texto (`text-sm text-foreground`), mantendo perfeita paridade de altura e alinhamento vertical com o `SearchBar`.
  - Padronizar o botão de ação rápida por linha com `variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"`.
- **Rationale**: Remove o aspecto desalinhado e cru dos selects nativos no cabeçalho da tabela.

### Decisão 4: Cumprimento Estrito da Component Location Rule
- **Decisão**: Não criar nenhuma pasta `components/` sob `packages/web/src/pages/app/reservas/`. Todas as refatorações serão feitas diretamente nos arquivos de página existentes (`index.tsx`, `nova.tsx`), reaproveitando componentes globais existentes (`CrudFormLayout`, `ListPageLayout`, `PagedDataTable`, `SearchBar`, `Input`, `Label`, `Badge`, `DatePicker`, `Textarea`, `ModalConflitoReserva`).
- **Rationale**: Em total conformidade com a Constituição do projeto e regras de arquitetura frontend.
