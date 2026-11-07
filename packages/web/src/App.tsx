import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useTheme } from '@/hooks/useTheme'
import { router } from '@/routes'

const queryClient = new QueryClient()

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster position="bottom-right" richColors theme={theme} />
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <AppToaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
