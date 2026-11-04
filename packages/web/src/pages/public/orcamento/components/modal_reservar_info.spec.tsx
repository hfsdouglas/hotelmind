import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModalReservarInfo } from './modal_reservar_info'

describe('ModalReservarInfo Component', () => {
  it('renders modal with hotel information and whatsapp link', () => {
    const onOpenChange = vi.fn()

    render(
      <ModalReservarInfo
        open={true}
        onOpenChange={onOpenChange}
        hotelNome="Hotel Paraíso"
        hotelTelefone="11988887777"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Reserva Direta em Breve!' })).toBeInTheDocument()
    expect(screen.getByText('Hotel Paraíso')).toBeInTheDocument()
    const whatsappLink = screen.getByRole('link', { name: /falar no whatsapp/i })
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('11988887777'))
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ModalReservarInfo
        open={true}
        onOpenChange={onOpenChange}
        hotelNome="Hotel Paraíso"
      />,
    )

    const closeBtn = screen.getByRole('button', { name: 'Fechar' })
    await user.click(closeBtn)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
