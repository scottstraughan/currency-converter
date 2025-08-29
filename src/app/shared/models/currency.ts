/**
 * A currency type.
 */
export type Currency = {
  name: string
  symbol: string
  value?: number
}

/**
 * A currency pair type.
 */
export type CurrencyPair = {
  from: Currency
  to: Currency
  updated?: Date
}