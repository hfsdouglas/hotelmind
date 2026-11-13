import { Button } from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { hoteisService } from '@/api/hoteis.service'
import { type Rota, rotasService } from '@/api/rotas.service'
import { SaveButton } from '@/components/forms/save_button'
import { Checkbox } from '@/components/ui/checkbox'
import { usePageTitle } from '@/hooks/use_document_title'
import { cn } from '@/lib/utils'

export function HotelRotasPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data: hotel } = useQuery({
    queryKey: ['admin:hotel', id],
    queryFn: () => hoteisService.findById(id!),
    enabled: !!id,
  })

  usePageTitle(
    hotel?.nome_fantasia || hotel?.nome_hotel
      ? `Rotas do Hotel - ${hotel.nome_fantasia || hotel.nome_hotel}`
      : 'Rotas do Hotel'
  )

  const { data: allRotas } = useQuery({
    queryKey: ['admin:rotas:all'],
    queryFn: () => rotasService.list({ limite: 250 }),
  })

  const { data: hotelRotas } = useQuery({
    queryKey: ['admin:hotel:rotas', id],
    queryFn: () => hoteisService.getRotas(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (hotelRotas) setSelected(new Set(hotelRotas.map(r => r.id)))
  }, [hotelRotas])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => hoteisService.setRotas(id!, Array.from(selected)),
    onSuccess: () => {
      toast.success('Rotas atualizadas.')
      qc.invalidateQueries({ queryKey: ['admin:hotel:rotas', id] })
      navigate('/hoteis')
    },
    onError: () => toast.error('Erro ao salvar rotas.'),
  })

  const toggle = (rotaId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(rotaId) ? next.delete(rotaId) : next.add(rotaId)
      return next
    })
  }

  const grouped = (allRotas?.data ?? []).reduce<Record<string, Rota[]>>(
    (acc, r) => {
      ;(acc[r.modulo] ??= []).push(r)
      return acc
    },
    {}
  )

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rotas do Hotel</h1>
        {hotel && (
          <p className="text-muted-foreground">{hotel.nome_fantasia}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Object.entries(grouped).map(([modulo, rotas]) => (
          <div key={modulo}>
            <h3 className="mb-2 font-semibold">{modulo}</h3>
            <div className="flex flex-col gap-2">
              {rotas.map(rota => (
                <label
                  key={rota.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent',
                    selected.has(rota.id) && 'border-primary bg-accent'
                  )}
                >
                  <Checkbox
                    checked={selected.has(rota.id)}
                    onCheckedChange={() => toggle(rota.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{rota.recurso}</p>
                    <p className="text-xs text-muted-foreground">{rota.rota}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <SaveButton
          type="button"
          onClick={() => save()}
          isPending={isPending}
        />
        <Button variant="outline" onClick={() => navigate('/hoteis')}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
