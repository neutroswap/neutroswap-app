export const currencyFormat = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}
