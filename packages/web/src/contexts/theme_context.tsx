import { createContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme?: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_STORAGE_KEY = 'roomio-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) ||
        localStorage.getItem('theme')) as Theme | null
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
