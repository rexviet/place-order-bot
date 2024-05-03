export enum OrderDirection {
  BUY = 'buy',
  SELL = 'sell',
}

export const directionMapper = {
  LONG: OrderDirection.BUY,
  SHORT: OrderDirection.SELL,
}
