import { type DB, db } from '@/lib/prisma'

export interface SeedParceirosResult {
  cvc: { id: string; razao_social: string }
  petrobras: { id: string; razao_social: string }
  decolar: { id: string; razao_social: string }
  vale: { id: string; razao_social: string }
  booking: { id: string; razao_social: string }
}

export async function seedParceiros(
  hotel_id: string,
  client: DB = db
): Promise<SeedParceirosResult> {
  console.log(
    '[DEV] Semeando 5 parceiros comerciais de teste com dados válidos...'
  )

  // 1. CVC Brasil Operadora e Agência de Viagens S.A.
  const cvc = await client.parceiro.create({
    data: {
      hotel_id,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'CVC Brasil Operadora e Agência de Viagens S.A.',
      nome_fantasia: 'CVC Viagens',
      documento: '11222333000181',
      inscricao_estadual: '111222333444',
      estrangeiro: false,
      cadastur: '19.012345.10.0001-2',
      modelo_tarifario: 'comissionada',
      comissao_padrao: 12.0,
      politica_faturamento: 'faturado',
      prazo_pagamento_dias: 30,
      limite_credito: 100000.0,
      allotment_quartos: 5,
      status: 'ativo',
      observacoes: 'Acordo comercial nacional com tarifa especial para lazer.',
      endereco: {
        create: {
          logradouro: 'Rua das Figueiras',
          numero: '501',
          complemento: '8º andar',
          bairro: 'Jardim',
          cidade: 'Santo André',
          estado: 'SP',
          cep: '09080300',
          pais: 'Brasil',
        },
      },
      contatos: {
        create: [
          {
            tipo_contato: 'comercial',
            nome: 'Renata Vasconcelos',
            email: 'renata.comercial@cvc.com.br',
            telefone: '11988881001',
            cargo: 'Gerente de Contas Hotelaria',
          },
          {
            tipo_contato: 'financeiro',
            nome: 'Financeiro CVC',
            email: 'faturamento@cvc.com.br',
            telefone: '11988881002',
            cargo: 'Analista Financeiro',
          },
        ],
      },
    },
  })

  // 2. Petróleo Brasileiro S.A. - Petrobras (Corporativo)
  const petrobras = await client.parceiro.create({
    data: {
      hotel_id,
      tipo_parceiro: 'empresa_corporativa',
      tipo_pessoa: 'PJ',
      razao_social: 'Petróleo Brasileiro S.A. Petrobras',
      nome_fantasia: 'Petrobras',
      documento: '33000167000101',
      inscricao_estadual: 'ISENTO',
      estrangeiro: false,
      modelo_tarifario: 'net',
      comissao_padrao: 0.0,
      politica_faturamento: 'faturado',
      prazo_pagamento_dias: 45,
      limite_credito: 250000.0,
      status: 'ativo',
      observacoes:
        'Contrato corporativo para hospedagem de executivos e engenheiros.',
      endereco: {
        create: {
          logradouro: 'Avenida República do Chile',
          numero: '65',
          complemento: 'Edifício Sede',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '20031912',
          pais: 'Brasil',
        },
      },
      contatos: {
        create: [
          {
            tipo_contato: 'comercial',
            nome: 'Carlos Eduardo Nogueira',
            email: 'carlos.nogueira@petrobras.com.br',
            telefone: '21977772001',
            cargo: 'Coordenador de Viagens Corporativas',
          },
        ],
      },
    },
  })

  // 3. Decolar.com Ltda (Operadora / OTA)
  const decolar = await client.parceiro.create({
    data: {
      hotel_id,
      tipo_parceiro: 'operadora_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Decolar.com Ltda',
      nome_fantasia: 'Decolar',
      documento: '10695028000144',
      inscricao_estadual: '148283920112',
      estrangeiro: false,
      modelo_tarifario: 'comissionada',
      comissao_padrao: 15.0,
      politica_faturamento: 'prepago',
      prazo_pagamento_dias: 0,
      limite_credito: 50000.0,
      status: 'ativo',
      observacoes: 'Integração direta via canal online.',
      endereco: {
        create: {
          logradouro: 'Alameda Grajaú',
          numero: '219',
          complemento: 'Torre Alpha',
          bairro: 'Alphaville',
          cidade: 'Barueri',
          estado: 'SP',
          cep: '06454050',
          pais: 'Brasil',
        },
      },
      contatos: {
        create: [
          {
            tipo_contato: 'operacional',
            nome: 'Suporte Hoteleiro Decolar',
            email: 'hoteis@decolar.com',
            telefone: '11966663001',
            cargo: 'Market Manager',
          },
        ],
      },
    },
  })

  // 4. Vale S.A. (Corporativo)
  const vale = await client.parceiro.create({
    data: {
      hotel_id,
      tipo_parceiro: 'empresa_corporativa',
      tipo_pessoa: 'PJ',
      razao_social: 'Vale S.A.',
      nome_fantasia: 'Vale',
      documento: '33592510000154',
      inscricao_estadual: 'ISENTO',
      estrangeiro: false,
      modelo_tarifario: 'net',
      comissao_padrao: 0.0,
      politica_faturamento: 'faturado',
      prazo_pagamento_dias: 30,
      limite_credito: 180000.0,
      status: 'ativo',
      observacoes: 'Tarifa acordada fixa para equipes técnicas e auditoria.',
      endereco: {
        create: {
          logradouro: 'Praia de Botafogo',
          numero: '186',
          complemento: 'Torre Sul',
          bairro: 'Botafogo',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '22250145',
          pais: 'Brasil',
        },
      },
      contatos: {
        create: [
          {
            tipo_contato: 'comercial',
            nome: 'Mariana Azevedo',
            email: 'mariana.azevedo@vale.com',
            telefone: '21955554001',
            cargo: 'Gestora de Facilities & Viagens',
          },
        ],
      },
    },
  })

  // 5. Booking.com Brasil Serviços de Reserva de Hotéis Ltda
  const booking = await client.parceiro.create({
    data: {
      hotel_id,
      tipo_parceiro: 'operadora_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Booking.com Brasil Serviços de Reserva de Hotéis Ltda',
      nome_fantasia: 'Booking.com',
      documento: '10949524000187',
      inscricao_estadual: '148909123115',
      estrangeiro: false,
      modelo_tarifario: 'comissionada',
      comissao_padrao: 13.0,
      politica_faturamento: 'faturado',
      prazo_pagamento_dias: 15,
      limite_credito: 120000.0,
      status: 'ativo',
      observacoes: 'Acordo de conectividade OTA global.',
      endereco: {
        create: {
          logradouro: 'Avenida Brigadeiro Faria Lima',
          numero: '3477',
          complemento: '14º andar',
          bairro: 'Itaim Bibi',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '04538133',
          pais: 'Brasil',
        },
      },
      contatos: {
        create: [
          {
            tipo_contato: 'comercial',
            nome: 'Lucas Silveira',
            email: 'lucas.silveira@booking.com',
            telefone: '11944445001',
            cargo: 'Senior Account Executive',
          },
        ],
      },
    },
  })

  console.log(
    `[DEV] 5 parceiros semeados: CVC, Petrobras, Decolar, Vale e Booking.com.`
  )

  return { cvc, petrobras, decolar, vale, booking }
}
