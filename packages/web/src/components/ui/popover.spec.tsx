import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover', () => {
  it('opens and shows content on click', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Abrir Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Conteúdo do popover</p>
        </PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: 'Abrir Popover' }))
    expect(screen.getByText('Conteúdo do popover')).toBeInTheDocument()
  })
})
