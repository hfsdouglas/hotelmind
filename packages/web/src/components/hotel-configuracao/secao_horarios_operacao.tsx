import { Checkbox } from '@hotelmind/ui'
import { Clock } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

interface SecaoHorariosOperacaoProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoHorariosOperacao({ form }: SecaoHorariosOperacaoProps) {
  const recepcao24h = form.watch('recepcao_24h')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <Clock className="h-5 w-5" />
        <h3>5. Horários Operacionais</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Parâmetros de check-in, check-out e atendimento da recepção do
        estabelecimento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="horario_checkin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Início do Check-in *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horario_checkout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Limite do Check-out *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="pt-2">
        <FormField
          control={form.control}
          name="recepcao_24h"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={checked => field.onChange(!!checked)}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="cursor-pointer">
                  Funcionamento 24 horas
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  A recepção possui atendimento presencial ininterrupto durante
                  todos os dias.
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>

      {!recepcao24h && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-warning/30 rounded-md bg-warning/10">
          <FormField
            control={form.control}
            name="horario_abertura_recepcao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Abertura da Recepção *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario_fechamento_recepcao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Fechamento da Recepção *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
