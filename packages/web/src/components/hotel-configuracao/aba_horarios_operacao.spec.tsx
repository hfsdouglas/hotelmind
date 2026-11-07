import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { AbaHorariosOperacao } from './aba_horarios_operacao'

function Wrapper({ reception24h = true }: { reception24h?: boolean }) {
  const methods = useForm<HotelConfiguracaoFormData>({
    defaultValues: {
      checkin_time: '14:00',
      checkout_time: '12:00',
      reception_24h: reception24h,
      reception_opening_time: '08:00',
      reception_closing_time: '22:00',
    },
  })

  return (
    <FormProvider {...methods}>
      <AbaHorariosOperacao />
    </FormProvider>
  )
}

describe('AbaHorariosOperacao', () => {
  it('renders standard check-in and check-out fields', () => {
    render(<Wrapper />)

    expect(screen.getByLabelText(/início do check-in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/limite de check-out/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12:00')).toBeInTheDocument()
  })

  it('hides reception opening and closing times when reception_24h is true', () => {
    render(<Wrapper reception24h={true} />)

    expect(
      screen.queryByLabelText(/horário de abertura da recepção/i)
    ).not.toBeInTheDocument()
  })

  it('shows reception opening and closing times when reception_24h is false', () => {
    render(<Wrapper reception24h={false} />)

    expect(
      screen.getByLabelText(/horário de abertura da recepção/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/horário de fechamento da recepção/i)
    ).toBeInTheDocument()
  })
})
