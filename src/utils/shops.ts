import type { Shop } from '../types'

export function isTotalComparableSoap(shop: Shop): boolean {
  if (shop.genre !== 'ソープランド') return false

  const text = [
    shop.description,
    shop.price.unit,
    ...shop.tags,
    ...shop.options.extras,
  ].join(' ')

  const hasTotalSignal = text.includes('総額')
  const hasNonTotalSignal =
    text.includes('入浴料') ||
    text.includes('入浴料のみ') ||
    text.includes('別途サービス料') ||
    text.includes('総額は電話確認')

  return hasTotalSignal && !hasNonTotalSignal
}

export function getSoapPriceBasis(shop: Shop): 'total' | 'partial' | 'unknown' {
  if (shop.genre !== 'ソープランド') return 'unknown'
  if (isTotalComparableSoap(shop)) return 'total'

  const text = [
    shop.description,
    shop.price.unit,
    ...shop.tags,
    ...shop.options.extras,
  ].join(' ')

  if (
    text.includes('入浴料') ||
    text.includes('別途サービス料') ||
    text.includes('総額は電話確認')
  ) {
    return 'partial'
  }

  return 'unknown'
}

export function getSoapPriceBasisLabel(shop: Shop): string | undefined {
  const basis = getSoapPriceBasis(shop)
  if (basis === 'total') return '総額確認済み'
  if (basis === 'partial') return '総額対象外'
  return shop.genre === 'ソープランド' ? '総額未確認' : undefined
}
