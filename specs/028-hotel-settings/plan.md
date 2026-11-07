# Implementation Plan: Configurações > Hotel (Aplicação Web)

**Branch**: `028-hotel-settings` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/028-hotel-settings/spec.md`

## Summary

Implementação ponta a ponta da página de configurações do hotel na aplicação web, localizada na rota `Configurações > Hotel` (`/configuracoes/hotel`). A solução engloba a persistência multi-tenant isolada no PostgreSQL via Prisma (`HotelConfiguracao`), camada de domínio com Clean Architecture (entidades, repositórios com in-memory fakes e casos de uso desacoplados), rotas Fastify tipadas com Zod, contratos TypeScript compartilhados em `packages/.contracts`, e no frontend web um layout de navegação por 5 abas (Identidade Visual & Tema com live preview, Gratuidade de Crianças, Horários de Check-in/out e Recepção, Regras de Convivência Pets/Fumo e Estacionamento/Wi-Fi), com barra fixa inferior de ações com salvar e descartar, gerenciados via React Hook Form e TanStack Query.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 22 LTS  
**Primary Dependencies**: Fastify 5.x, Prisma 6.x, Zod, React 19, React Hook Form, @tanstack/react-query 5.x, Tailwind CSS, Lucide React, Sonner  
**Storage**: PostgreSQL com Prisma ORM (tabela `hoteis_configuracoes` isolada por `hotel_id` único com relação 1:1 com `Hotel`)  
**Testing**: Vitest (testes unitários com In-Memory Repositories, testes de rotas com Fastify `inject`, e testes frontend com Vitest + React Testing Library + MSW)  
**Target Platform**: Aplicação Web SPA (Desktop e Mobile responsivo) e API RESTful  
**Project Type**: Monorepo Full-Stack (Contracts, API Fastify, Web React)  
**Performance Goals**: Latência do live preview do tema < 100ms; carregamento da página de configurações < 300ms  
**Constraints**: Multi-tenancy estrito (`hotel_id` sempre derivado da sessão autenticada `request.user.hotelId`, nunca de parâmetros do cliente); proibição de diretórios `components/` dentro de `src/pages/**`  
**Scale/Scope**: 5 abas de configuração, escopo simplificado e focado nas necessidades essenciais do hotel, 1 formulário unificado com submissão atômica

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Conformidade | Justificativa / Verificação |
|---|---|---|
| **I. Contract-First** | ✅ Conforme | Tipos DTO e inputs definidos primeiramente em `packages/.contracts/src/hotel_configuracao.ts` sem Zod ou runtime code. |
| **II. Clean Architecture** | ✅ Conforme | Separação rigorosa: Entidade `HotelConfiguracao` -> Repositório `HotelConfiguracaoRepository` -> Casos de uso (`GetHotelConfiguracaoUseCase`, `UpdateHotelConfiguracaoUseCase`) -> Rota Fastify. |
| **III. SOLID** | ✅ Conforme | Injeção de dependências via construtor nos use cases; repositórios substituíveis por fakes em memória nos testes. |
| **IV. Explicit over Implicit** | ✅ Conforme | Erros de domínio explícitos (`HotelConfiguracaoNotFoundError`), sem defaults mágicos nem leitura de `process.env` no domínio. |
| **V. Low Coupling, High Cohesion** | ✅ Conforme | Módulo de configurações isolado no domínio `hotels`; sem importações circulares; contratos sem acoplamento de runtime. |
| **VI. Clean Code** | ✅ Conforme | Nomenclatura em `snake_case` nos arquivos, banco e rotas (`hoteis_configuracoes`, `/hoteis/configuracao`), código autoexplicativo em português/inglês padronizado. |
| **VII. Testability by Design** | ✅ Conforme | Suíte de testes automatizados com in-memory fakes para use cases, `app.inject()` para rotas Fastify e MSW para frontend web. |
| **Frontend Location Rule** | ✅ Conforme | Rota em `src/pages/app/configuracoes/hotel/index.tsx`; TODOS os componentes em `src/components/hotel-configuracao/`. ZERO componentes em `pages/`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/028-hotel-settings/
├── spec.md                     # Feature specification
├── plan.md                     # This implementation plan
├── research.md                 # Phase 0: Architectural decisions
├── data-model.md               # Phase 1: Data model and validation rules
├── quickstart.md               # Phase 1: Quickstart validation scenarios
├── contracts/
│   └── hotel_configuracao_contract.ts # Phase 1: Contract definitions
└── checklists/
    └── requirements.md         # Quality checklist
```

### Source Code

```text
packages/.contracts/
└── src/
    ├── hotel_configuracao.ts                    # Contratos de DTOs e inputs
    └── index.ts                                # Re-export dos contratos

packages/api/
├── src/
│   ├── prisma/
│   │   └── schema.prisma                       # Modelo HotelConfiguracao e relação 1:1
│   ├── core/
│   │   ├── entities/
│   │   │   ├── hotel_configuracao.ts           # Entidade pura de domínio
│   │   │   └── hotel_configuracao.spec.ts      # Testes da entidade
│   │   ├── repositories/
│   │   │   └── hotels/
│   │   │       ├── hotel_configuracao_repository.ts # Interface do repositório
│   │   │       ├── in-memory/
│   │   │       │   └── in_memory_hotel_configuracao_repository.ts # Test fake
│   │   │       └── implementation/
│   │   │           └── postgres_hotel_configuracao_repository.ts # Prisma repo
│   │   └── usecases/
│   │       └── hotels/
│   │           ├── get_hotel_configuracao_use_case.ts
│   │           ├── get_hotel_configuracao_use_case.spec.ts
│   │           ├── update_hotel_configuracao_use_case.ts
│   │           └── update_hotel_configuracao_use_case.spec.ts
│   ├── schemas/
│   │   └── hotels/
│   │       └── hotel_configuracao_schemas.ts   # Schemas Zod de validação
│   ├── routes/
│   │   └── hotels/
│   │       └── web/
│   │           ├── hotel_configuracao_routes.ts # GET /hoteis/configuracao e PUT
│   │           └── hotel_configuracao_routes.spec.ts
│   ├── plugins/
│   │   └── fastify_routes.ts                   # Registro do plugin de rotas web
│   └── db/
│       └── seeds/
│           └── routes_seed.ts                  # Adição da rota Configurações > Hotel

packages/web/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx                     # Suporte ao ícone Settings
│   │   └── hotel-configuracao/
│   │       ├── aba_identidade_visual.tsx       # Aba 1: Branding, cores e dados
│   │       ├── aba_criancas_hospedes.tsx       # Aba 2: Políticas de gratuidade de crianças
│   │       ├── aba_horarios_operacao.tsx       # Aba 3: Check-in/out e recepção
│   │       ├── aba_regras_casa.tsx             # Aba 4: Pets e fumo
│   │       ├── aba_estacionamento_wifi.tsx     # Aba 5: Estacionamento e Wi-Fi
│   │       ├── preview_tema_card.tsx           # Card de demonstração ao vivo
│   │       ├── barra_acoes_fixa.tsx            # Barra inferior fixa (salvar/descartar)
│   │       └── hotel_configuracao_form.tsx     # Orquestrador com Tabs e useForm
│   ├── hooks/
│   │   └── useHotelConfiguracao.ts             # TanStack Query useQuery + useMutation
│   ├── pages/
│   │   └── app/
│   │       └── configuracoes/
│   │           └── hotel/
│   │               ├── index.tsx               # Rota entry point (estritamente sem subcomponentes)
│   │               └── index.spec.tsx          # Teste de integração da página
│   └── routes.tsx                              # Registro da rota /configuracoes/hotel
```

**Structure Decision**: Monorepo em camadas completas: contratos compartilhados em `packages/.contracts`, backend em `packages/api` respeitando rigorosamente Clean Architecture e isolamento multi-tenant, e frontend em `packages/web` seguindo a regra de ouro de localização de componentes (todos os componentes sob `src/components/hotel-configuracao/`, página em `src/pages/app/configuracoes/hotel/index.tsx`).

---

## Complexity Tracking

> *Nenhuma violação aos princípios constitucionais. Todos os módulos e padrões adotam convenções estabelecidas do projeto.*

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Nenhuma | N/A | N/A |
