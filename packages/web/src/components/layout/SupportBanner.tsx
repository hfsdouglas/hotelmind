import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/hooks/useLogout'

export function SupportBanner() {
  const { session } = useAuth()
  const { logout } = useLogout()

  if (!session?.suporte) return null

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-sm font-medium text-black"
    >
      <span>
        Modo suporte — administrador {session.suporte.administrador_nome} acessando
        como {session.user.nome_completo}
      </span>
      <button
        type="button"
        onClick={logout}
        className="rounded-md border border-black/20 px-2 py-1 text-xs font-semibold hover:bg-black/10"
      >
        Encerrar
      </button>
    </div>
  )
}
