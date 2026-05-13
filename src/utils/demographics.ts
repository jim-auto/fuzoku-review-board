import type { Shop } from '../types'

export function getAgeSummary(shop: Shop): string | undefined {
  const data = shop.demographics
  if (!data?.averageAge || !data.sampleSize) return undefined
  return `平均${data.averageAge.toFixed(1)}歳`
}

export function getAgeDetail(shop: Shop): string | undefined {
  const data = shop.demographics
  if (!data?.averageAge || !data.sampleSize) return undefined
  const range = data.ageMin && data.ageMax ? `${data.ageMin}〜${data.ageMax}歳` : '年齢幅未取得'
  return `${range} / 年齢データ${data.sampleSize}件`
}
