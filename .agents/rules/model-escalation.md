# Antigravity Model Escalation & Token Economy Rules

Diretrizes oficiais para seleção e escalação dos modelos nativos do **Antigravity** (`agy`), associando a complexidade da tarefa ao modelo ideal para máxima eficiência de tokens e preservação das cotas do plano.

---

## 1. Princípio de Governança

1. **Eficiência de Tokens**: Evitar modelos e níveis de esforço superdimensionados para operações mecânicas ou simples.
2. **Compatibilidade com o Plano**: Priorizar os modelos inclusos na assinatura base da conta, **sem consumir créditos extras tarifados** (*pay-as-you-go*) ou esgotar limites diários/mensais desnecessariamente.

---

## 2. Catálogo de Modelos do Antigravity

Os modelos suportados pelo ecossistema do Antigravity dividem-se em perfis de custo e performance:

| Modelo (`agy`) | Nome de Exibição | Nível de Esforço | Perfil de Consumo |
|---|---|---|---|
| `gemini-3.8-flash-low` | Gemini 3.8 Flash (Low) | Baixo | Ultra econômico / instantâneo |
| `gemini-3.8-flash-medium` | Gemini 3.8 Flash (Medium) | **Médio** | **Econômico / ideal para tarefas simples** |
| `gemini-3.8-flash-high` | Gemini 3.8 Flash (High) | Alto | Econômico com raciocínio estendido |
| `gemini-4-argon-low` | Gemini 4 Argon (Low) | Baixo | Avançado rápido |
| `gemini-4-argon-medium` | Gemini 4 Argon (Medium) | Médio | Avançado balanceado |
| `gemini-4-argon-high` | Gemini 4 Argon (High) | Alto | **Alta capacidade / arquitetura** |
| `claude-sonnet-5-5-medium` | Claude Sonnet 5.5 (Medium) | Médio | Avançado em código |
| `claude-sonnet-5-5-high` | Claude Sonnet 5.5 (High) | Alto | **Alta capacidade em refatoração** |
| `claude-opus-5-5-high` | Claude Opus 5.5 (High) | Alto | Máximo raciocínio (verificar cota) |
| `gpt-oss-120b-medium` | GPT-OSS 120B (Medium) | Médio | Alternativa open-weight |

---

## 3. Matriz de Escalação por Complexidade

### Nível 1: Tarefas Simples & Determinísticas (Modelo Simples + Esforço Médio)
- **Casos de uso**:
  - Formatação e lint com Biome (`biome check --write`).
  - Ajustes de sintaxe, imports e renomeações pontuais.
  - Correção de mensagens de erro, textos de labels ou traduções.
  - Inspeção ou leitura rápida de arquivos específicos.
  - Testes unitários mecânicos ou atualização de fakes in-memory existentes.
- **Modelo Antigravity Oficial**:
  - CLI / Sessão: `gemini-3.8-flash-medium` (ou `gemini-3.8-flash-low` para leituras puras).
  - Subagentes (`invoke_subagent`): `Model: flash_lite` ou `Model: flash`.
- **Racional**: Resposta rápida, mínimo consumo de tokens e zero risco de esgotamento de cotas.

---

### Nível 2: Tarefas Intermediárias de Desenvolvimento
- **Casos de uso**:
  - Implementação de CRUDs padrão seguindo contratos estabelecidos.
  - Construção de páginas e formulários com `CrudFormLayout` e `SearchResultsSuspense`.
  - Escrita de schemas Zod e testes de rotas com `app.inject()`.
  - Criação de novas migrations e modelos no Prisma.
- **Modelo Antigravity Oficial**:
  - CLI / Sessão: `gemini-3.8-flash-high` ou `gemini-4-argon-medium` / `claude-sonnet-5-5-medium` (conforme cota inclusa no plano).
  - Subagentes (`invoke_subagent`): `Model: flash` ou `Model: inherit`.
- **Racional**: Excelente precisão em TypeScript e aderência às regras do monorepo com custo moderado.

---

### Nível 3: Tarefas Complexas, Arquiteturais & Críticas (Modelo Mais Performático)
- **Casos de uso**:
  - Planejamento arquitetural e desenho de especificações de novos domínios.
  - Refatorações que afetam múltiplos pacotes simultaneamente (`.contracts`, `api`, `web`, `admin`).
  - Resolução de bugs críticos de concorrência, integridade de transações ou isolamento de tenant (`hotel_id`).
  - Auditoria de segurança, code review abrangente e validação do fluxo SpecKit.
- **Modelo Antigravity Oficial**:
  - CLI / Sessão: **O modelo mais performático disponível no plano do usuário** (ex.: `gemini-4-argon-high`, `claude-sonnet-5-5-high` ou `claude-opus-5-5-high`).
  - Subagentes (`invoke_subagent`): `Model: pro` ou `Model: inherit`.
- **Racional**: Máxima capacidade de raciocínio lógico e visão holística do monorepo para evitar regressões arquiteturais.

---

## 4. Salvaguardas de Cota e Créditos

1. **Sem Cobrança Adicional**: Nunca sugerir a mudança para modelos fora da franquia inclusa na assinatura do usuário ou que demandem recarga de créditos pré-pagos sem solicitação expressa.
2. **Subagentes Econômicos**: Subagentes de pesquisa (como `research`) devem sempre ser invocados com `Model: flash_lite` ou `Model: flash` para evitar consumo duplicado de modelos pesados em paralelo.
3. **Desescalada Imediata**: Assim que uma tarefa complexa de arquitetura for concluída, retornar para `gemini-3.8-flash-medium` para as etapas de execução mecânica, testes locais e linting.
