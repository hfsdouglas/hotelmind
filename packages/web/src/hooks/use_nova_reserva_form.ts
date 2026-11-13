import { zodResolver } from '@hookform/resolvers/zod'
import type {
  QuartoDisponivel,
  Reserva,
  ReservaConflitoErro,
} from '@hotelmind/contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { unmask_phone } from '@/hooks/use_phone_mask'
import {
  type NovaReservaFormData,
  novaReservaFormSchema,
} from '@/schemas/reservas/reserva.schema'
import type { NovaReservaValoresIniciais } from '@/types/calendar_range_selection'

const CONFLITO_PADRAO = 'A suíte selecionada já possui reserva no período.'
const HTTP_CONFLICT = 409

interface ConflitoState {
  open: boolean
  mensagem: string
  alternativas: QuartoDisponivel[]
}

interface UseNovaReservaFormOptions {
  valoresIniciais?: NovaReservaValoresIniciais
  onSuccess: (reserva: Reserva) => void
}

export function useNovaReservaForm({
  valoresIniciais,
  onSuccess,
}: UseNovaReservaFormOptions) {
  const queryClient = useQueryClient()
  const [conflito, setConflito] = useState<ConflitoState>({
    open: false,
    mensagem: '',
    alternativas: [],
  })

  const form = useForm<NovaReservaFormData>({
    resolver: zodResolver(novaReservaFormSchema),
    defaultValues: {
      check_in: '',
      check_out: '',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      cupom_desconto: '',
      parceiro_comercial_id: '',
      regime_alimentacao_id: '',
      quarto_id: '',
      titular_nome: '',
      titular_telefone: '',
      titular_email: '',
      observacoes: '',
      ...valoresIniciais,
    },
  })

  // Reading errors here subscribes the host component to validation changes.
  const { errors } = form.formState

  const createMutation = useMutation({
    mutationFn: (data: NovaReservaFormData) =>
      reservasService.create({
        titular_nome: data.titular_nome,
        titular_telefone: data.titular_telefone
          ? unmask_phone(data.titular_telefone)
          : null,
        titular_email: data.titular_email || null,
        quarto_id: data.quarto_id,
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_comercial_id:
          data.parceiro_comercial_id && data.parceiro_comercial_id !== 'direta'
            ? data.parceiro_comercial_id
            : null,
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        quantidade_pets: data.quantidade_pets,
        cupom_desconto: data.cupom_desconto?.trim() || null,
        observacoes: data.observacoes || null,
      }),
    onSuccess: reserva => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success(`Reserva ${reserva.codigo} cadastrada com sucesso!`)
      onSuccess(reserva)
    },
    // biome-ignore lint/suspicious/noExplicitAny: Axios error handling
    onError: (err: any) => {
      if (err.response?.status === HTTP_CONFLICT) {
        const conflitoData = err.response.data as ReservaConflitoErro
        setConflito({
          open: true,
          mensagem: conflitoData.message || CONFLITO_PADRAO,
          alternativas: conflitoData.alternativas || [],
        })
        return
      }
      toast.error(err.response?.data?.message || 'Erro ao cadastrar reserva.')
    },
  })

  const onSubmit = form.handleSubmit(data => createMutation.mutate(data))

  const fecharConflito = () => setConflito(prev => ({ ...prev, open: false }))

  const selecionarAlternativa = (alternativa: QuartoDisponivel) => {
    form.setValue('quarto_id', alternativa.quarto_id)
    fecharConflito()
    toast.info(
      `Suíte ${alternativa.identificacao} selecionada como alternativa.`
    )
  }

  return {
    form,
    errors,
    onSubmit,
    isPending: createMutation.isPending,
    conflito,
    fecharConflito,
    selecionarAlternativa,
  }
}
