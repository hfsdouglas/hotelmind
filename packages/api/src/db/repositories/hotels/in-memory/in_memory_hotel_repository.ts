import { Hotel } from '@/core/entities/hotel'
import type { IHotelRepository } from '@/core/repositories/hotel_repository'

export class InMemoryHotelRepository implements IHotelRepository {
  private store = new Map<string, Hotel>()

  async findById(id: string): Promise<Hotel | null> {
    return this.store.get(id) ?? null
  }

  seed(hotel: Hotel): void {
    this.store.set(hotel.id, hotel)
  }
}
