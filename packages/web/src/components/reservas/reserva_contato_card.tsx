import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mask_phone } from '@/hooks/use_phone_mask'

interface ReservaContatoCardProps {
  titularNome: string
  titularTelefone?: string | null
  titularEmail?: string | null
  observacoes?: string | null
}

export function ReservaContatoCard({
  titularNome,
  titularTelefone,
  titularEmail,
  observacoes,
}: ReservaContatoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Contato do Titular
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <span className="text-zinc-400 block">Nome</span>
          <span className="font-semibold text-sm">{titularNome}</span>
        </div>
        {titularTelefone && (
          <div>
            <span className="text-zinc-400 block">Telefone</span>
            <span>{mask_phone(titularTelefone)}</span>
          </div>
        )}
        {titularEmail && (
          <div>
            <span className="text-zinc-400 block">E-mail</span>
            <span>{titularEmail}</span>
          </div>
        )}
        {observacoes && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-400 block">Observações</span>
            <p className="text-zinc-600 mt-1">{observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
