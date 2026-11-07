import { useFormContext } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function AbaCriancasHospedes() {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelConfiguracaoFormData>()

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Políticas de Gratuidade de Crianças
          </CardTitle>
          <CardDescription className="text-sm">
            Defina as regras de cortesia aplicadas automaticamente no cálculo de
            reservas e orçamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="free_child_age_limit">
              Idade Máxima para Gratuidade (anos) *
            </Label>
            <Input
              id="free_child_age_limit"
              type="number"
              min={0}
              {...register('free_child_age_limit', { valueAsNumber: true })}
              placeholder="Ex: 5"
            />
            {errors.free_child_age_limit && (
              <span className="text-xs text-destructive">
                {errors.free_child_age_limit.message}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Crianças até esta idade não pagam diária adicional
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="free_child_max_per_room">
              Quantidade Máxima de Crianças Gratuitas por Quarto *
            </Label>
            <Input
              id="free_child_max_per_room"
              type="number"
              min={0}
              {...register('free_child_max_per_room', { valueAsNumber: true })}
              placeholder="Ex: 1"
            />
            {errors.free_child_max_per_room && (
              <span className="text-xs text-destructive">
                {errors.free_child_max_per_room.message}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Limite de gratuidades concedidas por acomodação
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
