import { usePageTitle } from '@/hooks/use_document_title'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  usePageTitle('Dashboard')
  const { session } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Bem-vindo, {session?.admin.nome_completo}.
      </p>
    </div>
  )
}
