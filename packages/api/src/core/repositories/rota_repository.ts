import type { Rota } from '@/core/entities/rota'

export interface IRotaRepository {
  findByHotel(hotelId: string): Promise<Rota[]>
  findByUsuario(hotelId: string, grupoIds: string[]): Promise<Rota[]>
}
