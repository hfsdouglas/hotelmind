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

export function AbaRegrasCasa() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HotelConfiguracaoFormData>()

  const petFriendly = useWatch({
    control,
    name: 'pet_friendly',
  })

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Política Pet Friendly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Animais de Estimação (Pet Friendly)
          </CardTitle>
          <CardDescription className="text-sm">
            Configure as regras para hospedagem de animais de estimação
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="pet_friendly"
              render={({ field }) => (
                <Checkbox
                  id="pet_friendly"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="pet_friendly"
              className="text-sm font-medium cursor-pointer"
            >
              Aceita animais de estimação (Pet Friendly)
            </Label>
          </div>

          {petFriendly && (
            <div className="pt-2 border-t flex flex-col gap-1.5 max-w-sm">
              <Label htmlFor="pet_max_weight_kg">
                Peso Máximo Permitido por Pet (kg)
              </Label>
              <Input
                id="pet_max_weight_kg"
                type="number"
                step="0.5"
                min={0}
                {...register('pet_max_weight_kg', {
                  setValueAs: v =>
                    v === '' || Number.isNaN(Number(v)) ? null : Number(v),
                })}
                placeholder="Ex: 10"
              />
              {errors.pet_max_weight_kg && (
                <span className="text-xs text-destructive">
                  {errors.pet_max_weight_kg.message}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Deixe em branco se não houver limite rígido de peso
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Política de Fumo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Política de Fumo
          </CardTitle>
          <CardDescription className="text-sm">
            Restrições a fumantes em áreas fechadas e taxas sanitárias aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="smoking_allowed"
              render={({ field }) => (
                <Checkbox
                  id="smoking_allowed"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="smoking_allowed"
              className="text-sm font-medium cursor-pointer"
            >
              Permitir fumar em quartos ou áreas fechadas
            </Label>
          </div>

          <div className="pt-2 border-t flex flex-col gap-1.5 max-w-sm">
            <Label htmlFor="smoking_sanitization_fee">
              Taxa de Higienização/Desodorização por Infração (R$)
            </Label>
            <Input
              id="smoking_sanitization_fee"
              type="number"
              step="0.01"
              min={0}
              {...register('smoking_sanitization_fee', {
                setValueAs: v =>
                  v === '' || Number.isNaN(Number(v)) ? null : Number(v),
              })}
              placeholder="Ex: 250.00"
            />
            {errors.smoking_sanitization_fee && (
              <span className="text-xs text-destructive">
                {errors.smoking_sanitization_fee.message}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Valor cobrado para limpeza profunda e desodorização caso a
              proibição seja violada
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
