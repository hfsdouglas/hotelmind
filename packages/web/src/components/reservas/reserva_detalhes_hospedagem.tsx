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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Dados da Hospedagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block">Check-in</span>
              <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                {formatarDataBR(reserva.check_in)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Check-out</span>
              <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                {formatarDataBR(reserva.check_out)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Suíte</span>
              <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                {reserva.quarto?.identificacao || '-'} (
                {reserva.quarto?.categoria_nome || '-'})
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Regime</span>
              <span className="font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                <span
                  className="size-2 rounded-full shrink-0"
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
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs">
              <Handshake className="size-4 text-indigo-600" />
              <span className="text-zinc-500">
                Parceiro Comercial Vinculado:
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {reserva.parceiro_comercial.razao_social}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diárias Congeladas na Criação */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Tarifas Aplicadas por Diária
            </CardTitle>
            <span className="text-xs text-zinc-400">Valores congelados</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reserva.detalhamento_diarias?.map(diaria => (
              <div
                key={diaria.data}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatarDataBR(diaria.data)}
                  </span>
                  <span className="text-zinc-400 ml-2">
                    ({diaria.tarifario_nome})
                  </span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatarMoeda(diaria.valor_diaria)}
                </span>
              </div>
            ))}
            <div className="pt-3 flex items-center justify-between text-sm font-bold">
              <span>Valor Total da Reserva</span>
              <span className="text-indigo-700 dark:text-indigo-400 text-lg">
                {formatarMoeda(reserva.valor_total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
