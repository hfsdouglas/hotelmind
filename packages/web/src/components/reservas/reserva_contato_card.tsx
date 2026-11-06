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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Contato do Titular
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Nome</span>
          <span className="font-semibold text-sm text-foreground">
            {titularNome}
          </span>
        </div>
        {titularTelefone && (
          <div>
            <span className="text-muted-foreground block text-[11px]">
              Telefone
            </span>
            <span className="text-foreground">
              {mask_phone(titularTelefone)}
            </span>
          </div>
        )}
        {titularEmail && (
          <div>
            <span className="text-muted-foreground block text-[11px]">
              E-mail
            </span>
            <span className="text-foreground">{titularEmail}</span>
          </div>
        )}
        {observacoes && (
          <div className="pt-2.5 border-t border-border">
            <span className="text-muted-foreground block text-[11px]">
              Observações
            </span>
            <p className="text-foreground/90 mt-1 whitespace-pre-wrap">
              {observacoes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
