import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

describe('Tooltip', () => {
  it('renders trigger element and content', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Passe o mouse</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dica de ajuda</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByRole('button', { name: 'Passe o mouse' })
    expect(trigger).toBeInTheDocument()

    await user.hover(trigger)
    expect(screen.getByText('Dica de ajuda')).toBeInTheDocument()
  })
})
