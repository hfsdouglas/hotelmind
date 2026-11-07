# Phase 0: Research & Architectural Decisions

**Feature**: Configurações > Hotel (Aplicação Web)
**Branch**: `028-hotel-settings`
**Date**: 2026-11-06

## 1. Persistência de Dados e Modelagem de Configurações do Hotel

- **Decision**: Criar um modelo dedicado `HotelConfiguracao` mapeado para a tabela `hoteis_configuracoes`, estabelecendo relacionamento 1:1 estrito com `Hotel` (`hotel_id String @unique`). Os campos institucionais centrais (`razao_social`, `nome_fantasia`, `cnpj`) são sincronizados na entidade `Hotel` enquanto os parâmetros operacionais, regras e ativos de branding residem em `hoteis_configuracoes`.
- **Rationale**: A tabela `hoteis` é consultada com frequência crítica no fluxo de autenticação e validação multi-tenant (`request.user.hotelId`). Segregar as configurações estendidas (mais de 30 parâmetros divididos em 5 módulos) previne inchaço (*table bloat*) no modelo principal e mantém alta coesão e responsabilidade única.
- **Alternatives considered**:
  - *Adicionar todas as colunas diretamente na tabela `hoteis`*: Rejeitado porque inflaria o carregamento da entidade de autenticação do hotel em todas as rotas e violaria o princípio de responsabilidade única.
  - *Armazenar tudo em um único campo JSON*: Rejeitado porque elimina validações estruturadas no banco, impede consultas tipadas pelo Prisma e dificulta migrações graduais de schema.

---

## 2. Armazenamento e Upload de Ativos Visuais (Logotipos e Favicon)

- **Decision**: Armazenar os ativos visuais (`logo_primary`, `logo_dark`, `favicon`) como Data URLs (Base64) ou URLs públicas seguras em colunas de texto no banco de dados. No frontend, o componente de upload utilizará a API nativa `FileReader.readAsDataURL` com validação de tipo MIME (`image/png`, `image/svg+xml`, `image/x-icon`, `image/vnd.microsoft.icon`) e tamanho máximo (até 2MB).
- **Rationale**: O monorepo HotelMind atualmente opera sem dependência externa obrigatória de storage em nuvem (S3/GCS/MinIO) e sem bibliotecas de upload multipart complexas na API. Logotipos e favicons vetoriais ou otimizados possuem footprints pequenos (< 200KB), tornando Data URLs leves, autônomas, instantaneamente pré-visualizáveis e fáceis de versionar e testar via mocks/MSW.
- **Alternatives considered**:
  - *Armazenamento em disco local da API com Fastify Multipart*: Rejeitado por criar acoplamento ao filesystem local e inviabilizar ambientes distribuídos/conteinerizados.
  - *Integração obrigatória com AWS S3 / Cloudflare R2*: Rejeitado por introduzir complexidade desnecessária e dependências externas de infraestrutura para simples ícones e logotipos.

---

## 3. Gestão de Estado do Formulário Multi-Abas e Ações Globais

- **Decision**: Utilizar uma única instância de `useForm` do React Hook Form com esquema de validação Zod unificado abrangendo todos os 5 módulos. O layout das abas (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) preservará o estado em memória dos inputs de todas as abas, e a barra inferior fixa conterá as ações globais de "Salvar alterações" e "Descartar alterações" (`form.reset()`).
- **Rationale**: Satisfaz com perfeição os requisitos FR-018, FR-020, SC-003 e SC-004. O usuário pode alternar entre abas temáticas, preencher parâmetros em momentos distintos e acionar o salvamento ou descarte atômico consolidado com validação unificada.
- **Alternatives considered**:
  - *Formulário individual por aba com botão de salvar próprio*: Rejeitado porque contradiz explicitamente as diretrizes da especificação (barra de ação fixa unificada no rodapé) e gera atrito no fluxo de trabalho do gestor.
  - *Manter estado solto em `useState`*: Rejeitado expressamente pelas regras de arquitetura frontend do projeto (não espelhar dados de servidor em estados locais e utilizar React Hook Form + Zod).

---

## 4. Pré-visualização do Tema em Tempo Real (Live Preview)

- **Decision**: Monitorar os campos de cores (`color_primary`, `color_secondary`, `color_background`, `color_surface`, `color_text_primary`, `color_text_secondary`, `color_accent`) através do hook `useWatch` do React Hook Form e alimentar um componente de preview dedicado (`PreviewTemaCard`). As cores são passadas via variáveis CSS inline (`style={{ '--preview-primary': colorPrimary }}`), garantindo atualização sub-100ms sem re-renders pesados.
- **Rationale**: Cumpre o critério de sucesso SC-002 sem degradar performance de digitação.
- **Alternatives considered**:
  - *Injetar estilos globais na página inteira no momento da edição*: Rejeitado porque poderia quebrar a legibilidade e contraste dos formulários de edição antes de salvar.
  - *Renderizar um iframe separado*: Rejeitado por introduzir sobrecarga computacional excessiva para um preview de card.

---

## 5. Integração com Rotas e Menu da Aplicação Web

- **Decision**: Adicionar o módulo `'Configurações'` com o recurso `'Hotel'` e rota `'/configuracoes/hotel'` ao arquivo `packages/api/src/db/seeds/routes_seed.ts` (ordem 50, ícone `'Settings'`). Mapear o ícone `Settings` da biblioteca `lucide-react` no `Sidebar.tsx` e registrar a rota `/configuracoes/hotel` em `packages/web/src/routes.tsx`.
- **Rationale**: Alinha a nova página diretamente ao mecanismo de controle de acesso (RBAC) e menu dinâmico nativo do HotelMind.
- **Alternatives considered**:
  - *Hardcodar a rota no Sidebar*: Rejeitado pois violaria o sistema de permissões dinâmicas existente no HotelMind.
