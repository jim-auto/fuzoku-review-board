import type { Shop } from '../types'

export interface TimeValue {
  minutes: number
  price: number
  yenPerMinute: number
  minutesPer10000Yen: number
  label: string
  detail: string
}

export function getTimeValue(shop: Shop): TimeValue | null {
  const minuteMatches = [...shop.price.unit.matchAll(/(\d{2,3})\s*分/g)]
  if (minuteMatches.length === 0) return null

  const minutes = minuteMatches.map(match => Number(match[1])).filter(Number.isFinite)
  if (minutes.length === 0) return null

  const basisMinutes = Math.max(...minutes)
  const basisPrice = shop.price.max > shop.price.min ? shop.price.max : shop.price.min
  if (basisMinutes <= 0 || basisPrice <= 0) return null

  const yenPerMinute = Math.round(basisPrice / basisMinutes)
  const minutesPer10000Yen = Math.round((10000 / basisPrice) * basisMinutes * 10) / 10

  return {
    minutes: basisMinutes,
    price: basisPrice,
    yenPerMinute,
    minutesPer10000Yen,
    label: `${yenPerMinute.toLocaleString()}円/分`,
    detail: `1万円あたり${minutesPer10000Yen.toLocaleString()}分`,
  }
}
