import { Checkbox } from '@hotelmind/ui'
import { ShieldAlert } from 'lucide-react'
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

interface SecaoRegrasCasaProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoRegrasCasa({ form }: SecaoRegrasCasaProps) {
  const aceitaPets = form.watch('aceita_pets')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <ShieldAlert className="h-5 w-5" />
        <h3>6. Regras da Casa & Pets</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Políticas de convivência, permissão de animais domésticos e regras de
        fumo.
      </p>

      {/* Seção Pets */}
      <div className="space-y-4 rounded-md border p-4 bg-muted/10">
        <FormField
          control={form.control}
          name="aceita_pets"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={checked => field.onChange(!!checked)}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="cursor-pointer">
                  Estabelecimento Pet Friendly (Aceita animais)
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Permite que hóspedes tragam animais de estimação na
                  acomodação.
                </p>
              </div>
            </FormItem>
          )}
        />

        {aceitaPets && (
          <div className="pt-2 max-w-sm">
            <FormField
              control={form.control}
              name="peso_maximo_pet_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso Máximo Permitido (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min={0}
                      max={100}
                      placeholder="Ex: 10"
                      value={field.value ?? ''}
                      onChange={e =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco se não houver restrição de peso.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Seção Fumo */}
      <div className="space-y-4 rounded-md border p-4 bg-muted/10">
        <FormField
          control={form.control}
          name="permite_fumar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={checked => field.onChange(!!checked)}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="cursor-pointer">
                  Permitido fumar nos quartos ou áreas internas
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Desmarque caso o hotel seja 100% livre de fumo em áreas
                  fechadas.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="pt-2 max-w-sm">
          <FormField
            control={form.control}
            name="taxa_higienizacao_fumo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Taxa Sanitária / Desodorização por Infração (R$)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Ex: 350.00"
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Cobrada caso a proibição de fumo seja desrespeitada na
                  acomodação.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
