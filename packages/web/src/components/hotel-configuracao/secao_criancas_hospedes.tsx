import { Baby } from 'lucide-react'
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

interface SecaoCriancasHospedesProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoCriancasHospedes({ form }: SecaoCriancasHospedesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <Baby className="h-5 w-5" />
        <h3>4. Políticas de Crianças & Hóspedes</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Defina os parâmetros de gratuidade infantil aplicados no cálculo de
        reservas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="limite_idade_crianca_gratis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idade Limite para Gratuidade (anos) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={17}
                  placeholder="Ex: 5"
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Crianças até esta idade (inclusive) não pagam diária adicional.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantidade_max_criancas_gratis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Quantidade Máxima de Crianças Gratuitas por Quarto *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  placeholder="Ex: 1"
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Limite de gratuidades permitidas por acomodação na mesma
                reserva.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
