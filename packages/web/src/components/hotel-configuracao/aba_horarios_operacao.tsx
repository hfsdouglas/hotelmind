import { Controller, useFormContext, useWatch } from 'react-hook-form'
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
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function AbaHorariosOperacao() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HotelConfiguracaoFormData>()

  const reception24h = useWatch({
    control,
    name: 'reception_24h',
  })

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Horários Padrão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Horários Operacionais Padrão
          </CardTitle>
          <CardDescription className="text-sm">
            Defina os horários de início de check-in e saída limite de check-out
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkin_time">Início do Check-in (HH:mm) *</Label>
            <Input
              id="checkin_time"
              type="time"
              {...register('checkin_time')}
              placeholder="14:00"
            />
            {errors.checkin_time && (
              <span className="text-xs text-destructive">
                {errors.checkin_time.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout_time">Limite de Check-out (HH:mm) *</Label>
            <Input
              id="checkout_time"
              type="time"
              {...register('checkout_time')}
              placeholder="12:00"
            />
            {errors.checkout_time && (
              <span className="text-xs text-destructive">
                {errors.checkout_time.message}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recepção */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recepção</CardTitle>
          <CardDescription className="text-sm">
            Horário e regime de funcionamento da recepção do hotel
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="reception_24h"
              render={({ field }) => (
                <Checkbox
                  id="reception_24h"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="reception_24h"
              className="text-sm font-medium cursor-pointer"
            >
              Funcionamento 24 horas (atendimento ininterrupto)
            </Label>
          </div>

          {!reception24h && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reception_opening_time">
                  Horário de Abertura da Recepção (HH:mm) *
                </Label>
                <Input
                  id="reception_opening_time"
                  type="time"
                  {...register('reception_opening_time')}
                  placeholder="08:00"
                />
                {errors.reception_opening_time && (
                  <span className="text-xs text-destructive">
                    {errors.reception_opening_time.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reception_closing_time">
                  Horário de Fechamento da Recepção (HH:mm) *
                </Label>
                <Input
                  id="reception_closing_time"
                  type="time"
                  {...register('reception_closing_time')}
                  placeholder="22:00"
                />
                {errors.reception_closing_time && (
                  <span className="text-xs text-destructive">
                    {errors.reception_closing_time.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
