import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { AbaRegrasCasa } from './aba_regras_casa'

function Wrapper({ petFriendly = true }: { petFriendly?: boolean }) {
  const methods = useForm<HotelConfiguracaoFormData>({
    defaultValues: {
      pet_friendly: petFriendly,
      pet_max_weight_kg: 15,
      smoking_allowed: false,
      smoking_sanitization_fee: 250,
    },
  })

  return (
    <FormProvider {...methods}>
      <AbaRegrasCasa />
    </FormProvider>
  )
}

describe('AbaRegrasCasa', () => {
  it('renders pet friendly toggle and conditional weight limit field', () => {
    render(<Wrapper petFriendly={true} />)

    expect(
      screen.getByLabelText(/aceita animais de estimação/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/peso máximo permitido/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('15')).toBeInTheDocument()
  })

  it('hides weight limit field when pet_friendly is false', () => {
    render(<Wrapper petFriendly={false} />)

    expect(
      screen.queryByLabelText(/peso máximo permitido/i)
    ).not.toBeInTheDocument()
  })

  it('renders smoking policy toggle and sanitization fee field', () => {
    render(<Wrapper />)

    expect(
      screen.getByLabelText(/permitir fumar em quartos/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/taxa de higienização\/desodorização/i)
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('250')).toBeInTheDocument()
  })
})
