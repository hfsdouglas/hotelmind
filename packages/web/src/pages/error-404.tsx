import { Link } from 'react-router-dom'

export function Error404Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-3 text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-lg font-medium">Página não encontrada</p>
        <p className="text-sm text-muted-foreground">
          A página que você procura não existe.
        </p>
        <Link
          to="/"
          className="inline-block text-sm underline underline-offset-4 hover:text-muted-foreground"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
