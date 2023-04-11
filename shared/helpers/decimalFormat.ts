export const decimalFormat = (value: number, fixed: number) => ~~(Math.pow(10, fixed) * value) / Math.pow(10, fixed)
