export class HotelNotFoundError extends Error {
  readonly code = 'HOTEL_NOT_FOUND'

  constructor() {
    super('Hotel não encontrado')
    this.name = 'HotelNotFoundError'
  }
}
