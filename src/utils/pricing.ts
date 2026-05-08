import type { Shop } from '../types'

export interface DiscountPrice {
  amount: number
  discountedMin: number
  hasAmount: boolean
  isEstimateValid: boolean
  label?: string
}

export function getDiscountPrice(shop: Shop): DiscountPrice {
  const label = shop.morning.discount
  const amount = parseDiscountAmount(label)

  return {
    amount,
    discountedMin: shop.price.min - amount,
    hasAmount: amount > 0,
    isEstimateValid: amount > 0 && amount < shop.price.min,
    label,
  }
}

export function parseDiscountAmount(discount?: string): number {
  if (!discount) return 0

  const normalized = discount.replace(/[０-９]/g, char =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  )
  const match = normalized.match(/([\d,]+)\s*円/)
  if (!match) return 0

  return Number(match[1].replace(/,/g, '')) || 0
}
