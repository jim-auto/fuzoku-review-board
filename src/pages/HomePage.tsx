import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Sparkles, TrendingUp, Tag } from 'lucide-react'
import castsData from '../data/casts.json'
import type { Cast } from '../types'
import CastCard from '../components/CastCard'

const casts = castsData as Cast[]

const AREAS = [
  { name: '東京', color: '#00d4ff' },
  { name: '大阪', color: '#ff2d78' },
  { name: '名古屋', color: '#b44fff' },
  { name: '横浜', color: '#ffaa00' },
  { name: '福岡', color: '#00ff9f' },
  { name: '札幌', color: '#4488ff' },
]

const GENRES = [
  { name: 'デリバリーヘルス', short: 'DH', color: '#ff2d78', desc: '出張・宅配型' },
  { name: 'ソープランド', short: 'SP', color: '#b44fff', desc: '高級浴場型' },
  { name: 'メンズエステ', short: 'ES', color: '#00ff9f', desc: '施術・癒し系' },
  { name: 'イメクラ', short: 'IM', color: '#ffaa00', desc: 'コンセプト型' },
  { name: 'オナクラ', short: 'OK', color: '#00d4ff', desc: 'シンプル型' },
]

const POPULAR_TAGS = [
  '会話重視', '癒し系', '清楚系', '初心者向け', 'リピーター多め',
  'キレイ系', 'かわいい系', '落ち着いた雰囲気', '指名率高め', '技術派',
  '経験豊富', 'スレンダー', 'グラマー', 'ギャル系', 'お姉さん系',
]

const TRENDS = [
  '東京・大阪エリアはキャスト数が多く、選択肢が豊富という声あり',
  '「会話重視」タグのキャストはリピーターが多い傾向',
  '初心者向けタグのキャストはデリバリーヘルスジャンルに多い傾向',
  'メンズエステは技術面の評価が高いキャストが多い傾向',
  '年齢層は20代が中心で、バランスよく分布している傾向',
]

export default function HomePage() {
  const featured = casts.filter(c => c.isFeatured).slice(0, 4)
  const newCasts = casts.filter(c => c.isNew)

  const areasWithCount = AREAS.map(a => ({
    ...a,
    count: casts.filter(c => c.area === a.name).length,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-14">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative text-center py-14 overflow-hidden">
        {/* Subtle grid backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(ellipse, #b44fff 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700 border border-dark-500 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" style={{ boxShadow: '0 0 6px #00ff9f' }} />
            Beta版 公開中
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span style={{ color: '#00d4ff', textShadow: '0 0 40px rgba(0,212,255,0.35)' }}>FUZZ</span>
            <span style={{ color: '#ff2d78', textShadow: '0 0 40px rgba(255,45,120,0.35)' }}>BOARD</span>
          </h1>

          <p className="text-text-muted text-lg">風俗キャスト情報データベース</p>
          <p className="text-text-dim text-sm max-w-sm mx-auto">
            タグ・特徴・雰囲気で探せる、シンプルでモダンな情報検索体験
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/casts"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(180,79,255,0.15))',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#00d4ff',
                boxShadow: '0 0 20px rgba(0,212,255,0.1)',
              }}
            >
              キャストを探す
              <ArrowRight size={15} />
            </Link>
            <span className="text-text-dim text-sm">{casts.length}名登録中</span>
          </div>
        </div>
      </section>

      {/* ── Areas ────────────────────────────────────────── */}
      <section>
        <h2 className="section-title">
          <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-cyan to-neon-purple flex-shrink-0" />
          <MapPin size={16} className="text-neon-cyan" />
          エリアから探す
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {areasWithCount.map(area => (
            <Link
              key={area.name}
              to={`/casts?area=${encodeURIComponent(area.name)}`}
              className="flex flex-col items-center p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1"
              style={{ background: `${area.color}0c`, borderColor: `${area.color}30` }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = `0 4px 20px ${area.color}25`
                el.style.borderColor = `${area.color}60`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = ''
                el.style.borderColor = `${area.color}30`
              }}
            >
              <span
                className="text-xl font-black"
                style={{ color: area.color, fontFamily: 'var(--font-display)', textShadow: `0 0 10px ${area.color}50` }}
              >
                {area.name[0]}
              </span>
              <span className="text-sm font-medium mt-0.5" style={{ color: area.color }}>
                {area.name}
              </span>
              <span className="text-xs text-text-dim mt-0.5">{area.count}名</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Genres ───────────────────────────────────────── */}
      <section>
        <h2 className="section-title">
          <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-purple to-neon-pink flex-shrink-0" />
          <Sparkles size={16} className="text-neon-purple" />
          ジャンルから探す
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {GENRES.map(genre => (
            <Link
              key={genre.name}
              to={`/casts?genre=${encodeURIComponent(genre.name)}`}
              className="flex flex-col p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1"
              style={{ background: `${genre.color}0c`, borderColor: `${genre.color}30` }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = `0 4px 20px ${genre.color}25`
                el.style.borderColor = `${genre.color}60`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = ''
                el.style.borderColor = `${genre.color}30`
              }}
            >
              <span
                className="text-3xl font-black mb-2"
                style={{ color: genre.color, fontFamily: 'var(--font-display)' }}
              >
                {genre.short}
              </span>
              <span className="text-xs font-semibold text-text-body leading-tight">{genre.name}</span>
              <span className="text-xs text-text-dim mt-1">{genre.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Casts ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-amber to-neon-pink flex-shrink-0" />
            <Sparkles size={16} className="text-neon-amber" />
            注目のキャスト
          </h2>
          <Link
            to="/casts"
            className="flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-cyan/70 transition-colors"
          >
            すべて見る <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {featured.map(cast => (
            <CastCard key={cast.id} cast={cast} />
          ))}
        </div>
      </section>

      {/* ── New Casts ────────────────────────────────────── */}
      {newCasts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">
              <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-pink to-neon-purple flex-shrink-0" />
              <span className="text-neon-pink">✦</span>
              新着キャスト
            </h2>
            <Link
              to="/casts"
              className="flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-cyan/70 transition-colors"
            >
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {newCasts.map(cast => (
              <CastCard key={cast.id} cast={cast} />
            ))}
          </div>
        </section>
      )}

      {/* ── Popular Tags ─────────────────────────────────── */}
      <section>
        <h2 className="section-title">
          <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-green to-neon-cyan flex-shrink-0" />
          <Tag size={16} className="text-neon-green" />
          人気タグ
        </h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map(tag => (
            <Link
              key={tag}
              to={`/casts?tag=${encodeURIComponent(tag)}`}
              className="text-sm px-4 py-1.5 rounded-full border transition-all duration-150 text-text-muted"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(0,212,255,0.35)'
                el.style.color = '#00d4ff'
                el.style.background = 'rgba(0,212,255,0.06)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.08)'
                el.style.color = ''
                el.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              # {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trends ───────────────────────────────────────── */}
      <section>
        <h2 className="section-title">
          <span className="w-0.5 h-5 rounded-full bg-gradient-to-b from-neon-amber to-neon-green flex-shrink-0" />
          <TrendingUp size={16} className="text-neon-amber" />
          ネット上でよく見られる傾向
        </h2>
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-5">
          <p className="text-xs text-text-dim mb-4 pb-3 border-b border-dark-600">
            ※ 以下はネット上で目にする傾向をまとめたものです。断定・保証するものではありません。
          </p>
          <ul className="space-y-2.5">
            {TRENDS.map((trend, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-body">
                <span className="text-neon-cyan/50 flex-shrink-0 mt-0.5 font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
