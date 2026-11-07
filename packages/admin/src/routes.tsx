import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/pages/_layouts/app'
import { LoginLayout } from '@/pages/_layouts/login'
import { AdministradorEditarPage } from '@/pages/app/administradores/editar'
import { AdministradoresPage } from '@/pages/app/administradores/index'
import { AdministradorNovoPage } from '@/pages/app/administradores/novo'
import { DashboardPage } from '@/pages/app/dashboard'
import { HotelEditarPage } from '@/pages/app/hoteis/editar'
import { HoteisPage } from '@/pages/app/hoteis/index'
import { HotelNovoPage } from '@/pages/app/hoteis/novo'
import { HotelRotasPage } from '@/pages/app/hoteis/rotas'
import { RotaEditarPage } from '@/pages/app/rotas/editar'
import { RotasPage } from '@/pages/app/rotas/index'
import { RotaNovaPage } from '@/pages/app/rotas/nova'
import { SuportePage } from '@/pages/app/suporte/index'
import { LoginPage } from '@/pages/auth/login'

export const router = createBrowserRouter([
  {
    element: <LoginLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/hoteis', element: <HoteisPage /> },
      { path: '/hoteis/novo', element: <HotelNovoPage /> },
      { path: '/hoteis/:id/editar', element: <HotelEditarPage /> },
      { path: '/hoteis/:id/rotas', element: <HotelRotasPage /> },
      { path: '/rotas', element: <RotasPage /> },
      { path: '/rotas/nova', element: <RotaNovaPage /> },
      { path: '/rotas/:id/editar', element: <RotaEditarPage /> },
      { path: '/administradores', element: <AdministradoresPage /> },
      { path: '/administradores/novo', element: <AdministradorNovoPage /> },
      {
        path: '/administradores/:id/editar',
        element: <AdministradorEditarPage />,
      },
      { path: '/suporte', element: <SuportePage /> },
      { path: '/', element: <DashboardPage /> },
    ],
  },
])
