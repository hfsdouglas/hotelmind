import type { ReservaHospede } from '@hotelmind/contracts'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@hotelmind/ui'
import { Edit2 } from 'lucide-react'

interface ReservaHospedesSectionProps {
  totalHospedes: number
  fichasPreenchidas: number
  hospedes?: ReservaHospede[]
  onEditarFicha: (hospede: ReservaHospede) => void
}

export function ReservaHospedesSection({
  totalHospedes,
  fichasPreenchidas,
  hospedes,
  onEditarFicha,
}: ReservaHospedesSectionProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Hóspedes da Reserva ({totalHospedes})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {fichasPreenchidas} de {totalHospedes} ficha(s) preenchida(s)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {hospedes?.map(h => (
            <div
              key={h.id}
              className="p-4 rounded-lg border border-border bg-background/50 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {h.posicao === 1 ? 'Titular' : `Hóspede ${h.posicao}`}
                    </Badge>
                    {h.nome_completo ? (
                      <span className="font-semibold text-sm truncate text-foreground">
                        {h.nome_completo}
                      </span>
                    ) : null}
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      h.ficha_status === 'preenchida'
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-800'
                        : h.ficha_status === 'rascunho'
                          ? 'bg-sky-500/10 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-800'
                          : 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-800'
                    }`}
                  >
                    {h.ficha_status === 'preenchida'
                      ? 'Preenchida'
                      : h.ficha_status === 'rascunho'
                        ? 'Rascunho'
                        : 'Pendente'}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 min-h-[36px]">
                  {h.numero_documento && (
                    <p>
                      Doc: {h.tipo_documento?.toUpperCase()}{' '}
                      {h.numero_documento}
                    </p>
                  )}
                  {h.telefone && <p>Tel: {h.telefone}</p>}
                  {h.cidade && h.estado && (
                    <p>
                      Origem: {h.cidade}/{h.estado}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2.5 flex items-center justify-between border-t border-border">
                <span className="text-[11px] text-muted-foreground">
                  {h.preenchido_por
                    ? `Preenchido via ${h.preenchido_por}`
                    : 'Aguardando preenchimento'}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => onEditarFicha(h)}
                >
                  <Edit2 className="size-3" />
                  Editar Ficha
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
