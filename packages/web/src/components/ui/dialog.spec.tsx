import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog'

describe('Dialog', () => {
  it('opens and displays dialog content', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Abrir Modal</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Modal</DialogTitle>
            <DialogDescription>Descrição do modal</DialogDescription>
          </DialogHeader>
          <p>Conteúdo interno do modal</p>
        </DialogContent>
      </Dialog>,
    )

    await user.click(screen.getByRole('button', { name: 'Abrir Modal' }))

    expect(screen.getByText('Título do Modal')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo interno do modal')).toBeInTheDocument()
  })
})
