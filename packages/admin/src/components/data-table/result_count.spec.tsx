import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultCount } from './result_count'

describe('ResultCount', () => {
  it('renders "1 resultado encontrado" for total = 1', () => {
    render(<ResultCount total={1} />)
    expect(screen.getByText('1 resultado encontrado')).toBeInTheDocument()
  })

  it('renders plural form for total > 1', () => {
    render(<ResultCount total={42} />)
    expect(screen.getByText('42 resultados encontrados')).toBeInTheDocument()
  })

  it('renders "0 resultados encontrados" for total = 0', () => {
    render(<ResultCount total={0} />)
    expect(screen.getByText('0 resultados encontrados')).toBeInTheDocument()
  })
})
