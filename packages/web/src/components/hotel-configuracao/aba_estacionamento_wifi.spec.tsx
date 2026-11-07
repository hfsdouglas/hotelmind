import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { AbaEstacionamentoWifi } from './aba_estacionamento_wifi'

function Wrapper({
  parkingType = 'PAGO_LOCAL',
}: {
  parkingType?: 'GRATUITO' | 'PAGO_LOCAL' | 'CONVENIADO' | 'NAO_POSSUI'
}) {
  const methods = useForm<HotelConfiguracaoFormData>({
    defaultValues: {
      parking_type: parkingType,
      parking_fee_per_day: 35,
      parking_reservation_required: true,
      parking_covered: 'COBERTO',
      wifi_available: true,
      wifi_type: 'GRATUITO_TOTAL',
      wifi_ssid_default: 'Hotel_Rede',
      wifi_password_default: 'senha123',
      wifi_show_on_voucher: true,
    },
  })

  return (
    <FormProvider {...methods}>
      <AbaEstacionamentoWifi />
    </FormProvider>
  )
}

describe('AbaEstacionamentoWifi', () => {
  it('renders parking settings and conditional fee field when paid', () => {
    render(<Wrapper parkingType="PAGO_LOCAL" />)

    expect(screen.getByLabelText(/tipo de estacionamento/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/valor cobrado por diária/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/requer reserva antecipada/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de cobertura/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('35')).toBeInTheDocument()
  })

  it('hides parking fee when parking type is GRATUITO', () => {
    render(<Wrapper parkingType="GRATUITO" />)

    expect(
      screen.queryByLabelText(/valor cobrado por diária/i)
    ).not.toBeInTheDocument()
  })

  it('renders Wi-Fi credentials with password visibility toggle', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    expect(
      screen.getByLabelText(/disponibilidade de wi-fi/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/nome da rede \(ssid\)/i)).toBeInTheDocument()

    const passwordInput = screen.getByLabelText(/senha da rede wi-fi/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', {
      name: /mostrar senha|ocultar senha/i,
    })
    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
