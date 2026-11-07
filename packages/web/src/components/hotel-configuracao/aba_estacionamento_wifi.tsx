import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function AbaEstacionamentoWifi() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HotelConfiguracaoFormData>()

  const [showPassword, setShowPassword] = useState(false)

  const parkingType = useWatch({
    control,
    name: 'parking_type',
  })

  const wifiAvailable = useWatch({
    control,
    name: 'wifi_available',
  })

  const isParkingPaid = parkingType === 'PAGO_LOCAL'

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Estacionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Estacionamento
          </CardTitle>
          <CardDescription className="text-sm">
            Parametrize as opções de vagas, tarifas e cobertura de veículos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="parking_type">Tipo de Estacionamento</Label>
            <Controller
              control={control}
              name="parking_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="parking_type">
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRATUITO">Gratuito</SelectItem>
                    <SelectItem value="PAGO_LOCAL">Pago no local</SelectItem>
                    <SelectItem value="CONVENIADO">
                      Terceirizado com convênio
                    </SelectItem>
                    <SelectItem value="NAO_POSSUI">Não possui</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="parking_covered">Tipo de Cobertura</Label>
            <Controller
              control={control}
              name="parking_covered"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="parking_covered">
                    <SelectValue placeholder="Selecione a cobertura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COBERTO">Coberto</SelectItem>
                    <SelectItem value="DESCOBERTO">Descoberto</SelectItem>
                    <SelectItem value="MISTO">Misto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {isParkingPaid && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="parking_fee_per_day">
                Valor Cobrado por Diária (R$)
              </Label>
              <Input
                id="parking_fee_per_day"
                type="number"
                step="0.01"
                min={0}
                {...register('parking_fee_per_day', {
                  setValueAs: v =>
                    v === '' || Number.isNaN(Number(v)) ? null : Number(v),
                })}
                placeholder="Ex: 35.00"
              />
              {errors.parking_fee_per_day && (
                <span className="text-xs text-destructive">
                  {errors.parking_fee_per_day.message}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 md:col-span-2 pt-2">
            <Controller
              control={control}
              name="parking_reservation_required"
              render={({ field }) => (
                <Checkbox
                  id="parking_reservation_required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="parking_reservation_required"
              className="text-sm font-medium cursor-pointer"
            >
              Requer reserva antecipada de vaga
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Wi-Fi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Conectividade Wi-Fi
          </CardTitle>
          <CardDescription className="text-sm">
            Informações de rede sem fio para exibição em vouchers e confirmações
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="wifi_available"
              render={({ field }) => (
                <Checkbox
                  id="wifi_available"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="wifi_available"
              className="text-sm font-medium cursor-pointer"
            >
              Disponibilidade de Wi-Fi no estabelecimento
            </Label>
          </div>

          {wifiAvailable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="wifi_type">Cobertura do Sinal</Label>
                <Controller
                  control={control}
                  name="wifi_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="wifi_type">
                        <SelectValue placeholder="Selecione a cobertura" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GRATUITO_TOTAL">
                          Gratuito em todas as áreas
                        </SelectItem>
                        <SelectItem value="GRATUITO_AREAS_COMUNS">
                          Gratuito apenas em áreas comuns
                        </SelectItem>
                        <SelectItem value="PAGO">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wifi_ssid_default">Nome da Rede (SSID)</Label>
                <Input
                  id="wifi_ssid_default"
                  {...register('wifi_ssid_default')}
                  placeholder="Ex: Hotel_Hospedes"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wifi_password_default">
                  Senha da Rede Wi-Fi
                </Label>
                <div className="relative">
                  <Input
                    id="wifi_password_default"
                    type={showPassword ? 'text' : 'password'}
                    {...register('wifi_password_default')}
                    placeholder="Senha de acesso"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 md:col-span-2 pt-2">
                <Controller
                  control={control}
                  name="wifi_show_on_voucher"
                  render={({ field }) => (
                    <Checkbox
                      id="wifi_show_on_voucher"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="wifi_show_on_voucher"
                  className="text-sm font-medium cursor-pointer"
                >
                  Exibir dados da rede automaticamente no voucher / e-mail de
                  confirmação
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
