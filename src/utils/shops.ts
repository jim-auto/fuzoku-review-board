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
