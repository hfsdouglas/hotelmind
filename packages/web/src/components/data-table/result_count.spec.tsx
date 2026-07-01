import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultCount } from './result_count'

describe('ResultCount', () => {
  it('displays singular text when total is 1', () => {
    render(<ResultCount total={1} />)
    expect(screen.getByText('1 resultado encontrado')).toBeInTheDocument()
  })

  it('displays plural text when total is 0', () => {
    render(<ResultCount total={0} />)
    expect(screen.getByText('0 resultados encontrados')).toBeInTheDocument()
  })

  it('displays plural text when total is greater than 1', () => {
    render(<ResultCount total={42} />)
    expect(screen.getByText('42 resultados encontrados')).toBeInTheDocument()
  })
})
