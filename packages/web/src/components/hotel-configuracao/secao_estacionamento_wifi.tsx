import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { Car, Eye, EyeOff, Wifi } from 'lucide-react'
import { useState } from 'react'
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

interface SecaoEstacionamentoWifiProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoEstacionamentoWifi({
  form,
}: SecaoEstacionamentoWifiProps) {
  const [mostrarSenhaWifi, setMostrarSenhaWifi] = useState(false)

  const tipoEstacionamento = form.watch('tipo_estacionamento')
  const possuiWifi = form.watch('possui_wifi')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <Car className="h-5 w-5" />
        <h3>7. Estacionamento & Conectividade</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Comodidades de mobilidade e conectividade exibidas em confirmações de
        reserva e vouchers.
      </p>

      {/* Subseção Estacionamento */}
      <div className="space-y-4 rounded-md border p-4 bg-muted/10">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Car className="h-4 w-4" />
          Estacionamento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tipo_estacionamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Estacionamento *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger aria-label="Tipo de Estacionamento">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GRATUITO">
                      Gratuito para hóspedes
                    </SelectItem>
                    <SelectItem value="PAGO_LOCAL">Pago no local</SelectItem>
                    <SelectItem value="CONVENIADO">
                      Conveniado / Terceirizado
                    </SelectItem>
                    <SelectItem value="NAO_POSSUI">
                      Não possui estacionamento
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoEstacionamento === 'PAGO_LOCAL' && (
            <FormField
              control={form.control}
              name="valor_diaria_estacionamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Diária (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Ex: 35.00"
                      value={field.value ?? ''}
                      onChange={e =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {tipoEstacionamento !== 'NAO_POSSUI' && (
            <FormField
              control={form.control}
              name="cobertura_estacionamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cobertura das Vagas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Cobertura das Vagas">
                        <SelectValue placeholder="Selecione a cobertura" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COBERTO">Vagas Cobertas</SelectItem>
                      <SelectItem value="DESCOBERTO">
                        Vagas Descobertas
                      </SelectItem>
                      <SelectItem value="MISTO">
                        Misto (Coberto e Descoberto)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {tipoEstacionamento !== 'NAO_POSSUI' && (
          <FormField
            control={form.control}
            name="estacionamento_reserva_previa"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={checked => field.onChange(!!checked)}
                  />
                </FormControl>
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="cursor-pointer">
                    Necessária reserva antecipada da vaga
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Sinaliza no voucher que o hóspede deve confirmar a vaga
                    antes da chegada.
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Subseção Wi-Fi */}
      <div className="space-y-4 rounded-md border p-4 bg-muted/10">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Wifi className="h-4 w-4" />
          Conectividade & Wi-Fi
        </h4>

        <FormField
          control={form.control}
          name="possui_wifi"
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
                  Disponibiliza internet Wi-Fi aos hóspedes
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {possuiWifi && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <FormField
                control={form.control}
                name="tipo_wifi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade de Cobertura *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-label="Modalidade de Cobertura">
                          <SelectValue placeholder="Selecione a cobertura" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GRATUITO_TOTAL">
                          Gratuito em todas as áreas
                        </SelectItem>
                        <SelectItem value="GRATUITO_AREAS_COMUNS">
                          Gratuito apenas em áreas comuns
                        </SelectItem>
                        <SelectItem value="PAGO">Pago à parte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_rede_wifi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Rede Wi-Fi (SSID)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Hotel_Hospedes_5G"
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
                name="senha_rede_wifi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha da Rede Wi-Fi</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={mostrarSenhaWifi ? 'text' : 'password'}
                          placeholder="Senha de acesso"
                          className="pr-10"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setMostrarSenhaWifi(prev => !prev)}
                        title={
                          mostrarSenhaWifi ? 'Ocultar senha' : 'Exibir senha'
                        }
                      >
                        {mostrarSenhaWifi ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {mostrarSenhaWifi ? 'Ocultar senha' : 'Exibir senha'}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="exibir_wifi_voucher"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={checked => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="cursor-pointer">
                      Exibir rede e senha do Wi-Fi automaticamente no voucher de
                      confirmação
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}
