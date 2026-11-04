# Implementation Plan: Gestão de Parceiros Comerciais no Módulo Comercial

**Branch**: `024-commercial-partners` | **Date**: 2026-11-04 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/024-commercial-partners/spec.md)

**Input**: Feature specification from `/specs/024-commercial-partners/spec.md`

## Summary

Implementar no HotelMind o módulo **Comercial** com recurso completo para cadastro unificado e gestão de **Parceiros Comerciais** (Agentes Autônomos, Agências de Viagens, Operadoras de Turismo, Clubes de Turismo/Férias e Empresas Corporativas):
1. **Contratos Compartilhados (`packages/.contracts`)**:
   - Criação de `packages/.contracts/src/parceiros_comerciais.ts` contendo interfaces universais, enums de classificação (`TipoParceiro`, `TipoPessoa`, `ModeloTarifario`, `PoliticaFaturamento`, `StatusParceiro`, `TipoContatoParceiro`), payloads de criação/edição e respostas paginadas.
   - Exportação no `index.ts` de `.contracts`.
2. **Backend API (`packages/api`)**:
   - Modelagem Prisma com criação das tabelas `parceiros_comerciais` e `parceiros_contatos` vinculadas a `Hotel` (multi-tenancy) com índices em `[hotel_id, documento]`, `[hotel_id, tipo_parceiro]` e `[hotel_id, status]`.
   - Entidade de domínio `ParceiroComercial` em `core/entities/parceiro_comercial.ts` com validações de negócio (regras de CPF/CNPJ, alíquotas de comissão e consistência de políticas de crédito).
   - Repositório `IParceiroComercialRepository` com implementações PostgreSQL via Prisma e InMemory para testes unitários.
   - Casos de uso de CRUD: criação (`CriarParceiroComercialUseCase`), listagem com busca/filtros (`ListarParceirosComerciaisUseCase`), busca por ID (`BuscarParceiroComercialUseCase`), edição (`EditarParceiroComercialUseCase`), alteração de status (`AtualizarStatusParceiroUseCase`) e exclusão/inativação (`ExcluirParceiroComercialUseCase`).
   - Schemas Zod em `schemas/comercial/parceiros_schema.ts` e rotas Fastify autenticadas em `routes/comercial/parceiros_routes.ts` sob `/comercial/parceiros`.
   - Sincronização do seed de navegação (`routes_seed.ts`) com o novo módulo `Comercial` e recursos `Parceiros` e `Novo Parceiro`.
3. **Frontend Web (`packages/web`)**:
   - Integração com a API via `parceiros_comerciais.service.ts`.
   - Tela de listagem (`/comercial/parceiros`) com barra de busca, filtros por tipo e status, badges indicativos e paginação.
   - Formulário de cadastro e edição (`/comercial/parceiros/novo` e `/comercial/parceiros/:id/editar`) estruturado em seções visuais:
     - *Identificação e Tipo*: Tipo de parceiro com seleção dinâmica entre PF (CPF) e PJ (CNPJ/Razão Social/Nome Fantasia), opção de parceiro estrangeiro e registros regulatórios (CADASTUR, IATA, Embratur).
     - *Endereço*: Logradouro, número, complemento, bairro, cidade, estado, CEP e país.
     - *Regras Comerciais*: Modelo tarifário (Net, Comissionada, Acordo), percentual de comissão, política de faturamento (Voucher, Faturado a prazo, Pré-pago), limite de crédito e cota de allotment.
     - *Contatos*: Gerenciamento segregado de Contatos Comerciais e Financeiros.
   - Configuração de rotas no `routes.tsx` e mapeamento do ícone `Handshake` no `Sidebar.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.8 (Node.js 22 LTS / Fastify 5 no backend; React 19 / Vite 6 no frontend)

**Primary Dependencies**: Fastify 5, Prisma 6, Zod, React 19, React Router 7, Tailwind CSS 4, Lucide React, TanStack Query, Vitest

**Storage**: PostgreSQL com Prisma ORM (tabelas `parceiros_comerciais` e `parceiros_contatos` com restrição unique em `[hotel_id, documento]`, foreign key em `parceiros_contatos.parceiro_id` com `onDelete: Cascade` e `parceiros_comerciais.hotel_id` com `onDelete: Cascade`)

**Testing**: Vitest (`packages/api` e `packages/web`), repositórios InMemory para testes unitários isolados de casos de uso, injeção HTTP Fastify (`inject`) para testes de rotas e Testing Library para componentes e páginas

**Target Platform**: Servidor Linux / Docker (API) e navegadores web modernos (Web)

**Project Type**: Monorepo com microsserviços e Clean Architecture

**Performance Goals**: Tempo de resposta de criação, edição e consulta de parceiros < 60ms na API; busca e filtragem no frontend sem atraso perceptível (< 200ms)

**Constraints**: Clean Architecture estrita (Domain -> Repositories -> Use Cases -> Routes -> Schemas); `snake_case` compulsório em todos os arquivos e identificadores; validação estrita com Biome (2 espaços, 80 colunas, aspas simples); multitenancy obrigatório com isolamento por `hotel_id`

**Scale/Scope**: Contratos universais em `.contracts`, migração e repositórios Prisma, 6 casos de uso, rotas Fastify completas, páginas administrativas de listagem, cadastro e edição, seed de navegação e suíte de testes automatizados

## Constitution Check

*GATE: Pre-research evaluation passed. Post-design re-evaluation confirmed.*

- **I. Contract-First Development**: ✅ Pass — Contratos universais tipados definidos em `specs/024-commercial-partners/contracts/commercial_partners.md` e a serem materializados em `packages/.contracts/src/parceiros_comerciais.ts` antes de qualquer implementação.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Camadas estritamente isoladas: `entities/` -> `repositories/` -> `usecases/` -> `routes/` -> `schemas/`. Rotas não contêm lógica de negócio; casos de uso não dependem de Fastify nem Prisma diretamente.
- **III. SOLID Principles**: ✅ Pass — Cada caso de uso é focado em uma única intenção (`CriarParceiroComercialUseCase`, `EditarParceiroComercialUseCase`, etc.); injeção da interface `IParceiroComercialRepository`; esquemas Zod isolados.
- **IV. Explicit over Implicit**: ✅ Pass — `hotel_id` e dados são passados explicitamente como parâmetros; erros de domínio específicos (`ParceiroComercialNotFoundError`, `ParceiroComercialConflictError`, `ParceiroComercialValidationError`).
- **V. Low Coupling, High Cohesion**: ✅ Pass — Módulo Comercial é desacoplado de reservas físicas e opera como repositório mestre de entidades B2B; persistência atômica e coesa.
- **VI. Clean Code**: ✅ Pass — 100% dos arquivos, diretórios e rotas em `snake_case`; ausência de números mágicos; formatação via Biome.
- **VII. Testability by Design**: ✅ Pass — Repositório `InMemoryParceiroComercialRepository` para testes unitários puros sem banco de dados; testes de integração de rotas com Fastify `inject`.

## Project Structure

### Documentation (this feature)

```text
specs/024-commercial-partners/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Decisões arquiteturais e de negócio (Fase 0)
├── data-model.md        # Entidades, regras e modelo Prisma (Fase 1)
├── quickstart.md        # Roteiro de testes e validação (Fase 1)
├── checklists/
│   └── requirements.md  # Checklist de validação da especificação
└── contracts/
    └── commercial_partners.md # Contratos HTTP e tipos compartilhados (Fase 1)
```

### Source Code (repository root)

```text
packages/
├── .contracts/src/
│   ├── parceiros_comerciais.ts
│   └── index.ts
├── api/src/
│   ├── core/
│   │   ├── entities/
│   │   │   └── parceiro_comercial.ts
│   │   ├── errors/
│   │   │   └── parceiro_comercial_errors.ts
│   │   ├── repositories/
│   │   │   └── parceiros_comerciais/
│   │   │       ├── parceiro_comercial_repository.ts
│   │   │       ├── implementation/postgres_parceiro_comercial_repository.ts
│   │   │       └── in-memory/in_memory_parceiro_comercial_repository.ts
│   │   └── usecases/
│   │       └── parceiros_comerciais/
│   │           ├── criar_parceiro_comercial_use_case.ts
│   │           ├── buscar_parceiro_comercial_use_case.ts
│   │           ├── listar_parceiros_comerciais_use_case.ts
│   │           ├── editar_parceiro_comercial_use_case.ts
│   │           ├── atualizar_status_parceiro_use_case.ts
│   │           └── excluir_parceiro_comercial_use_case.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/20261104200000_create_parceiros_comerciais/
│   ├── routes/
│   │   └── comercial/
│   │       └── parceiros_routes.ts
│   ├── schemas/
│   │   └── comercial/
│   │       └── parceiros_schema.ts
│   └── db/seeds/routes_seed.ts
└── web/src/
    ├── api/
    │   └── parceiros_comerciais.service.ts
    ├── components/layout/Sidebar.tsx
    ├── pages/
    │   └── app/
    │       └── comercial/
    │           └── parceiros/
    │               ├── index.tsx
    │               ├── novo.tsx
    │               ├── [id]/editar.tsx
    │               └── components/
    │                   ├── parceiro_form.tsx
    │                   └── contatos_form_section.tsx
    └── routes.tsx
```

**Structure Decision**: Monorepo orientado a Clean Architecture distribuído entre `packages/.contracts` (tipos de dados universais), `packages/api` (entidades de domínio, repositórios Postgres/InMemory, casos de uso, schemas Zod e rotas Fastify sob `/comercial/parceiros`) e `packages/web` (páginas administrativas do módulo Comercial integradas dinamicamente ao menu do sistema).

## Complexity Tracking

*Nenhuma violação aos princípios da constituição encontrada. Todas as diretrizes de Clean Architecture, SOLID, tipagem universal e Clean Code foram rigorosamente cumpridas.*
