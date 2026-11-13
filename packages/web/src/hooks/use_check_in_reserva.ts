import type { Reserva } from '@hotelmind/contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'

const HTTP_NOT_FOUND = 404
const HTTP_UNPROCESSABLE = 422
const MSG_NAO_ENCONTRADA = 'Reserva não encontrada.'
const MSG_FALHA_CHECK_IN = 'Não foi possível realizar o check-in.'

interface UseCheckInReservaCallbacks {
  onSucesso: (reserva: Reserva) => void
  onNaoEncontrada: () => void
  onTransicaoInvalida: () => void
}

interface ReservaAlvo {
  id: string
  codigo: string
}

export function useCheckInReserva(callbacks: UseCheckInReservaCallbacks) {
  const queryClient = useQueryClient()

  function invalidar(id: string) {
    queryClient.invalidateQueries({ queryKey: ['reservas'] })
    queryClient.invalidateQueries({ queryKey: ['reserva', id] })
  }

  const mutation = useMutation({
    mutationFn: (reserva: ReservaAlvo) =>
      reservasService.changeStatus(reserva.id, 'check_in'),
    onSuccess: (reserva_atualizada, reserva) => {
      invalidar(reserva.id)
      toast.success(
        `Check-in da reserva ${reserva.codigo} realizado com sucesso!`
      )
      callbacks.onSucesso(reserva_atualizada)
    },
    onError: (error, reserva) => {
      const status = isAxiosError(error) ? error.response?.status : undefined
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined

      if (status === HTTP_NOT_FOUND) {
        invalidar(reserva.id)
        toast.error(MSG_NAO_ENCONTRADA)
        callbacks.onNaoEncontrada()
        return
      }
      if (status === HTTP_UNPROCESSABLE) {
        invalidar(reserva.id)
        toast.error(message || MSG_FALHA_CHECK_IN)
        callbacks.onTransicaoInvalida()
        return
      }
      toast.error(message || MSG_FALHA_CHECK_IN)
    },
  })

  return {
    realizarCheckIn: (reserva: ReservaAlvo) => mutation.mutate(reserva),
    isPending: mutation.isPending,
  }
}
