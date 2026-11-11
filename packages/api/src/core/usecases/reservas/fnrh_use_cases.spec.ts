import type { ReservaStatus, SaveFichaPayload } from '@hotelmind/contracts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Hotel } from '@/core/entities/hotel'
import {
  FnrhLinkInvalidoError,
  ReservaNotFoundError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import { InMemoryHotelRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { BuscarFnrhPublicaUseCase } from './buscar_fnrh_publica_use_case'
import { EnviarFnrhUseCase } from './enviar_fnrh_use_case'
import { GerenciarLinkFnrhUseCase } from './gerenciar_link_fnrh_use_case'
import { SalvarFichaPublicaUseCase } from './salvar_ficha_publica_use_case'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'

const FICHA_COMPLETA: SaveFichaPayload = {
  concluir: true,
  nome_completo: 'Marcos Braz',
  nacionalidade: 'Brasileira',
  data_nascimento: '1985-05-20',
  sexo: 'Masculino',
  profissao: 'Engenheiro',
  tipo_documento: 'rg',
  numero_documento: '12345678',
  logradouro: 'Av Paulista',
  cidade: 'São Paulo',
  estado: 'SP',
  telefone: '11999998888',
  motivo_viagem: 'Lazer',
  meio_transporte: 'Avião',
}

describe('FNRH: link público e fichas', () => {
  let reservas_repo: InMemoryReservaRepository
  let hospedes_repo: InMemoryReservaHospedeRepository
  let hotels_repo: InMemoryHotelRepository

  let buscar: BuscarFnrhPublicaUseCase
  let enviar: EnviarFnrhUseCase
  let link: GerenciarLinkFnrhUseCase
  let salvar: SalvarFichaPublicaUseCase

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-02T12:00:00.000Z'))

    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    hotels_repo = new InMemoryHotelRepository()

    buscar = new BuscarFnrhPublicaUseCase(reservas_repo, hotels_repo)
    enviar = new EnviarFnrhUseCase(reservas_repo, hospedes_repo)
    link = new GerenciarLinkFnrhUseCase(reservas_repo)
    salvar = new SalvarFichaPublicaUseCase(reservas_repo, hospedes_repo)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function seed_reserva(
    overrides: Partial<{
      hotel_id: string
      token: string
      status: ReservaStatus
      check_out: string
      ativo: boolean
      adultos: number
    }> = {}
  ) {
    const hotel_id = overrides.hotel_id ?? HOTEL_A
    const reserva = await reservas_repo.create({
      hotel_id,
      codigo: `RES-${reservas_repo.items.length + 1}`,
      titular_nome: 'Marcos Titular',
      titular_telefone: '11900000000',
      titular_email: 'titular.privado@exemplo.com',
      quarto_id: 'quarto-1',
      regime_alimentacao_id: 'regime-1',
      check_in: '2026-11-20',
      check_out: overrides.check_out ?? '2026-12-05',
      quantidade_adultos: overrides.adultos ?? 2,
      valor_total: '800.00',
      detalhamento_diarias: [],
      token_fnrh: overrides.token ?? `token-${reservas_repo.items.length + 1}`,
      token_fnrh_ativo: overrides.ativo ?? true,
      status: overrides.status ?? 'confirmada',
      observacoes: 'OBSERVACAO INTERNA',
    })
    const total = reserva.total_hospedes
    await hospedes_repo.create_many(
      Array.from({ length: total }, (_, i) => ({
        reserva_id: reserva.id,
        posicao: i + 1,
        ficha_status: 'pendente' as const,
      }))
    )
    return reserva
  }

  describe('BuscarFnrhPublicaUseCase', () => {
    it('retorna a visão pública da reserva com o nome do hotel', async () => {
      hotels_repo.seed(
        new Hotel({
          id: HOTEL_A,
          nome_hotel: 'Aurora',
          nome_fantasia: 'Hotel Aurora',
          razao_social: 'Aurora LTDA',
          cnpj: '11222333000181',
          email_comercial: 'a@a.com',
          telefone_comercial: '1133334444',
        })
      )
      await seed_reserva({ token: 'tk-1' })

      const view = await buscar.execute('tk-1')

      expect(view).toMatchObject({
        hotel_nome: 'Hotel Aurora',
        titular_nome: 'Marcos Titular',
        check_in: '2026-11-20',
        check_out: '2026-12-05',
        total_hospedes: 2,
        fnrh_enviada_em: null,
      })
      expect(view.hospedes.map(h => h.posicao)).toEqual([1, 2])
    })

    it('usa o nome "Hotel" quando o hotel não é encontrado', async () => {
      await seed_reserva({ token: 'tk-1' })

      const view = await buscar.execute('tk-1')

      expect(view.hotel_nome).toBe('Hotel')
    })

    it('não vaza dados internos da reserva', async () => {
      await seed_reserva({ token: 'tk-1' })

      const view = await buscar.execute('tk-1')
      const serialized = JSON.stringify(view)

      expect(view).not.toHaveProperty('id')
      expect(view).not.toHaveProperty('hotel_id')
      expect(view).not.toHaveProperty('codigo')
      expect(view).not.toHaveProperty('valor_total')
      expect(view).not.toHaveProperty('token_fnrh')
      expect(view).not.toHaveProperty('observacoes')
      expect(serialized).not.toContain('titular.privado@exemplo.com')
      expect(serialized).not.toContain('OBSERVACAO INTERNA')
      expect(serialized).not.toContain('800.00')
    })

    it('rejeita token inexistente', async () => {
      await seed_reserva({ token: 'tk-1' })

      await expect(buscar.execute('tk-errado')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
    })

    it('rejeita link desativado', async () => {
      await seed_reserva({ token: 'tk-1', ativo: false })

      await expect(buscar.execute('tk-1')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
    })

    it.each([
      'check_out',
      'cancelada',
      'no_show',
    ] as ReservaStatus[])('rejeita link de reserva com status %s', async status => {
      await seed_reserva({ token: 'tk-1', status })

      await expect(buscar.execute('tk-1')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
    })

    it('rejeita link após a data de check-out', async () => {
      await seed_reserva({ token: 'tk-1', check_out: '2026-12-01' })

      await expect(buscar.execute('tk-1')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
    })

    it('aceita link no próprio dia do check-out', async () => {
      await seed_reserva({ token: 'tk-1', check_out: '2026-12-02' })

      await expect(buscar.execute('tk-1')).resolves.toBeDefined()
    })

    it('isolamento: cada token expõe apenas o hotel da sua reserva', async () => {
      hotels_repo.seed(
        new Hotel({
          id: HOTEL_A,
          nome_hotel: 'A',
          nome_fantasia: 'Hotel A',
          razao_social: 'A LTDA',
          cnpj: '11222333000181',
          email_comercial: 'a@a.com',
          telefone_comercial: '1133334444',
        })
      )
      hotels_repo.seed(
        new Hotel({
          id: HOTEL_B,
          nome_hotel: 'B',
          nome_fantasia: 'Hotel B',
          razao_social: 'B LTDA',
          cnpj: '11222333000182',
          email_comercial: 'b@b.com',
          telefone_comercial: '1133335555',
        })
      )
      await seed_reserva({ hotel_id: HOTEL_A, token: 'tk-a' })
      const reserva_b = await seed_reserva({ hotel_id: HOTEL_B, token: 'tk-b' })
      await reservas_repo.update(reserva_b.id, HOTEL_B, {
        titular_nome: 'Titular B',
      })

      const view_a = await buscar.execute('tk-a')
      const view_b = await buscar.execute('tk-b')

      expect(view_a.hotel_nome).toBe('Hotel A')
      expect(view_a.titular_nome).toBe('Marcos Titular')
      expect(view_b.hotel_nome).toBe('Hotel B')
      expect(view_b.titular_nome).toBe('Titular B')
    })
  })

  describe('SalvarFichaPublicaUseCase', () => {
    it('salva rascunho preenchido por cliente', async () => {
      await seed_reserva({ token: 'tk-1' })

      const ficha = await salvar.execute({
        token: 'tk-1',
        posicao: 1,
        dados: { nome_completo: 'Marcos Braz' },
      })

      expect(ficha.ficha_status).toBe('rascunho')
      expect(ficha.preenchido_por).toBe('cliente')
      expect(ficha.nome_completo).toBe('Marcos Braz')
    })

    it('marca como preenchida quando concluir com dados válidos', async () => {
      await seed_reserva({ token: 'tk-1' })

      const ficha = await salvar.execute({
        token: 'tk-1',
        posicao: 2,
        dados: FICHA_COMPLETA,
      })

      expect(ficha.ficha_status).toBe('preenchida')
      expect(ficha.posicao).toBe(2)
    })

    it('rejeita conclusão com dados obrigatórios ausentes e não altera a ficha', async () => {
      await seed_reserva({ token: 'tk-1' })

      await expect(
        salvar.execute({
          token: 'tk-1',
          posicao: 1,
          dados: { concluir: true, nome_completo: 'Marcos Braz' },
        })
      ).rejects.toThrow(ReservaValidationError)
      expect(hospedes_repo.items[0].ficha_status).toBe('pendente')
    })

    it.each([0, 3, -1])('rejeita posição inválida %i', async posicao => {
      await seed_reserva({ token: 'tk-1', adultos: 2 })

      await expect(
        salvar.execute({
          token: 'tk-1',
          posicao,
          dados: { nome_completo: 'X' },
        })
      ).rejects.toThrow(ReservaValidationError)
    })

    it('rejeita token inexistente, link desativado, status final e link expirado', async () => {
      await seed_reserva({ token: 'tk-off', ativo: false })
      await seed_reserva({ token: 'tk-cancelada', status: 'cancelada' })
      await seed_reserva({ token: 'tk-expirado', check_out: '2026-12-01' })
      const dados = { nome_completo: 'Marcos' }

      for (const token of ['tk-x', 'tk-off', 'tk-cancelada', 'tk-expirado']) {
        await expect(
          salvar.execute({ token, posicao: 1, dados })
        ).rejects.toThrow(FnrhLinkInvalidoError)
      }
      expect(hospedes_repo.items.every(h => h.nome_completo == null)).toBe(true)
    })

    it('isolamento: o token altera apenas hóspedes da sua própria reserva', async () => {
      const reserva_a = await seed_reserva({ hotel_id: HOTEL_A, token: 'tk-a' })
      const reserva_b = await seed_reserva({ hotel_id: HOTEL_B, token: 'tk-b' })

      await salvar.execute({
        token: 'tk-a',
        posicao: 1,
        dados: { nome_completo: 'Hóspede A' },
      })

      const de_b = await hospedes_repo.find_by_reserva_id(reserva_b.id)
      const de_a = await hospedes_repo.find_by_reserva_id(reserva_a.id)
      expect(de_a[0].nome_completo).toBe('Hóspede A')
      expect(de_b.every(h => h.nome_completo == null)).toBe(true)
    })
  })

  describe('EnviarFnrhUseCase', () => {
    it('registra o envio quando todas as fichas estão preenchidas', async () => {
      const reserva = await seed_reserva({ token: 'tk-1' })
      await salvar.execute({ token: 'tk-1', posicao: 1, dados: FICHA_COMPLETA })
      await salvar.execute({ token: 'tk-1', posicao: 2, dados: FICHA_COMPLETA })

      const result = await enviar.execute('tk-1')

      expect(result.fnrh_enviada_em).toBe('2026-12-02T12:00:00.000Z')
      const atual = await reservas_repo.find_by_id(reserva.id, HOTEL_A)
      expect(atual?.fnrh_enviada_em).toBeDefined()
    })

    it('rejeita envio com fichas pendentes listando as posições', async () => {
      const reserva = await seed_reserva({ token: 'tk-1' })
      await salvar.execute({ token: 'tk-1', posicao: 1, dados: FICHA_COMPLETA })

      await expect(enviar.execute('tk-1')).rejects.toThrow(/posições \(2\)/)
      const atual = await reservas_repo.find_by_id(reserva.id, HOTEL_A)
      expect(atual?.fnrh_enviada_em ?? null).toBeNull()
    })

    it('rejeita envio quando a ficha está apenas em rascunho', async () => {
      await seed_reserva({ token: 'tk-1', adultos: 1 })
      await salvar.execute({
        token: 'tk-1',
        posicao: 1,
        dados: { nome_completo: 'Marcos' },
      })

      await expect(enviar.execute('tk-1')).rejects.toThrow(
        ReservaValidationError
      )
    })

    it('rejeita token inexistente, link desativado, status final e link expirado', async () => {
      await seed_reserva({ token: 'tk-off', ativo: false })
      await seed_reserva({ token: 'tk-final', status: 'check_out' })
      await seed_reserva({ token: 'tk-expirado', check_out: '2026-12-01' })

      for (const token of ['tk-x', 'tk-off', 'tk-final', 'tk-expirado']) {
        await expect(enviar.execute(token)).rejects.toThrow(
          FnrhLinkInvalidoError
        )
      }
    })

    it('isolamento: enviar uma reserva não marca a reserva de outro hotel', async () => {
      const reserva_a = await seed_reserva({
        hotel_id: HOTEL_A,
        token: 'tk-a',
        adultos: 1,
      })
      const reserva_b = await seed_reserva({
        hotel_id: HOTEL_B,
        token: 'tk-b',
        adultos: 1,
      })
      await salvar.execute({ token: 'tk-a', posicao: 1, dados: FICHA_COMPLETA })

      await enviar.execute('tk-a')

      const a = await reservas_repo.find_by_id(reserva_a.id, HOTEL_A)
      const b = await reservas_repo.find_by_id(reserva_b.id, HOTEL_B)
      expect(a?.fnrh_enviada_em).toBeTruthy()
      expect(b?.fnrh_enviada_em ?? null).toBeNull()
    })
  })

  describe('GerenciarLinkFnrhUseCase', () => {
    it('regenera o link com novo token ativo e invalida o anterior', async () => {
      const reserva = await seed_reserva({ token: 'tk-antigo', ativo: false })

      const info = await link.regenerar(reserva.id, HOTEL_A)

      expect(info.ativo).toBe(true)
      expect(info.url_token).not.toBe('tk-antigo')
      expect(info.url_token.length).toBeGreaterThanOrEqual(32)
      await expect(buscar.execute('tk-antigo')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
      await expect(buscar.execute(info.url_token)).resolves.toBeDefined()
    })

    it('gera tokens diferentes a cada regeneração', async () => {
      const reserva = await seed_reserva()

      const primeiro = await link.regenerar(reserva.id, HOTEL_A)
      const segundo = await link.regenerar(reserva.id, HOTEL_A)

      expect(primeiro.url_token).not.toBe(segundo.url_token)
    })

    it.each([
      'check_out',
      'cancelada',
      'no_show',
    ] as ReservaStatus[])('rejeita regenerar link de reserva com status %s', async status => {
      const reserva = await seed_reserva({ status })

      await expect(link.regenerar(reserva.id, HOTEL_A)).rejects.toThrow(
        ReservaValidationError
      )
    })

    it('regenerar lança ReservaNotFoundError para reserva inexistente', async () => {
      await expect(link.regenerar('nao-existe', HOTEL_A)).rejects.toThrow(
        ReservaNotFoundError
      )
    })

    it('desativa o link e passa a recusar o token', async () => {
      const reserva = await seed_reserva({ token: 'tk-1' })

      const info = await link.desativar(reserva.id, HOTEL_A)

      expect(info).toEqual({ url_token: 'tk-1', ativo: false })
      await expect(buscar.execute('tk-1')).rejects.toThrow(
        FnrhLinkInvalidoError
      )
    })

    it('desativar é permitido mesmo em reserva com status final', async () => {
      const reserva = await seed_reserva({ status: 'cancelada' })

      const info = await link.desativar(reserva.id, HOTEL_A)

      expect(info.ativo).toBe(false)
    })

    it('desativar lança ReservaNotFoundError para reserva inexistente', async () => {
      await expect(link.desativar('nao-existe', HOTEL_A)).rejects.toThrow(
        ReservaNotFoundError
      )
    })

    it('isolamento: hotel B não regenera nem desativa link de reserva do hotel A', async () => {
      const reserva = await seed_reserva({ hotel_id: HOTEL_A, token: 'tk-a' })

      await expect(link.regenerar(reserva.id, HOTEL_B)).rejects.toThrow(
        ReservaNotFoundError
      )
      await expect(link.desativar(reserva.id, HOTEL_B)).rejects.toThrow(
        ReservaNotFoundError
      )
      const atual = await reservas_repo.find_by_id(reserva.id, HOTEL_A)
      expect(atual?.token_fnrh).toBe('tk-a')
      expect(atual?.token_fnrh_ativo).toBe(true)
    })
  })
})
