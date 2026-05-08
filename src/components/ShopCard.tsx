import { Link } from 'react-router-dom'
import { MapPin, Clock, Banknote, CircleCheck, CircleX, Users, Phone } from 'lucide-react'
import type { Shop } from '../types'
import { getDiscountPrice } from '../utils/pricing'

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff', '大阪': '#ff2d78', '名古屋': '#b44fff',
  '横浜': '#ffaa00', '福岡': '#00ff9f', '札幌': '#4488ff',
}

const GENRE_COLORS: Record<string, string> = {
  'デリバリーヘルス': '#ff2d78', 'ソープランド': '#b44fff', 'メンズエステ': '#00ff9f',
  'イメクラ': '#ffaa00', 'オナクラ': '#00d4ff', 'キャバクラ': '#f0c040',
  'ラウンジ': '#9966ff', 'セクシーキャバクラ': '#ff4499', 'コンセプトカフェ': '#00ccaa',
}

const GENRE_SHORT: Record<string, string> = {
  'デリバリーヘルス': 'DH', 'ソープランド': 'SP', 'メンズエステ': 'ES',
  'イメクラ': 'IM', 'オナクラ': 'OK', 'キャバクラ': 'KY',
  'ラウンジ': 'LG', 'セクシーキャバクラ': 'SK', 'コンセプトカフェ': 'CC',
}

interface Props { shop: Shop }

export default function ShopCard({ shop }: Props) {
  const areaColor = AREA_COLORS[shop.area] ?? '#00d4ff'
  const genreColor = GENRE_COLORS[shop.genre] ?? '#00d4ff'
  const short = GENRE_SHORT[shop.genre] ?? '??'
  const discountPrice = getDiscountPrice(shop)
  const hasOptions = shop.options.ns !== null || shop.options.nn !== null

  return (
    <Link
      to={`/shops/${shop.id}`}
      className="group block bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: 'none' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${genreColor}15, 0 0 0 1px ${genreColor}25` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${genreColor}, ${areaColor})` }} />

      <div className="p-4 space-y-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Genre badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
            style={{ background: `${genreColor}14`, border: `1px solid ${genreColor}35`, color: genreColor }}
          >
            {short}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text-bright text-sm leading-tight truncate group-hover:text-white transition-colors">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-dim">
              <MapPin size={10} style={{ color: areaColor }} />
              <span style={{ color: areaColor }}>{shop.area}</span>
              <span>·</span>
              <span>{shop.genre}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1.5 border-y border-dark-600 py-3">
          {discountPrice.isEstimateValid ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-semibold text-neon-green">割引後</span>
                    <span className="text-xl font-black text-text-bright leading-none">
                      ¥{discountPrice.discountedMin.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-text-dim mt-1 truncate">{shop.price.unit}</div>
                </div>
                <span
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0 text-xs"
                  style={{ background: 'rgba(0,255,159,0.1)', color: '#00ff9f', border: '1px solid rgba(0,255,159,0.28)' }}
                >
                  <Banknote size={9} />最安割引
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs min-w-0">
                <span className="text-text-dim line-through">通常 ¥{shop.price.min.toLocaleString()}</span>
                <span className="text-neon-green font-semibold">-{discountPrice.amount.toLocaleString()}円</span>
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-text-bright">
                    ¥{shop.price.min.toLocaleString()}
                  </span>
                  <span className="text-text-dim text-xs">〜</span>
                  <span className="text-sm font-semibold text-text-body">
                    ¥{shop.price.max.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-text-dim mt-1 truncate">{shop.price.unit}</div>
              </div>
              {discountPrice.hasAmount && (
                <span
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0 text-xs"
                  style={{ background: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.28)' }}
                >
                  <Banknote size={9} />割引要確認
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hours */}
        <div className="flex items-center gap-1.5 text-xs text-text-dim min-w-0">
          <Clock size={11} className="text-neon-cyan flex-shrink-0" />
          <span className="truncate">{shop.hours}</span>
        </div>

        {/* Reservation + NS/NN */}
        <div className="space-y-2">
          {shop.reservation.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {shop.reservation.slice(0, 3).map(method => (
                <span
                  key={method}
                  className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.22)', color: '#00d4ff' }}
                >
                  <Phone size={9} />
                  {method}
                </span>
              ))}
            </div>
          )}

          {hasOptions && (
            <div className="flex gap-1.5">
              {(['ns', 'nn'] as const).map(key => {
                const val = shop.options[key]
                if (val === null) return null
                return (
                  <span
                    key={key}
                    className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border font-bold"
                    style={val
                      ? { background: 'rgba(255,45,120,0.08)', borderColor: 'rgba(255,45,120,0.3)', color: '#ff2d78' }
                      : { background: 'rgba(100,100,120,0.06)', borderColor: 'rgba(100,100,120,0.2)', color: '#888' }
                    }
                  >
                    {val ? <CircleCheck size={10} /> : <CircleX size={10} />}
                    {key.toUpperCase()}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {shop.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ background: `${genreColor}08`, borderColor: `${genreColor}25`, color: genreColor }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Cast count */}
        <div className="flex items-center gap-1 text-xs text-text-dim pt-0.5 border-t border-dark-600">
          <Users size={10} />
          <span>{shop.castCount}</span>
        </div>
      </div>
    </Link>
  )
}
