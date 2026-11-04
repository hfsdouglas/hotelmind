# Contratos de Interface e HTTP: Parceiros Comerciais

**Feature**: `024-commercial-partners`  
**Date**: 2026-11-04  
**Context**: Contratos TypeScript compartilhados e especificação de rotas HTTP para o módulo Comercial no HotelMind.

---

## 1. Contratos Compartilhados (`packages/.contracts/src/parceiros_comerciais.ts`)

```typescript
import type { PaginacaoMeta } from './grupos.js'

export type TipoParceiro =
  | 'agente_autonomo'
  | 'agencia_viagens'
  | 'operadora_turismo'
  | 'clube_turismo'
  | 'empresa_corporativa'

export type TipoPessoa = 'PF' | 'PJ'

export type ModeloTarifario = 'net' | 'comissionada' | 'acordo'

export type PoliticaFaturamento = 'voucher' | 'faturado' | 'prepago'

export type StatusParceiro = 'ativo' | 'inativo' | 'bloqueado'

export type TipoContatoParceiro = 'comercial' | 'financeiro' | 'operacional'

export interface ParceiroContatoItem {
  id?: string
  tipo_contato: TipoContatoParceiro
  nome: string
  email: string
  telefone: string
  cargo?: string | null
}

export interface ParceiroComercial {
  id: string
  hotel_id: string
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia: string | null
  documento: string | null
  inscricao_estadual: string | null
  estrangeiro: boolean
  cadastur: string | null
  codigo_iata: string | null
  registro_embratur: string | null

  // Endereço
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao: string // Decimal formatado (ex: "10.00")
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias: number
  limite_credito: string // Decimal formatado (ex: "50000.00")
  allotment_quartos: number

  // Ciclo de Vida
  status: StatusParceiro
  motivo_bloqueio: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string

  // Relacionamentos
  contatos?: ParceiroContatoItem[]
}

export interface CreateParceiroComercialPayload {
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia?: string | null
  documento?: string | null
  inscricao_estadual?: string | null
  estrangeiro?: boolean
  cadastur?: string | null
  codigo_iata?: string | null
  registro_embratur?: string | null

  // Endereço
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao?: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias?: number
  limite_credito?: number
  allotment_quartos?: number

  observacoes?: string | null
  contatos?: Omit<ParceiroContatoItem, 'id'>[]
}

export interface UpdateParceiroComercialPayload {
  tipo_parceiro?: TipoParceiro
  tipo_pessoa?: TipoPessoa
  razao_social?: string
  nome_fantasia?: string | null
  documento?: string | null
  inscricao_estadual?: string | null
  estrangeiro?: boolean
  cadastur?: string | null
  codigo_iata?: string | null
  registro_embratur?: string | null

  // Endereço
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  // Regras Comerciais
  modelo_tarifario?: ModeloTarifario
  comissao_padrao?: number
  politica_faturamento?: PoliticaFaturamento
  prazo_pagamento_dias?: number
  limite_credito?: number
  allotment_quartos?: number

  observacoes?: string | null
  contatos?: ParceiroContatoItem[]
}

export interface UpdateStatusParceiroPayload {
  status: StatusParceiro
  motivo_bloqueio?: string | null
}

export interface ParceiroComercialListParams {
  pagina?: number
  limite?: number
  busca?: string
  tipo_parceiro?: TipoParceiro
  status?: StatusParceiro
  cidade?: string
  estado?: string
}

export interface ParceiroComercialListResponse {
  data: ParceiroComercial[]
  meta: PaginacaoMeta
}
```

---

## 2. Especificação de Rotas HTTP (Fastify)

Base de rota: `/comercial/parceiros`  
Todas as rotas exigem autenticação do usuário hoteleiro (`onRequest: [app.authenticate]`).

### 2.1 `POST /comercial/parceiros`
Cadastra um novo parceiro comercial com endereço, regras e contatos vinculados.

- **Request Body**: `CreateParceiroComercialPayload`
- **Response 201 Created**: Objeto `ParceiroComercial` completo com contatos gerados.
- **Response 400 Bad Request**: Validação Zod (CPF/CNPJ inválido, campos obrigatórios ausentes).
- **Response 409 Conflict**: Documento já cadastrado para o hotel.

### 2.2 `GET /comercial/parceiros`
Lista os parceiros comerciais com paginação, filtros e busca textual.

- **Query Parameters**:
  - `pagina`: Número da página (padrão `1`).
  - `limite`: Quantidade de itens por página (padrão `10`, máx `100`).
  - `busca`: Termo de busca textual (Nome, Razão Social, Nome Fantasia, Documento, CADASTUR).
  - `tipo_parceiro`: Filtro por enum de parceiro.
  - `status`: Filtro por status (`ativo`, `inativo`, `bloqueado`).
  - `cidade`: Filtro textual de município.
  - `estado`: Filtro por UF (ex: `SP`).
- **Response 200 OK**: Objeto `ParceiroComercialListResponse`.

### 2.3 `GET /comercial/parceiros/:id`
Recupera os detalhes completos de um parceiro e sua lista de contatos.

- **Path Parameters**: `id` (UUID).
- **Response 200 OK**: Objeto `ParceiroComercial`.
- **Response 404 Not Found**: Parceiro não localizado ou não pertencente ao hotel.

### 2.4 `PUT /comercial/parceiros/:id`
Atualiza dados cadastrais, de endereço, regras comerciais e substitui/atualiza contatos.

- **Path Parameters**: `id` (UUID).
- **Request Body**: `UpdateParceiroComercialPayload`.
- **Response 200 OK**: Objeto `ParceiroComercial` atualizado.
- **Response 400 Bad Request**: Erro de validação dos campos.
- **Response 404 Not Found**: Parceiro não localizado.
- **Response 409 Conflict**: Documento alterado coincide com outro parceiro existente.

### 2.5 `PATCH /comercial/parceiros/:id/status`
Atualiza especificamente o status do ciclo de vida do parceiro (`ativo`, `inativo`, `bloqueado`).

- **Path Parameters**: `id` (UUID).
- **Request Body**: `UpdateStatusParceiroPayload`.
- **Response 200 OK**: Objeto `ParceiroComercial` com novo status e motivo registrado.
- **Response 400 Bad Request**: Status inválido ou motivo de bloqueio não informado ao bloquear.
- **Response 404 Not Found**: Parceiro não localizado.

### 2.6 `DELETE /comercial/parceiros/:id`
Inativa ou remove o parceiro comercial.

- **Path Parameters**: `id` (UUID).
- **Response 204 No Content**: Exclusão ou inativação concluída com sucesso.
- **Response 404 Not Found**: Parceiro não localizado.
