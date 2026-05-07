import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, ExternalLink, Users, Store, Tag } from 'lucide-react'
import shopsData from '../data/shops.json'
import castsData from '../data/casts.json'
import type { Cast, Shop } from '../types'
import CastCard from '../components/CastCard'

const allShops = shopsData as Shop[]
const allCasts = castsData as Cast[]

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff',
  '大阪': '#ff2d78',
  '名古屋': '#b44fff',
  '横浜': '#ffaa00',
  '福岡': '#00ff9f',
  '札幌': '#4488ff',
}

const GENRE_COLORS: Record<string, string> = {
  'デリバリーヘルス': '#ff2d78',
  'ソープランド': '#b44fff',
  'メンズエステ': '#00ff9f',
  'イメクラ': '#ffaa00',
  'オナクラ': '#00d4ff',
  'キャバクラ': '#f0c040',
  'ラウンジ': '#9966ff',
  'セクシーキャバクラ': '#ff4499',
  'コンセプトカフェ': '#00ccaa',
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const shop = allShops.find(s => s.id === id)

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4 opacity-30">🏪</div>
        <p className="text-text-muted mb-4">店舗が見つかりませんでした</p>
        <Link to="/" className="text-sm text-neon-cyan hover:underline">
          トップに戻る
        </Link>
      </div>
    )
  }

  const shopCasts = allCasts.filter(c => c.shopId === shop.id)
  const areaColor = AREA_COLORS[shop.area] ?? '#00d4ff'
  const genreColor = GENRE_COLORS[shop.genre] ?? '#00d4ff'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        to="/casts"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body transition-colors"
      >
        <ArrowLeft size={15} />
        キャスト一覧
      </Link>

      {/* Shop hero card */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${genreColor}, ${areaColor})` }}
        />

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
              style={{
                background: `${genreColor}12`,
                border: `2px solid ${genreColor}40`,
                boxShadow: `0 0 20px ${genreColor}15`,
              }}
            >
              <Store size={28} style={{ color: genreColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-black text-text-bright mb-1"
                style={{ textShadow: `0 0 20px ${genreColor}30` }}
              >
                {shop.name}
              </h1>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="flex items-center gap-1 text-text-muted">
                  <MapPin size={12} style={{ color: areaColor }} />
                  <span style={{ color: areaColor }}>{shop.area}</span>
                </span>
                <span className="text-text-dim">·</span>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                  style={{
                    background: `${genreColor}12`,
                    borderColor: `${genreColor}40`,
                    color: genreColor,
                  }}
                >
                  {shop.genre}
                </span>
              </div>
            </div>

            {/* Cast count badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold flex-shrink-0"
              style={{
                background: `${genreColor}10`,
                borderColor: `${genreColor}30`,
                color: genreColor,
              }}
            >
              <Users size={13} />
              {shopCasts.length}名在籍
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-body leading-relaxed">{shop.description}</p>

          {/* Tags */}
          {shop.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                <Tag size={11} />
                特徴
              </div>
              <div className="flex flex-wrap gap-1.5">
                {shop.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{
                      background: `${genreColor}08`,
                      borderColor: `${genreColor}30`,
                      color: genreColor,
                    }}
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shop link */}
          <div className="pt-2 border-t border-dark-600">
            <a
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: `${genreColor}15`,
                border: `1px solid ${genreColor}40`,
                color: genreColor,
                boxShadow: `0 0 16px ${genreColor}10`,
              }}
            >
              <ExternalLink size={14} />
              公式サイトを見る
            </a>
          </div>
        </div>
      </div>

      {/* Cast list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-text-bright tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            在籍キャスト
          </h2>
          <span className="text-sm text-text-dim">{shopCasts.length}名</span>
        </div>

        {shopCasts.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm opacity-50">
            在籍キャストが見つかりませんでした
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopCasts.map(cast => (
              <CastCard key={cast.id} cast={cast} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
