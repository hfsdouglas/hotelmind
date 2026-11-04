import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('Web App', () => {
  it('renders application with root providers', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })
})
