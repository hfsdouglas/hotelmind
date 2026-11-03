import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider, ThemeContext } from './ThemeContext'
import { useContext } from 'react'

function ThemeConsumer() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return <div>no context</div>
  return (
    <div>
      <span data-testid="theme">{ctx.theme}</span>
      <button onClick={ctx.toggleTheme}>toggle</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})
afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('ThemeProvider', () => {
  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('toggles from light to dark', async () => {
    localStorage.setItem('theme', 'light')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    await act(async () => {
      screen.getByText('toggle').click()
    })
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles from dark to light', async () => {
    localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    await act(async () => {
      screen.getByText('toggle').click()
    })
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme to localStorage on toggle', async () => {
    localStorage.setItem('theme', 'light')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    await act(async () => {
      screen.getByText('toggle').click()
    })
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
