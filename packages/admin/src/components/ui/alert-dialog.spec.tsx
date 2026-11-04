import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'

describe('AlertDialog', () => {
  it('opens and closes alert dialog', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button">Remover Hotel</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={onAction}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    await user.click(screen.getByRole('button', { name: 'Remover Hotel' }))

    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
    expect(screen.getByText('Esta ação é irreversível.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
