import { createBrowserRouter } from 'react-router-dom'
import { LoginLayout } from '@/pages/_layouts/login'
import { AppLayout } from '@/pages/_layouts/app'
import { LoginPage } from '@/pages/auth/login'
import { DashboardPage } from '@/pages/app/dashboard'
import { GruposPage } from '@/pages/app/grupos/index'
import { NovoGrupoPage } from '@/pages/app/grupos/novo'
import { EditarGrupoPage } from '@/pages/app/grupos/[id]/editar'
import { UsuariosPage } from '@/pages/app/usuarios/index'
import { NovoUsuarioPage } from '@/pages/app/usuarios/novo'
import { EditarUsuarioPage } from '@/pages/app/usuarios/[id]/editar'
import { Error404Page } from '@/pages/error-404'
import { CategoriasQuartosPage } from '@/pages/app/categorias_quartos'
import { NovaCategoriaQuartoPage } from '@/pages/app/categorias_quartos/novo'
import { EditarCategoriaQuartoPage } from '@/pages/app/categorias_quartos/[id]/editar'
import { QuartosPage } from '@/pages/app/quartos'
import { NovoQuartoPage } from '@/pages/app/quartos/novo'
import { EditarQuartoPage } from '@/pages/app/quartos/[id]/editar'

export const router = createBrowserRouter([
  {
    element: <LoginLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/grupos', element: <GruposPage /> },
      { path: '/grupos/novo', element: <NovoGrupoPage /> },
      { path: '/grupos/:id/editar', element: <EditarGrupoPage /> },
      { path: '/usuarios', element: <UsuariosPage /> },
      { path: '/usuarios/novo', element: <NovoUsuarioPage /> },
      { path: '/usuarios/:id/editar', element: <EditarUsuarioPage /> },
      { path: '/categorias_quartos', element: <CategoriasQuartosPage /> },
      { path: '/categorias_quartos/novo', element: <NovaCategoriaQuartoPage /> },
      { path: '/categorias_quartos/:id/editar', element: <EditarCategoriaQuartoPage /> },
      { path: '/quartos', element: <QuartosPage /> },
      { path: '/quartos/novo', element: <NovoQuartoPage /> },
      { path: '/quartos/:id/editar', element: <EditarQuartoPage /> },
    ],
  },
  { path: '*', element: <Error404Page /> },
])
