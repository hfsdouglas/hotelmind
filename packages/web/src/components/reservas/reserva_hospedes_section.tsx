import type { ReservaHospede } from '@hotelmind/contracts'
import { Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Hóspedes da Reserva ({totalHospedes})
            </CardTitle>
            <CardDescription>
              {fichasPreenchidas} de {totalHospedes} ficha(s) preenchida(s)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hospedes?.map(h => (
            <div
              key={h.id}
              className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {h.posicao === 1 ? 'Titular' : `Hóspede ${h.posicao}`}
                  </Badge>
                  <span className="font-semibold text-sm truncate max-w-[150px]">
                    {h.nome_completo || 'Dados não informados'}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    h.ficha_status === 'preenchida'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : h.ficha_status === 'rascunho'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {h.ficha_status === 'preenchida'
                    ? 'Preenchida'
                    : h.ficha_status === 'rascunho'
                      ? 'Rascunho'
                      : 'Pendente'}
                </Badge>
              </div>

              <div className="text-xs text-zinc-500 space-y-0.5">
                {h.numero_documento && (
                  <p>
                    Doc: {h.tipo_documento?.toUpperCase()} {h.numero_documento}
                  </p>
                )}
                {h.telefone && <p>Tel: {h.telefone}</p>}
                {h.cidade && h.estado && (
                  <p>
                    Origem: {h.cidade}/{h.estado}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-400">
                  {h.preenchido_por
                    ? `Preenchido via ${h.preenchido_por}`
                    : 'Aguardando preenchimento'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
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
