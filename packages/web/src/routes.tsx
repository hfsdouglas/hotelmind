import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/pages/_layouts/app'
import { LoginLayout } from '@/pages/_layouts/login'
import { CategoriasQuartosPage } from '@/pages/app/categorias_quartos'
import { EditarCategoriaQuartoPage } from '@/pages/app/categorias_quartos/[id]/editar'
import { NovaCategoriaQuartoPage } from '@/pages/app/categorias_quartos/novo'
import { DashboardPage } from '@/pages/app/dashboard'
import { EditarGrupoPage } from '@/pages/app/grupos/[id]/editar'
import { GruposPage } from '@/pages/app/grupos/index'
import { NovoGrupoPage } from '@/pages/app/grupos/novo'
import { QuartosPage } from '@/pages/app/quartos'
import { EditarQuartoPage } from '@/pages/app/quartos/[id]/editar'
import { NovoQuartoPage } from '@/pages/app/quartos/novo'
import { RegimesAlimentacaoPage } from '@/pages/app/regimes_alimentacao'
import { EditarRegimeAlimentacaoPage } from '@/pages/app/regimes_alimentacao/[id]/editar'
import { NovoRegimeAlimentacaoPage } from '@/pages/app/regimes_alimentacao/novo'
import { Calendario } from '@/pages/app/reservas/calendario'
import { TarifariosPage } from '@/pages/app/tarifarios'
import { EditarTarifarioPage } from '@/pages/app/tarifarios/[id]/editar'
import { NovoTarifarioPage } from '@/pages/app/tarifarios/novo'
import { EditarUsuarioPage } from '@/pages/app/usuarios/[id]/editar'
import { UsuariosPage } from '@/pages/app/usuarios/index'
import { NovoUsuarioPage } from '@/pages/app/usuarios/novo'
import { LoginPage } from '@/pages/auth/login'
import { Error404Page } from '@/pages/error-404'

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
      {
        path: '/categorias_quartos/novo',
        element: <NovaCategoriaQuartoPage />,
      },
      {
        path: '/categorias_quartos/:id/editar',
        element: <EditarCategoriaQuartoPage />,
      },
      { path: '/quartos', element: <QuartosPage /> },
      { path: '/quartos/novo', element: <NovoQuartoPage /> },
      { path: '/quartos/:id/editar', element: <EditarQuartoPage /> },
      { path: '/tarifarios', element: <TarifariosPage /> },
      { path: '/tarifarios/novo', element: <NovoTarifarioPage /> },
      { path: '/tarifarios/:id/editar', element: <EditarTarifarioPage /> },
      { path: '/regimes_alimentacao', element: <RegimesAlimentacaoPage /> },
      {
        path: '/regimes_alimentacao/novo',
        element: <NovoRegimeAlimentacaoPage />,
      },
      {
        path: '/regimes_alimentacao/:id/editar',
        element: <EditarRegimeAlimentacaoPage />,
      },
      {
        path: '/tarifarios/regimes_alimentacao',
        element: <RegimesAlimentacaoPage />,
      },
      {
        path: '/tarifarios/regimes_alimentacao/novo',
        element: <NovoRegimeAlimentacaoPage />,
      },
      {
        path: '/tarifarios/regimes_alimentacao/:id/editar',
        element: <EditarRegimeAlimentacaoPage />,
      },
      { path: '/reservas', element: <Calendario /> },
      { path: '/reservas/calendario', element: <Calendario /> },
      { path: '/reservas/novo', element: <Calendario /> },
    ],
  },
  { path: '*', element: <Error404Page /> },
])
