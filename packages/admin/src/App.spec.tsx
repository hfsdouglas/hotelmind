import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('Admin App', () => {
  it('renders application with root providers', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })
})
