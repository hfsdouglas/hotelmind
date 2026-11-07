import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { AbaCriancasHospedes } from './aba_criancas_hospedes'

function Wrapper() {
  const methods = useForm<HotelConfiguracaoFormData>({
    defaultValues: {
      free_child_age_limit: 5,
      free_child_max_per_room: 1,
    },
  })

  return (
    <FormProvider {...methods}>
      <AbaCriancasHospedes />
    </FormProvider>
  )
}

describe('AbaCriancasHospedes', () => {
  it('renders child free policy inputs correctly', () => {
    render(<Wrapper />)

    expect(
      screen.getByLabelText(/idade máxima para gratuidade/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/quantidade máxima de crianças gratuitas/i)
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })
})
