import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  it('renders avatar fallback text', () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="Admin" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('AD')).toBeInTheDocument()
  })
})
