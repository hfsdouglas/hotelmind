import type { Hotel } from '@/core/entities/hotel'

export interface IHotelRepository {
  findById(id: string): Promise<Hotel | null>
}
