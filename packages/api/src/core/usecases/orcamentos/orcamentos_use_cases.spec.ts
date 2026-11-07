import { beforeEach, describe, expect, it } from 'vitest'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryLeadRepository } from '@/core/repositories/leads/in-memory/in_memory_lead_repository'
import { InMemoryOrcamentoRepository } from '@/core/repositories/orcamentos/in-memory/in_memory_orcamento_repository'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { CriarLeadUseCase } from '@/core/usecases/leads/criar_lead_use_case'
import { CriarOrcamentoUseCase } from './criar_orcamento_use_case'

describe('Orcamentos & Leads Use Cases', () => {
  let leads_repo: InMemoryLeadRepository
  let orcamentos_repo: InMemoryOrcamentoRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let categorias_repo: InMemoryCategoriaQuartoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let parceiros_repo: InMemoryParceiroComercialRepository
  let criar_lead_use_case: CriarLeadUseCase
  let criar_orcamento_use_case: CriarOrcamentoUseCase

  beforeEach(() => {
    leads_repo = new InMemoryLeadRepository()
    orcamentos_repo = new InMemoryOrcamentoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    categorias_repo = new InMemoryCategoriaQuartoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

    criar_lead_use_case = new CriarLeadUseCase(leads_repo)
    criar_orcamento_use_case = new CriarOrcamentoUseCase(
      orcamentos_repo,
      leads_repo,
      regimes_repo,
      categorias_repo,
      tarifarios_repo,
      parceiros_repo
    )
  })

  describe('CriarLeadUseCase', () => {
    it('creates a new lead successfully', async () => {
      const lead = await criar_lead_use_case.execute({
        hotel_id: 'hotel-1',
        nome: 'João da Silva',
        telefone: '11999998888',
        email: 'joao@exemplo.com',
      })

      expect(lead.id).toBeDefined()
      expect(lead.nome).toBe('João da Silva')
      expect(lead.email).toBe('joao@exemplo.com')
    })

    it('reuses and updates existing lead if phone or email matches in the same hotel', async () => {
      const first = await criar_lead_use_case.execute({
        hotel_id: 'hotel-1',
        nome: 'João Silva',
        telefone: '11999998888',
        email: 'joao@exemplo.com',
      })

      const second = await criar_lead_use_case.execute({
        hotel_id: 'hotel-1',
        nome: 'João da Silva Santos',
        telefone: '11999998888',
        email: 'joao.novo@exemplo.com',
      })

      expect(second.id).toBe(first.id)
      expect(second.nome).toBe('João da Silva Santos')
    })
  })

  describe('CriarOrcamentoUseCase', () => {
    it('creates an orcamento calculating nights without checking room inventory availability', async () => {
      // 1. Setup categoria
      const cat = await categorias_repo.create({
        hotel_id: 'hotel-1',
        nome: 'Suíte Presidencial',
        status: 'S',
      })
      tarifarios_repo.register_category(cat.id, cat.nome, 'S')

      // 2. Setup regime
      const regime = await regimes_repo.create({
        hotel_id: 'hotel-1',
        titulo: 'Café da Manhã',
        cor_pulseira: '#3B82F6',
        ativo: true,
      })
      tarifarios_repo.register_regime_alimentacao(
        regime.id,
        regime.titulo,
        regime.cor_pulseira
      )

      // 3. Setup tarifário cobrindo o período 2026-12-01 até 2026-12-03 (2 noites)
      await tarifarios_repo.create({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        nome: 'Tarifa Padrão Café',
        datas: ['2026-12-01', '2026-12-02'],
        valor_diaria: '350.00',
        ativo: true,
      })

      // 4. Criar orçamento com novo lead
      const orcamento = await criar_orcamento_use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-01',
        check_out: '2026-12-03',
        quantidade_adultos: 2,
        quantidade_criancas: 1,
        quantidade_pets: 1,
        cupom_desconto: 'VERAO2026',
        observacoes: 'Chegada após as 20h',
        lead: {
          nome: 'Mariana Costa',
          telefone: '11988887777',
          email: 'mariana@exemplo.com',
        },
      })

      expect(orcamento.id).toBeDefined()
      expect(orcamento.lead_id).toBeDefined()
      expect(orcamento.token_publico).toHaveLength(32)
      expect(orcamento.status).toBe('pendente')
      expect(orcamento.detalhamento_noites).toHaveLength(2)
      expect(orcamento.valor_total).toBe('700.00')
      expect(orcamento.quantidade_adultos).toBe(2)
      expect(orcamento.quantidade_criancas).toBe(1)
      expect(orcamento.quantidade_pets).toBe(1)
      expect(orcamento.cupom_desconto).toBe('VERAO2026')
      expect(orcamento.parceiro_id).toBeNull()
    })

    it('US2: creates an orcamento using strictly the commercial partner rates', async () => {
      const cat = await categorias_repo.create({
        hotel_id: 'hotel-1',
        nome: 'Suítes Master',
        status: 'S',
      })
      tarifarios_repo.register_category(cat.id, cat.nome, 'S')

      const regime = await regimes_repo.create({
        hotel_id: 'hotel-1',
        titulo: 'Pensão Completa',
        cor_pulseira: '#10B981',
        ativo: true,
      })
      tarifarios_repo.register_regime_alimentacao(
        regime.id,
        regime.titulo,
        regime.cor_pulseira
      )

      const parceiro = await parceiros_repo.create({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'operadora_turismo',
        tipo_pessoa: 'PJ',
        razao_social: 'CVC Brasil Operadora',
        documento: '11222333000181',
        modelo_tarifario: 'comissionada',
        politica_faturamento: 'prepago',
        status: 'ativo',
      })

      // Tarifa pública: R$ 500
      await tarifarios_repo.create({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        parceiro_id: null,
        nome: 'Tarifa Balcão',
        datas: ['2026-12-10', '2026-12-11'],
        valor_diaria: '500.00',
        ativo: true,
      })

      // Tarifa parceiro: R$ 380
      await tarifarios_repo.create({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        parceiro_id: parceiro.id,
        nome: 'Tarifa Negociada CVC',
        datas: ['2026-12-10', '2026-12-11'],
        valor_diaria: '380.00',
        ativo: true,
      })

      const orcamento_parceiro = await criar_orcamento_use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        parceiro_id: parceiro.id,
        check_in: '2026-12-10',
        check_out: '2026-12-12',
        quantidade_adultos: 2,
        lead: {
          nome: 'Operador CVC',
          telefone: '11988880000',
          email: 'cvc@turismo.com',
        },
      })

      expect(orcamento_parceiro.parceiro_id).toBe(parceiro.id)
      expect(orcamento_parceiro.valor_total).toBe('760.00') // 2 noites * 380
      expect(orcamento_parceiro.detalhamento_noites[0].valor_diaria).toBe(
        '380.00'
      )
      expect(orcamento_parceiro.detalhamento_noites[0].tarifario_nome).toBe(
        'Tarifa Negociada CVC'
      )
    })

    it('US2: throws TarifarioSemCoberturaError when category has no rate plan for the partner', async () => {
      const cat = await categorias_repo.create({
        hotel_id: 'hotel-1',
        nome: 'Suíte Presidencial Sem Tarifa de Parceiro',
        status: 'S',
      })
      tarifarios_repo.register_category(cat.id, cat.nome, 'S')

      const regime = await regimes_repo.create({
        hotel_id: 'hotel-1',
        titulo: 'Café',
        cor_pulseira: '#3B82F6',
        ativo: true,
      })
      tarifarios_repo.register_regime_alimentacao(
        regime.id,
        regime.titulo,
        regime.cor_pulseira
      )

      const parceiro = await parceiros_repo.create({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'empresa_corporativa',
        tipo_pessoa: 'PJ',
        razao_social: 'Vale S/A',
        documento: '33000167000101',
        modelo_tarifario: 'acordo',
        politica_faturamento: 'faturado',
        status: 'ativo',
      })

      // Cria apenas tarifa pública, sem tarifa para o parceiro Vale
      await tarifarios_repo.create({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        regime_alimentacao_id: regime.id,
        parceiro_id: null,
        nome: 'Pública Balcão',
        datas: ['2026-12-10'],
        valor_diaria: '600.00',
        ativo: true,
      })

      await expect(
        criar_orcamento_use_case.execute({
          hotel_id: 'hotel-1',
          categoria_quarto_id: cat.id,
          regime_alimentacao_id: regime.id,
          parceiro_id: parceiro.id,
          check_in: '2026-12-10',
          check_out: '2026-12-11',
          quantidade_adultos: 1,
          lead: {
            nome: 'Funcionário Vale',
            telefone: '11999990000',
            email: 'vale@corp.com',
          },
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
    })
  })
})
