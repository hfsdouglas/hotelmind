import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
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

describe('HotelConfiguracaoForm', { timeout: 15000 }, () => {
  it('renders standard CrudFormLayout with back button, card and external SaveButton', () => {
    render(
      <MemoryRouter>
        <HotelConfiguracaoForm
          initialData={MOCK_INITIAL_DATA}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      </MemoryRouter>
    )

    // Back button link to "/"
    const backLink = screen.getByRole('link')
    expect(backLink).toHaveAttribute('href', '/')

    // Layout Header
    expect(
      screen.getByRole('heading', { level: 1, name: /configurações do hotel/i })
    ).toBeInTheDocument()

    // 7 continuous sections inside the single card
    expect(screen.getByTestId('crud-form-card')).toBeInTheDocument()
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

    // Save button outside card in actions row
    const actionsRow = screen.getByTestId('crud-form-actions')
    expect(actionsRow).toBeInTheDocument()
    const saveBtn = screen.getByRole('button', { name: /^salvar$/i })
    expect(saveBtn).toBeInTheDocument()
    expect(actionsRow).toContainElement(saveBtn)

    // Descartar button must NOT exist
    expect(
      screen.queryByRole('button', { name: /descartar/i })
    ).not.toBeInTheDocument()
  })

  it('renders all 3 distinct corporate and commercial names', () => {
    render(
      <MemoryRouter>
        <HotelConfiguracaoForm
          initialData={MOCK_INITIAL_DATA}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/nome corporativo/i)).toHaveValue(
      'Hotel Central SA'
    )
    expect(screen.getByLabelText(/nome fantasia/i)).toHaveValue('Hotel Central')
    expect(screen.getByLabelText(/razão social/i)).toHaveValue(
      'Hotel Central LTDA'
    )
    expect(screen.getByLabelText(/cnpj/i)).toHaveValue('12345678000190')
  })

  it('opens theme preview modal when clicking "Visualizar Prévia do Tema"', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <HotelConfiguracaoForm
          initialData={MOCK_INITIAL_DATA}
          onSubmit={vi.fn()}
          isSubmitting={false}
        />
      </MemoryRouter>
    )

    const previewBtn = screen.getByRole('button', {
      name: /visualizar prévia do tema/i,
    })
    await user.click(previewBtn)

    expect(screen.getByText('Prévia da Identidade Visual')).toBeInTheDocument()
    expect(screen.getByText('Hotel Central')).toBeInTheDocument()
  })
})
