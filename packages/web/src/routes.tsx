import { createBrowserRouter } from 'react-router-dom'
import { LoginLayout } from '@/pages/_layouts/login'
import { AppLayout } from '@/pages/_layouts/app'
import { LoginPage } from '@/pages/auth/login'
import { DashboardPage } from '@/pages/app/dashboard'
import { Error404Page } from '@/pages/error-404'

export const router = createBrowserRouter([
  {
    element: <LoginLayout />,
    children: [{ path: '/', element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [{ path: '/dashboard', element: <DashboardPage /> }],
  },
  { path: '*', element: <Error404Page /> },
])
