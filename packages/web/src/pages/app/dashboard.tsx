import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { session } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Bem-vindo, {session?.user.nome_completo}. Sistema em construção.
      </p>
    </div>
  )
}
