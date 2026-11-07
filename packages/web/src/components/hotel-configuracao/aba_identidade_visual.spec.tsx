import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { AbaIdentidadeVisual } from './aba_identidade_visual'

function Wrapper() {
  const methods = useForm<HotelConfiguracaoFormData>({
    defaultValues: {
      hotel_name: 'Hotel Boa Viagem',
      legal_name: 'Boa Viagem Hotelaria LTDA',
      tax_id: '12.345.678/0001-90',
      category: 'HOTEL',
      star_rating: 4,
      short_description: 'O melhor hotel da cidade',
      full_description: 'Descrição institucional completa...',
      logo_primary: null,
      logo_dark: null,
      favicon: null,
      color_primary: '#1e40af',
      color_secondary: '#64748b',
      color_background: '#ffffff',
      color_surface: '#f8fafc',
      color_text_primary: '#0f172a',
      color_text_secondary: '#475569',
      color_accent: '#f59e0b',
    },
  })

  return (
    <FormProvider {...methods}>
      <AbaIdentidadeVisual />
    </FormProvider>
  )
}

describe('AbaIdentidadeVisual', () => {
  it('renders institutional data fields and character counter', () => {
    render(<Wrapper />)

    expect(screen.getByLabelText(/nome fantasia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/tipo de estabelecimento/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/classificação/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição resumida/i)).toBeInTheDocument()
    expect(screen.getByText(/160/)).toBeInTheDocument()
  })

  it('renders color pickers for design tokens', () => {
    render(<Wrapper />)

    expect(screen.getByText(/cor primária/i)).toBeInTheDocument()
    expect(screen.getByText(/cor secundária/i)).toBeInTheDocument()
    expect(screen.getByText(/cor de fundo/i)).toBeInTheDocument()
    expect(screen.getByText(/cor de cartões/i)).toBeInTheDocument()
    expect(screen.getByText(/texto principal/i)).toBeInTheDocument()
    expect(screen.getByText(/texto secundário/i)).toBeInTheDocument()
    expect(screen.getByText(/cor de destaque/i)).toBeInTheDocument()
  })

  it('renders live preview card alongside form fields', () => {
    render(<Wrapper />)

    expect(screen.getByText(/demonstração visual/i)).toBeInTheDocument()
    expect(screen.getByText('Hotel Boa Viagem')).toBeInTheDocument()
  })
})
