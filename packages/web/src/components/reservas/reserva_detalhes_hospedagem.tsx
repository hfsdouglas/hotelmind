import type { Reserva } from '@hotelmind/contracts'
import { Handshake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatarDataBR(dataIso: string | null | undefined) {
  if (!dataIso) return '-'
  const dateOnly = dataIso.split('T')[0]
  const [ano, mes, dia] = dateOnly.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

interface ReservaDetalhesHospedagemProps {
  reserva: Reserva
}

export function ReservaDetalhesHospedagem({
  reserva,
}: ReservaDetalhesHospedagemProps) {
  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3.5">
          <CardTitle className="text-base font-semibold text-foreground">
            Dados da Hospedagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Check-in
              </span>
              <span className="font-semibold text-sm text-foreground">
                {formatarDataBR(reserva.check_in)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Check-out
              </span>
              <span className="font-semibold text-sm text-foreground">
                {formatarDataBR(reserva.check_out)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Suíte
              </span>
              <span className="font-semibold text-sm text-foreground">
                {reserva.quarto?.identificacao || '-'} (
                {reserva.quarto?.categoria_nome || '-'})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Regime
              </span>
              <span className="font-semibold text-sm flex items-center gap-1.5 mt-0.5 text-foreground">
                <span
                  className="size-2 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                  style={{
                    backgroundColor:
                      reserva.regime_alimentacao?.cor_pulseira || '#999',
                  }}
                />
                {reserva.regime_alimentacao?.titulo}
              </span>
            </div>
          </div>

          {reserva.parceiro_comercial && (
            <div className="mt-4 pt-3.5 border-t border-border flex items-center gap-2 text-xs">
              <Handshake className="size-4 text-primary" />
              <span className="text-muted-foreground">
                Parceiro Comercial Vinculado:
              </span>
              <span className="font-semibold text-foreground">
                {reserva.parceiro_comercial.razao_social}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diárias Congeladas na Criação */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Tarifas Aplicadas por Diária
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Valores congelados
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {reserva.detalhamento_diarias?.map(diaria => (
              <div
                key={diaria.data}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium text-foreground">
                    Diária {formatarDataBR(diaria.data)}
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    {diaria.tarifario_nome}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatarMoeda(diaria.valor_diaria)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Valor Total da Hospedagem:
            </span>
            <span className="text-lg font-bold text-primary">
              {formatarMoeda(reserva.valor_total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
