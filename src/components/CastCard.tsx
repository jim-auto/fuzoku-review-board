import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { Cast } from '../types'

const GENRE_SHORT: Record<string, string> = {
  'デリバリーヘルス': 'DH',
  'ソープランド': 'SP',
  'メンズエステ': 'ES',
  'イメクラ': 'IM',
  'オナクラ': 'OK',
  'キャバクラ': 'KY',
  'ラウンジ': 'LG',
  'セクシーキャバクラ': 'SK',
  'コンセプトカフェ': 'CC',
}

interface CastCardProps {
  cast: Cast
}

export default function CastCard({ cast }: CastCardProps) {
  return (
    <Link to={`/casts/${cast.id}`} className="block group outline-none">
      <div
        className="card-base overflow-hidden h-full flex flex-col"
        style={
          {
            '--accent': cast.accentColor,
          } as React.CSSProperties
        }
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${cast.accentColor}50`
          el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${cast.accentColor}15`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = ''
          el.style.boxShadow = ''
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full flex-shrink-0" style={{ background: cast.accentColor }} />

        <div className="p-4 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
              style={{
                border: `1px solid ${cast.accentColor}40`,
                boxShadow: `0 0 12px ${cast.accentColor}20`,
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
                  className="w-full h-full flex items-center justify-center text-2xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${cast.accentColor}18, ${cast.accentColor}45)`,
                    color: cast.accentColor,
                    fontFamily: 'var(--font-display)',
                    textShadow: `0 0 12px ${cast.accentColor}80`,
                  }}
                >
                  {cast.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                {cast.isNew && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-neon-pink/15 text-neon-pink border border-neon-pink/30 font-medium leading-none">
                    NEW
                  </span>
                )}
                <span className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-text-dim border border-dark-500 leading-none">
                  {GENRE_SHORT[cast.genre] ?? cast.genre}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-neon-amber/10 text-neon-amber border border-neon-amber/30 font-medium leading-none">
                  DEMO
                </span>
              </div>

              {/* Name */}
              <h3
                className="font-bold text-base leading-tight text-text-bright group-hover:text-neon-cyan transition-colors truncate"
              >
                {cast.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-text-dim flex-shrink-0" />
                <span className="text-xs text-text-muted truncate">
                  {cast.area} · {cast.shop}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {cast.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-text-muted border border-dark-500 leading-none"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats footer */}
          <div className="mt-auto flex items-center gap-3 pt-3 border-t border-dark-600">
            <span className="text-xs text-text-muted">{cast.age}歳</span>
            <span className="text-xs text-text-muted">{cast.height}cm</span>
            <span
              className="text-xs font-semibold ml-auto"
              style={{ color: cast.accentColor }}
            >
              {cast.style}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
