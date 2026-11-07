import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HotelConfiguracaoForm } from './hotel_configuracao_form'

const MOCK_INITIAL_DATA: HotelConfiguracaoDTO = {
  id: 'hotel-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  nome_hotel: 'Hotel Central SA',
  nome_fantasia: 'Hotel Central',
  razao_social: 'Hotel Central LTDA',
  cnpj: '12345678000190',
  email_comercial: 'contato@hotelcentral.com.br',
  telefone_comercial: '1133334444',
  celular: '11988887777',
  website: 'https://hotelcentral.com.br',
  categoria: 'HOTEL',
  classificacao_estrelas: 3,
  descricao_curta: 'Central e aconchegante',
  descricao_completa: 'Descrição completa',
  limite_idade_crianca_gratis: 5,
  quantidade_max_criancas_gratis: 1,
  horario_checkin: '14:00',
  horario_checkout: '12:00',
  recepcao_24h: true,
  horario_abertura_recepcao: null,
  horario_fechamento_recepcao: null,
  aceita_pets: false,
  peso_maximo_pet_kg: null,
  permite_fumar: false,
  taxa_higienizacao_fumo: 200,
  tipo_estacionamento: 'NAO_POSSUI',
  valor_diaria_estacionamento: null,
  estacionamento_reserva_previa: false,
  cobertura_estacionamento: 'DESCOBERTO',
  possui_wifi: true,
  tipo_wifi: 'GRATUITO_TOTAL',
  nome_rede_wifi: 'WiFi_Hotel',
  senha_rede_wifi: 'senha123',
  exibir_wifi_voucher: true,
  tema: {
    id: 'tema-1',
    hotel_id: 'hotel-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    logo_principal: null,
    logo_escuro: null,
    favicon: null,
    cor_primaria: '#1e40af',
    cor_secundaria: '#64748b',
    cor_fundo: '#ffffff',
    cor_superficie: '#f8fafc',
    cor_texto_principal: '#0f172a',
    cor_texto_secundario: '#475569',
    cor_destaque: '#f59e0b',
  },
}

describe('HotelConfiguracaoForm', () => {
  it('renders all 7 continuous sections and action buttons in card footer', () => {
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    expect(
      screen.getByText(/1\. Dados Cadastrais & Contato/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/2\. Apresentação & Slogan/i)).toBeInTheDocument()
    expect(
      screen.getByText(/3\. Identidade Visual & Cores/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/4\. Políticas de Crianças & Hóspedes/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/5\. Horários Operacionais/i)).toBeInTheDocument()
    expect(screen.getByText(/6\. Regras da Casa & Pets/i)).toBeInTheDocument()
    expect(
      screen.getByText(/7\. Estacionamento & Conectividade/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /visualizar prévia do tema/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /descartar alterações/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /salvar alterações/i })
    ).toBeInTheDocument()
  })

  it('opens theme preview modal when clicking "Visualizar Prévia do Tema"', async () => {
    const user = userEvent.setup()
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    const previewBtn = screen.getByRole('button', {
      name: /visualizar prévia do tema/i,
    })
    await user.click(previewBtn)

    expect(screen.getByText('Prévia da Identidade Visual')).toBeInTheDocument()
    expect(screen.getByText('Hotel Central')).toBeInTheDocument()
  })

  it('discards modifications when clicking "Descartar alterações"', async () => {
    const user = userEvent.setup()
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    const nameInput = screen.getByLabelText(/nome fantasia/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Nome Temporário Alterado')
    expect(nameInput).toHaveValue('Nome Temporário Alterado')

    const discardBtn = screen.getByRole('button', {
      name: /descartar alterações/i,
    })
    await user.click(discardBtn)

    expect(nameInput).toHaveValue('Hotel Central')
  })
})
