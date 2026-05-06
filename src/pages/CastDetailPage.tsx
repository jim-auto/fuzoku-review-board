import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  MessageSquare,
  User,
  Ruler,
  Sparkles,
  AlertCircle,
  Store,
} from 'lucide-react'
import castsData from '../data/casts.json'
import shopsData from '../data/shops.json'
import type { Cast, Shop } from '../types'

const allCasts = castsData as Cast[]
const allShops = shopsData as Shop[]

const GENRE_DESC: Record<string, string> = {
  'デリバリーヘルス': '出張・宅配型サービス',
  'ソープランド': '高級浴場型サービス',
  'メンズエステ': '施術・癒し系サービス',
  'イメクラ': 'コンセプト・設定型サービス',
  'オナクラ': 'シンプル型サービス',
}

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff',
  '大阪': '#ff2d78',
  '名古屋': '#b44fff',
  '横浜': '#ffaa00',
  '福岡': '#00ff9f',
  '札幌': '#4488ff',
}

export default function CastDetailPage() {
  const { id } = useParams<{ id: string }>()
  const cast = allCasts.find(c => c.id === id)
  const shop = cast ? allShops.find(s => s.id === cast.shopId) : undefined

  if (!cast) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4 opacity-30">👤</div>
        <p className="text-text-muted mb-4">キャストが見つかりませんでした</p>
        <Link to="/casts" className="text-sm text-neon-cyan hover:underline">
          一覧に戻る
        </Link>
      </div>
    )
  }

  const areaColor = AREA_COLORS[cast.area] ?? '#00d4ff'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        to="/casts"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body transition-colors"
      >
        <ArrowLeft size={15} />
        キャスト一覧
      </Link>

      {/* Profile card */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        {/* Accent header bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${cast.accentColor}, ${areaColor})` }}
        />

        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Large avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden"
              style={{
                border: `2px solid ${cast.accentColor}50`,
                boxShadow: `0 0 30px ${cast.accentColor}15`,
              }}
            >
              {cast.imageUrl ? (
                <img
                  src={cast.imageUrl}
                  alt={cast.name}
                  className="w-full h-full object-cover"
                  style={{ background: `${cast.accentColor}18` }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${cast.accentColor}18, ${cast.accentColor}50)`,
                    color: cast.accentColor,
                    fontFamily: 'var(--font-display)',
                    textShadow: `0 0 20px ${cast.accentColor}90`,
                  }}
                >
                  {cast.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {cast.isNew && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neon-pink/15 text-neon-pink border border-neon-pink/30 font-semibold">
                    NEW
                  </span>
                )}
                {cast.isFeatured && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neon-amber/15 text-neon-amber border border-neon-amber/30 font-semibold">
                    FEATURED
                  </span>
                )}
              </div>

              <h1
                className="text-3xl font-black text-text-bright mb-1"
                style={{ textShadow: `0 0 20px ${cast.accentColor}40` }}
              >
                {cast.name}
              </h1>

              <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <MapPin size={13} className="flex-shrink-0" style={{ color: areaColor }} />
                <span style={{ color: areaColor }}>{cast.area}</span>
                <span className="text-text-dim">·</span>
                <span>{cast.shop}</span>
              </div>

              <div className="mt-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{
                    background: `${cast.accentColor}12`,
                    borderColor: `${cast.accentColor}40`,
                    color: cast.accentColor,
                  }}
                >
                  {cast.genre}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={<User size={14} />} label="年齢" value={`${cast.age}歳`} color={cast.accentColor} />
            <Stat icon={<Ruler size={14} />} label="身長" value={`${cast.height}cm`} color={cast.accentColor} />
            <Stat icon={<Sparkles size={14} />} label="スタイル" value={cast.style} color={cast.accentColor} />
          </div>

          {/* Tags */}
          <div className="mt-5">
            <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-2">特徴タグ</div>
            <div className="flex flex-wrap gap-1.5">
              {cast.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/casts?tag=${encodeURIComponent(tag)}`}
                  className="text-sm px-3 py-1 rounded-full border transition-all hover:-translate-y-0.5"
                  style={{
                    background: `${cast.accentColor}10`,
                    borderColor: `${cast.accentColor}35`,
                    color: cast.accentColor,
                  }}
                >
                  # {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-2">プロフィール</div>
            <p className="text-sm text-text-body leading-relaxed">{cast.description}</p>
          </div>

          {/* Shop link */}
          <div className="mt-5 pt-5 border-t border-dark-600">
            <a
              href={shop?.url ?? cast.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: `${cast.accentColor}15`,
                border: `1px solid ${cast.accentColor}40`,
                color: cast.accentColor,
                boxShadow: `0 0 16px ${cast.accentColor}10`,
              }}
            >
              <ExternalLink size={14} />
              店舗サイトを見る（{cast.shop}）
            </a>
          </div>
        </div>
      </div>

      {/* Shop info */}
      {shop && (
        <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
            <Store size={16} className="text-neon-cyan" />
            <h2 className="font-bold text-text-bright text-base">店舗情報</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <h3 className="text-lg font-bold text-text-bright">{shop.name}</h3>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MapPin size={13} style={{ color: AREA_COLORS[shop.area] ?? '#00d4ff' }} />
              <span style={{ color: AREA_COLORS[shop.area] ?? '#00d4ff' }}>{shop.area}</span>
              <span className="text-text-dim">·</span>
              <span>{shop.genre}</span>
            </div>
            <p className="text-sm text-text-body leading-relaxed">{shop.description}</p>
            {shop.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {shop.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{
                      background: 'rgba(0,212,255,0.06)',
                      borderColor: 'rgba(0,212,255,0.2)',
                      color: '#00d4ff',
                    }}
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Online trends / rumors */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
          <MessageSquare size={16} className="text-neon-purple" />
          <h2 className="font-bold text-text-bright text-base">ネット上で見られる傾向</h2>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-dark-700 border border-dark-600">
            <AlertCircle size={14} className="text-text-dim flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-dim leading-relaxed">
              以下はネット上で目にする声や傾向をまとめたものです。
              断定・保証するものではありません。情報は参考程度にご利用ください。
            </p>
          </div>

          <ul className="space-y-3">
            {cast.rumors.map((rumor, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50 border border-dark-600"
              >
                <span
                  className="text-xs font-mono font-bold flex-shrink-0 mt-0.5"
                  style={{ color: cast.accentColor }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-text-body">{rumor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Genre info */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-4">
        <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-1.5">ジャンル概要</div>
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-text-body">{cast.genre}</span>
          <span className="text-text-dim mx-2">—</span>
          {GENRE_DESC[cast.genre] ?? cast.genre}
        </p>
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className="flex flex-col items-center py-3 px-2 rounded-xl border"
      style={{ background: `${color}08`, borderColor: `${color}25` }}
    >
      <span style={{ color: `${color}90` }}>{icon}</span>
      <span className="text-xs text-text-dim mt-1">{label}</span>
      <span className="text-sm font-bold text-text-bright mt-0.5">{value}</span>
    </div>
  )
}
