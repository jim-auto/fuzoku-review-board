import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, ExternalLink, Users, Store, Tag,
  Clock, Phone, Sun, CircleCheck, CircleX, CircleMinus, Banknote, CalendarCheck,
} from 'lucide-react'
import shopsData from '../data/shops.json'
import castsData from '../data/casts.json'
import type { Cast, Shop } from '../types'
import CastCard from '../components/CastCard'
import { getDiscountPrice } from '../utils/pricing'

const allShops = shopsData as Shop[]
const allCasts = castsData as Cast[]

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff', '大阪': '#ff2d78', '名古屋': '#b44fff',
  '横浜': '#ffaa00', '福岡': '#00ff9f', '札幌': '#4488ff',
}

const GENRE_COLORS: Record<string, string> = {
  'デリバリーヘルス': '#ff2d78', 'ソープランド': '#b44fff', 'メンズエステ': '#00ff9f',
  'イメクラ': '#ffaa00', 'オナクラ': '#00d4ff', 'キャバクラ': '#f0c040',
  'ラウンジ': '#9966ff', 'セクシーキャバクラ': '#ff4499', 'コンセプトカフェ': '#00ccaa',
}

function NsBadge({ value, label }: { value: boolean | null; label: string }) {
  if (value === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-500 bg-dark-700">
        <CircleMinus size={14} className="text-text-dim" />
        <span className="text-xs font-bold text-text-dim">{label}</span>
        <span className="text-xs text-text-dim">N/A</span>
      </div>
    )
  }
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
      style={value
        ? { background: 'rgba(255,45,120,0.08)', borderColor: 'rgba(255,45,120,0.35)' }
        : { background: 'rgba(100,100,120,0.08)', borderColor: 'rgba(100,100,120,0.25)' }
      }
    >
      {value
        ? <CircleCheck size={14} className="text-neon-pink" />
        : <CircleX size={14} className="text-text-dim" />
      }
      <span className={`text-xs font-bold ${value ? 'text-neon-pink' : 'text-text-dim'}`}>{label}</span>
      <span className={`text-xs font-semibold ${value ? 'text-neon-pink' : 'text-text-dim'}`}>
        {value ? '対応' : '非対応'}
      </span>
    </div>
  )
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const shop = allShops.find(s => s.id === id)

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4 opacity-30">🏪</div>
        <p className="text-text-muted mb-4">店舗が見つかりませんでした</p>
        <Link to="/" className="text-sm text-neon-cyan hover:underline">トップに戻る</Link>
      </div>
    )
  }

  const shopCasts = allCasts.filter(c => c.shopId === shop.id)
  const areaColor = AREA_COLORS[shop.area] ?? '#00d4ff'
  const genreColor = GENRE_COLORS[shop.genre] ?? '#00d4ff'
  const discountPrice = getDiscountPrice(shop)
  const displayedMinPrice = discountPrice.isEstimateValid ? discountPrice.discountedMin : shop.price.min
  const hasServiceOptions = shop.options.ns !== null || shop.options.nn !== null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link to="/shops" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body transition-colors">
        <ArrowLeft size={15} />店舗一覧
      </Link>

      {/* Shop hero */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${genreColor}, ${areaColor})` }} />
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${genreColor}12`, border: `2px solid ${genreColor}40`, boxShadow: `0 0 20px ${genreColor}15` }}
            >
              <Store size={28} style={{ color: genreColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-text-bright mb-1" style={{ textShadow: `0 0 20px ${genreColor}30` }}>
                {shop.name}
              </h1>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="flex items-center gap-1 text-text-muted">
                  <MapPin size={12} style={{ color: areaColor }} />
                  <span style={{ color: areaColor }}>{shop.area}</span>
                </span>
                <span className="text-text-dim">·</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                  style={{ background: `${genreColor}12`, borderColor: `${genreColor}40`, color: genreColor }}>
                  {shop.genre}
                </span>
                <span className="text-xs text-text-dim flex items-center gap-1">
                  <Users size={11} />{shop.castCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-text-body leading-relaxed">{shop.description}</p>

          {/* Decision summary */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3">
            <div className="bg-dark-700 rounded-xl border border-dark-600 overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim uppercase tracking-widest">
                  <Banknote size={12} className="text-neon-green" />料金サマリー
                </div>
                {discountPrice.isEstimateValid && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-neon-green/30 bg-neon-green/10 text-neon-green font-semibold">
                    割引適用可
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-end gap-2 mb-3">
                  <div>
                    <div className="text-xs text-text-dim mb-0.5">
                      {discountPrice.isEstimateValid ? '割引後の最安目安' : '通常最安'}
                    </div>
                    <div className="text-3xl font-black text-text-bright leading-none">
                      ¥{displayedMinPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-text-dim pb-1">{shop.price.unit}</div>
                </div>

                <div className="divide-y divide-dark-600 rounded-lg border border-dark-600 overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 px-3 py-2 text-xs">
                    <span className="text-text-dim">通常料金</span>
                    <span className="text-right text-text-body font-semibold">
                      ¥{shop.price.min.toLocaleString()}〜¥{shop.price.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-3 py-2 text-xs">
                    <span className="text-text-dim">割引額</span>
                    <span className={`text-right font-semibold ${discountPrice.hasAmount ? 'text-neon-green' : 'text-text-dim'}`}>
                      {discountPrice.hasAmount ? `-${discountPrice.amount.toLocaleString()}円` : 'なし'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-3 py-2 text-xs">
                    <span className="text-text-dim">割引後目安</span>
                    <span className="text-right text-text-bright font-bold">
                      {discountPrice.isEstimateValid ? `¥${discountPrice.discountedMin.toLocaleString()}〜` : '条件確認'}
                    </span>
                  </div>
                </div>

                {discountPrice.hasAmount && !discountPrice.isEstimateValid && (
                  <div className="mt-2 text-xs text-neon-amber">
                    割引額が通常最安を上回るため、適用条件の確認が必要です。
                  </div>
                )}
                {!discountPrice.hasAmount && (
                  <div className="mt-2 text-xs text-text-dim">金額割引データはありません。</div>
                )}
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl border border-dark-600 overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-600 flex items-center gap-1.5 text-xs font-medium text-text-dim uppercase tracking-widest">
                <CalendarCheck size={12} className="text-neon-cyan" />来店前チェック
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-dim mb-1">
                    <Clock size={12} className="text-neon-cyan" />営業時間
                  </div>
                  <div className="text-sm font-bold text-text-bright">{shop.hours}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-dim mb-1">
                    <Sun size={12} className="text-neon-amber" />割引条件
                  </div>
                  {shop.morning.available ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold" style={{ color: discountPrice.isEstimateValid ? '#00ff9f' : '#ffaa00' }}>
                        {discountPrice.hasAmount ? `${discountPrice.amount.toLocaleString()}円OFF` : '時間帯特典あり'}
                      </div>
                      <div className="text-xs text-text-body">{shop.morning.hours}</div>
                      {shop.morning.discount && (
                        <div className="text-xs font-semibold text-neon-green">{shop.morning.discount}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-text-dim">割引条件データなし</div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-dim mb-1">
                    <Phone size={12} className="text-neon-purple" />予約方法
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.reservation.map(r => (
                      <span key={r} className="text-xs px-2.5 py-1 rounded-full border"
                        style={{ background: 'rgba(180,79,255,0.08)', borderColor: 'rgba(180,79,255,0.3)', color: '#b44fff' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a href={shop.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ background: `${genreColor}15`, border: `1px solid ${genreColor}40`, color: genreColor, boxShadow: `0 0 16px ${genreColor}10` }}>
              <ExternalLink size={14} />公式サイトを見る
            </a>
            <span className="text-xs text-text-dim">掲載情報はサンプルです。最新条件は公式側で確認してください。</span>
          </div>

          {/* NS/NN */}
          {hasServiceOptions && (
            <div>
              <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-2">サービスオプション</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <NsBadge value={shop.options.ns} label="NS" />
                <NsBadge value={shop.options.nn} label="NN" />
              </div>
              {shop.options.extras.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {shop.options.extras.map(ex => (
                    <span key={ex} className="text-xs px-2.5 py-1 rounded-full border"
                      style={{ background: 'rgba(255,45,120,0.06)', borderColor: 'rgba(255,45,120,0.25)', color: '#ff2d78' }}>
                      {ex}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Non-sexual shop options (キャバ etc) */}
          {shop.options.ns === null && shop.options.nn === null && shop.options.extras.length > 0 && (
            <div>
              <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-2">サービス内容</div>
              <div className="flex flex-wrap gap-1.5">
                {shop.options.extras.map(ex => (
                  <span key={ex} className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ background: `${genreColor}08`, borderColor: `${genreColor}30`, color: genreColor }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {shop.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                <Tag size={11} />特徴タグ
              </div>
              <div className="flex flex-wrap gap-1.5">
                {shop.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full border"
                    style={{ background: `${genreColor}08`, borderColor: `${genreColor}30`, color: genreColor }}>
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Cast list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-text-bright tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            在籍キャスト
          </h2>
          <span className="text-sm text-text-dim">{shopCasts.length}名</span>
        </div>
        {shopCasts.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm opacity-50">在籍キャストが見つかりませんでした</div>
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
