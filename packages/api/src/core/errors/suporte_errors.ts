export class HotelInactiveError extends Error {
  readonly code = 'HOTEL_INACTIVE'

  constructor() {
    super('Hotel inativo. Não é possível acessar via Suporte.')
    this.name = 'HotelInactiveError'
  }
}
