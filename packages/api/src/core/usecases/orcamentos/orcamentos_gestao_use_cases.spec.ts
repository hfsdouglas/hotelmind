import { beforeEach, describe, expect, it } from 'vitest'
import { Orcamento } from '@/core/entities/orcamento'
import { CategoriaQuartoNotFoundError } from '@/core/errors/categoria_quarto_errors'
import {
  OrcamentoNotFoundError,
  OrcamentoValidationError,
} from '@/core/errors/orcamento_errors'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryLeadRepository } from '@/core/repositories/leads/in-memory/in_memory_lead_repository'
import { InMemoryOrcamentoRepository } from '@/core/repositories/orcamentos/in-memory/in_memory_orcamento_repository'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { BuscarOrcamentoPublicoUseCase } from './buscar_orcamento_publico_use_case'
import { BuscarOrcamentoUseCase } from './buscar_orcamento_use_case'
import { EditarOrcamentoUseCase } from './editar_orcamento_use_case'
import { ExcluirOrcamentoUseCase } from './excluir_orcamento_use_case'
import { ListarOrcamentosUseCase } from './listar_orcamentos_use_case'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'

describe('Orcamentos: busca, listagem, edição, exclusão e visão pública', () => {
  let orcamentos_repo: InMemoryOrcamentoRepository
  let leads_repo: InMemoryLeadRepository
  let regimes_repo: InMemoryRegimeAlimentacaoRepository
  let categorias_repo: InMemoryCategoriaQuartoRepository
  let tarifarios_repo: InMemoryTarifarioRepository
  let parceiros_repo: InMemoryParceiroComercialRepository

  let buscar: BuscarOrcamentoUseCase
  let buscar_publico: BuscarOrcamentoPublicoUseCase
  let editar: EditarOrcamentoUseCase
  let excluir: ExcluirOrcamentoUseCase
  let listar: ListarOrcamentosUseCase

  beforeEach(() => {
    orcamentos_repo = new InMemoryOrcamentoRepository()
    leads_repo = new InMemoryLeadRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    categorias_repo = new InMemoryCategoriaQuartoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

    buscar = new BuscarOrcamentoUseCase(orcamentos_repo)
    buscar_publico = new BuscarOrcamentoPublicoUseCase(orcamentos_repo)
    excluir = new ExcluirOrcamentoUseCase(orcamentos_repo)
    listar = new ListarOrcamentosUseCase(orcamentos_repo)
    editar = new EditarOrcamentoUseCase(
      orcamentos_repo,
      regimes_repo,
      categorias_repo,
      tarifarios_repo,
      leads_repo,
      parceiros_repo
    )
  })

  async function seed_catalogo(hotel_id: string, valor_diaria = '300.00') {
    const categoria = await categorias_repo.create({
      hotel_id,
      nome: 'Suíte',
      status: 'S',
    })
    tarifarios_repo.register_category(categoria.id, categoria.nome, 'S')
    const regime = await regimes_repo.create({
      hotel_id,
      titulo: 'Café',
      cor_pulseira: '#3B82F6',
      ativo: true,
    })
    tarifarios_repo.register_regime_alimentacao(
      regime.id,
      regime.titulo,
      regime.cor_pulseira
    )
    await tarifarios_repo.create({
      hotel_id,
      categoria_quarto_id: categoria.id,
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa Base',
      datas: [
        '2026-12-01',
        '2026-12-02',
        '2026-12-03',
        '2026-12-04',
        '2026-12-05',
      ],
      valor_diaria,
      ativo: true,
    })
    return { categoria, regime }
  }

  async function seed_orcamento(
    hotel_id: string,
    overrides: Partial<{
      check_in: string
      check_out: string
      lead_nome: string
    }> = {}
  ) {
    const { categoria, regime } = await seed_catalogo(hotel_id)
    const lead = await leads_repo.create({
      hotel_id,
      nome: overrides.lead_nome ?? 'Maria',
      telefone: '11999990000',
      email: 'maria@exemplo.com',
    })
    const orcamento = await orcamentos_repo.create({
      hotel_id,
      lead_id: lead.id,
      regime_alimentacao_id: regime.id,
      categoria_quarto_id: categoria.id,
      check_in: overrides.check_in ?? '2026-12-01',
      check_out: overrides.check_out ?? '2026-12-03',
      quantidade_adultos: 2,
      valor_total: '600.00',
      detalhamento_noites: [],
      token_publico: `token-${hotel_id}-${orcamentos_repo.items.length}`,
    })
    return { orcamento, categoria, regime, lead }
  }

  describe('BuscarOrcamentoUseCase', () => {
    it('retorna o orçamento do próprio hotel', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      const found = await buscar.execute({
        id: orcamento.id,
        hotel_id: HOTEL_A,
      })

      expect(found.id).toBe(orcamento.id)
    })

    it('lança OrcamentoNotFoundError para id inexistente', async () => {
      await expect(
        buscar.execute({ id: 'inexistente', hotel_id: HOTEL_A })
      ).rejects.toThrow(OrcamentoNotFoundError)
    })

    it('isolamento: hotel B não enxerga orçamento do hotel A', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        buscar.execute({ id: orcamento.id, hotel_id: HOTEL_B })
      ).rejects.toThrow(OrcamentoNotFoundError)
    })
  })

  describe('ListarOrcamentosUseCase', () => {
    it('lista apenas orçamentos do hotel informado (isolamento)', async () => {
      await seed_orcamento(HOTEL_A)
      await seed_orcamento(HOTEL_A)
      const { orcamento: do_hotel_b } = await seed_orcamento(HOTEL_B)

      const result_a = await listar.execute({
        hotel_id: HOTEL_A,
        pagina: 1,
        limite: 50,
      })
      const result_b = await listar.execute({
        hotel_id: HOTEL_B,
        pagina: 1,
        limite: 50,
      })

      expect(result_a.meta.total).toBe(2)
      expect(result_a.data.every(o => o.hotel_id === HOTEL_A)).toBe(true)
      expect(result_b.data.map(o => o.id)).toEqual([do_hotel_b.id])
    })

    it('retorna lista vazia quando o hotel não tem orçamentos', async () => {
      await seed_orcamento(HOTEL_A)

      const result = await listar.execute({
        hotel_id: HOTEL_B,
        pagina: 1,
        limite: 50,
      })

      expect(result.data).toEqual([])
      expect(result.meta).toMatchObject({ total: 0, ultima_pagina: 1 })
    })

    it('pagina os resultados e informa a última página', async () => {
      for (let i = 0; i < 3; i++) await seed_orcamento(HOTEL_A)

      const result = await listar.execute({
        hotel_id: HOTEL_A,
        pagina: 2,
        limite: 2,
      })

      expect(result.data).toHaveLength(1)
      expect(result.meta).toMatchObject({
        pagina: 2,
        limite: 2,
        total: 3,
        ultima_pagina: 2,
      })
    })

    it('filtra por status', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      await seed_orcamento(HOTEL_A)
      await orcamentos_repo.update({
        id: orcamento.id,
        hotel_id: HOTEL_A,
        status: 'aprovado',
      })

      const result = await listar.execute({
        hotel_id: HOTEL_A,
        pagina: 1,
        limite: 50,
        status: 'aprovado',
      })

      expect(result.data.map(o => o.id)).toEqual([orcamento.id])
    })
  })

  describe('ExcluirOrcamentoUseCase', () => {
    it('exclui o orçamento do próprio hotel', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await excluir.execute({ id: orcamento.id, hotel_id: HOTEL_A })

      expect(orcamentos_repo.items).toHaveLength(0)
    })

    it('lança OrcamentoNotFoundError para id inexistente', async () => {
      await expect(
        excluir.execute({ id: 'inexistente', hotel_id: HOTEL_A })
      ).rejects.toThrow(OrcamentoNotFoundError)
    })

    it('isolamento: hotel B não consegue excluir orçamento do hotel A', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        excluir.execute({ id: orcamento.id, hotel_id: HOTEL_B })
      ).rejects.toThrow(OrcamentoNotFoundError)
      expect(orcamentos_repo.items).toHaveLength(1)
    })
  })

  describe('EditarOrcamentoUseCase', () => {
    it('lança OrcamentoNotFoundError para id inexistente', async () => {
      await expect(
        editar.execute({
          id: 'inexistente',
          hotel_id: HOTEL_A,
          status: 'aprovado',
        })
      ).rejects.toThrow(OrcamentoNotFoundError)
    })

    it('atualiza campos sem recalcular quando datas, regime, categoria e parceiro não mudam', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      const updated = await editar.execute({
        id: orcamento.id,
        hotel_id: HOTEL_A,
        status: 'aprovado',
        observacoes: 'VIP',
        quantidade_adultos: 3,
      })

      expect(updated.status).toBe('aprovado')
      expect(updated.observacoes).toBe('VIP')
      expect(updated.quantidade_adultos).toBe(3)
      expect(updated.valor_total).toBe('600.00')
      expect(updated.detalhamento_noites).toEqual([])
    })

    it('recalcula valor e detalhamento ao alterar o período', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      const updated = await editar.execute({
        id: orcamento.id,
        hotel_id: HOTEL_A,
        check_out: '2026-12-05',
      })

      expect(updated.check_out).toBe('2026-12-05')
      expect(updated.valor_total).toBe('1200.00')
      expect(updated.detalhamento_noites.map(n => n.data)).toEqual([
        '2026-12-01',
        '2026-12-02',
        '2026-12-03',
        '2026-12-04',
      ])
    })

    it('rejeita check-out igual ou anterior ao check-in', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          check_out: '2026-12-01',
        })
      ).rejects.toThrow(OrcamentoValidationError)
    })

    it('lança TarifarioSemCoberturaError quando o novo período não tem tarifa e não altera o orçamento', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          check_in: '2027-01-10',
          check_out: '2027-01-12',
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
      expect(orcamentos_repo.items[0].check_in).toBe('2026-12-01')
    })

    it('rejeita regime inativo', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      const inativo = await regimes_repo.create({
        hotel_id: HOTEL_A,
        titulo: 'Inativo',
        cor_pulseira: '#000000',
        ativo: false,
      })

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          regime_alimentacao_id: inativo.id,
        })
      ).rejects.toThrow(OrcamentoValidationError)
    })

    it('rejeita regime inexistente', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          regime_alimentacao_id: 'nao-existe',
        })
      ).rejects.toThrow(RegimeAlimentacaoNotFoundError)
    })

    it('rejeita categoria inexistente', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          categoria_quarto_id: 'nao-existe',
        })
      ).rejects.toThrow(CategoriaQuartoNotFoundError)
    })

    it('rejeita categoria inativa', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      const inativa = await categorias_repo.create({
        hotel_id: HOTEL_A,
        nome: 'Desativada',
        status: 'N',
      })

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          categoria_quarto_id: inativa.id,
        })
      ).rejects.toThrow(CategoriaQuartoInativaError)
    })

    it('rejeita parceiro inexistente', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          parceiro_id: 'nao-existe',
        })
      ).rejects.toThrow(OrcamentoValidationError)
    })

    it('rejeita parceiro inativo', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      const parceiro = await parceiros_repo.create({
        hotel_id: HOTEL_A,
        tipo_parceiro: 'operadora_turismo',
        tipo_pessoa: 'PJ',
        razao_social: 'Operadora',
        documento: '11222333000181',
        modelo_tarifario: 'comissionada',
        politica_faturamento: 'prepago',
        status: 'inativo',
      })

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          parceiro_id: parceiro.id,
        })
      ).rejects.toThrow(/inativo/)
    })

    it('atualiza os dados do lead vinculado', async () => {
      const { orcamento, lead } = await seed_orcamento(HOTEL_A)

      await editar.execute({
        id: orcamento.id,
        hotel_id: HOTEL_A,
        lead: { nome: 'Maria Souza' },
      })

      const lead_atual = await leads_repo.find_by_id(lead.id, HOTEL_A)
      expect(lead_atual?.nome).toBe('Maria Souza')
      expect(lead_atual?.email).toBe('maria@exemplo.com')
    })

    it('isolamento: hotel B não consegue editar orçamento do hotel A', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_B,
          status: 'aprovado',
        })
      ).rejects.toThrow(OrcamentoNotFoundError)
      expect(orcamentos_repo.items[0].status).toBe('pendente')
    })

    it('isolamento: não permite usar categoria ou regime de outro hotel', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      const { categoria, regime } = await seed_catalogo(HOTEL_B)

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          categoria_quarto_id: categoria.id,
        })
      ).rejects.toThrow(CategoriaQuartoNotFoundError)
      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          regime_alimentacao_id: regime.id,
        })
      ).rejects.toThrow(RegimeAlimentacaoNotFoundError)
    })

    it('isolamento: não permite vincular parceiro de outro hotel', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      const parceiro_b = await parceiros_repo.create({
        hotel_id: HOTEL_B,
        tipo_parceiro: 'operadora_turismo',
        tipo_pessoa: 'PJ',
        razao_social: 'Operadora B',
        documento: '11222333000181',
        modelo_tarifario: 'comissionada',
        politica_faturamento: 'prepago',
        status: 'ativo',
      })

      await expect(
        editar.execute({
          id: orcamento.id,
          hotel_id: HOTEL_A,
          parceiro_id: parceiro_b.id,
        })
      ).rejects.toThrow(OrcamentoValidationError)
    })

    it('isolamento: o cálculo usa apenas tarifas do próprio hotel', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)
      // hotel B tem tarifa muito mais barata, mas na mesma categoria id não existe
      await seed_catalogo(HOTEL_B, '1.00')

      const updated = await editar.execute({
        id: orcamento.id,
        hotel_id: HOTEL_A,
        check_out: '2026-12-02',
      })

      expect(updated.valor_total).toBe('300.00')
    })
  })

  describe('BuscarOrcamentoPublicoUseCase', () => {
    function build_publico(token: string, hotel_id = HOTEL_A) {
      const orcamento = new Orcamento({
        id: 'orc-interno-1',
        hotel_id,
        lead_id: 'lead-interno-1',
        parceiro_id: 'parceiro-interno-1',
        regime_alimentacao_id: 'regime-1',
        categoria_quarto_id: 'cat-1',
        check_in: '2026-12-01',
        check_out: '2026-12-04',
        quantidade_adultos: 2,
        quantidade_criancas: 1,
        quantidade_pets: 0,
        valor_total: '900.00',
        detalhamento_noites: [],
        token_publico: token,
        status: 'pendente',
        observacoes: 'OBSERVACAO INTERNA SECRETA',
        cupom_desconto: null,
        lead: {
          id: 'lead-interno-1',
          nome: 'Maria Souza',
          telefone: '11988887777',
          email: 'maria.privada@exemplo.com',
        },
        parceiro: {
          id: 'parceiro-interno-1',
          razao_social: 'PARCEIRO CONFIDENCIAL LTDA',
        },
        hotel: {
          id: hotel_id,
          nome_fantasia: 'Hotel Aurora',
          nome_hotel: 'Aurora Nome',
          telefone_comercial: '1133334444',
          celular: '11977776666',
          email_comercial: 'contato@aurora.com',
          endereco: null,
        },
        regime_alimentacao: {
          id: 'regime-1',
          titulo: 'Meia Pensão',
          cor_pulseira: '#10B981',
          descricao: 'Café e jantar',
        },
        categoria_quarto: { id: 'cat-1', nome: 'Suíte Master' },
        created_at: new Date('2026-11-01T10:00:00.000Z'),
        updated_at: new Date('2026-11-01T10:00:00.000Z'),
      })
      orcamentos_repo.items.push(orcamento)
      return orcamento
    }

    it('retorna a visão pública calculando o total de noites', async () => {
      build_publico('token-valido')

      const view = await buscar_publico.execute('token-valido')

      expect(view).toMatchObject({
        token_publico: 'token-valido',
        hotel_nome: 'Hotel Aurora',
        total_noites: 3,
        lead_nome: 'Maria Souza',
        valor_total: '900.00',
        regime_alimentacao: {
          nome: 'Meia Pensão',
          cor: '#10B981',
          descricao: 'Café e jantar',
        },
        categoria_quarto: { nome: 'Suíte Master' },
        criado_em: '2026-11-01T10:00:00.000Z',
      })
    })

    it('não vaza dados internos (ids, contato do lead, parceiro, observações)', async () => {
      build_publico('token-valido')

      const view = await buscar_publico.execute('token-valido')
      const serialized = JSON.stringify(view)

      expect(view).not.toHaveProperty('id')
      expect(view).not.toHaveProperty('hotel_id')
      expect(view).not.toHaveProperty('lead_id')
      expect(view).not.toHaveProperty('parceiro_id')
      expect(view).not.toHaveProperty('observacoes')
      expect(serialized).not.toContain('maria.privada@exemplo.com')
      expect(serialized).not.toContain('11988887777')
      expect(serialized).not.toContain('PARCEIRO CONFIDENCIAL')
      expect(serialized).not.toContain('OBSERVACAO INTERNA SECRETA')
      expect(serialized).not.toContain('parceiro-interno-1')
      expect(serialized).not.toContain('lead-interno-1')
    })

    it('lança OrcamentoNotFoundError para token inválido', async () => {
      build_publico('token-valido')

      await expect(buscar_publico.execute('token-errado')).rejects.toThrow(
        OrcamentoNotFoundError
      )
    })

    it('lança OrcamentoNotFoundError para token vazio', async () => {
      build_publico('token-valido')

      await expect(buscar_publico.execute('')).rejects.toThrow(
        OrcamentoNotFoundError
      )
    })

    it('retorna somente o orçamento do token informado quando há vários hotéis', async () => {
      build_publico('token-a', HOTEL_A)
      const outro = build_publico('token-b', HOTEL_B)

      const view = await buscar_publico.execute(outro.token_publico)

      expect(view.token_publico).toBe('token-b')
    })

    it('usa valores padrão quando relacionamentos não estão carregados', async () => {
      const { orcamento } = await seed_orcamento(HOTEL_A)

      const view = await buscar_publico.execute(orcamento.token_publico)

      expect(view.hotel_nome).toBe('Hotel')
      expect(view.lead_nome).toBe('Cliente')
      expect(view.categoria_quarto.nome).toBe('Suíte')
      expect(view.total_noites).toBe(2)
    })
  })
})
