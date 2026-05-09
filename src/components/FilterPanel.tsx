import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import type { FilterState } from '../types'
import { AREA_COLORS, AREA_NAMES, GENRE_NAMES } from '../constants/taxonomy'

const STYLES = ['かわいい系', 'キレイ系', 'ギャル系', 'お姉さん系', '癒し系', 'ロリ系']

interface FilterPanelProps {
  filter: FilterState
  onChange: (f: FilterState) => void
  totalCount: number
  filteredCount: number
}

export default function FilterPanel({
  filter,
  onChange,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  const hasActive =
    filter.area || filter.genre || filter.style || filter.tags.length > 0 || filter.ageMin || filter.ageMax

  const reset = () =>
    onChange({ area: '', genre: '', style: '', tags: [], search: filter.search, ageMin: '', ageMax: '' })

  const toggle = (key: 'area' | 'genre' | 'style', val: string) =>
    onChange({ ...filter, [key]: filter[key] === val ? '' : val })

  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-neon-cyan" />
          <span className="text-sm font-medium text-text-body">絞り込み</span>
          {hasActive && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#ff2d78', boxShadow: '0 0 6px #ff2d78' }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dim">
            {filteredCount} / {totalCount} 名
          </span>
          <ChevronDown
            size={15}
            className={`text-text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Filter body */}
      {open && (
        <div className="border-t border-dark-600 px-4 py-4 space-y-5">
          {/* Area */}
          <FilterGroup label="エリア">
            {AREA_NAMES.map(a => (
              <button
                key={a}
                onClick={() => toggle('area', a)}
                className="pill-btn"
                style={
                  filter.area === a
                    ? {
                        background: `${AREA_COLORS[a]}18`,
                        borderColor: `${AREA_COLORS[a]}70`,
                        color: AREA_COLORS[a],
                      }
                    : {}
                }
              >
                {a}
              </button>
            ))}
          </FilterGroup>

          {/* Genre */}
          <FilterGroup label="ジャンル">
            {GENRE_NAMES.map(g => (
              <button
                key={g}
                onClick={() => toggle('genre', g)}
                className={`pill-btn ${filter.genre === g ? 'active' : ''}`}
              >
                {g}
              </button>
            ))}
          </FilterGroup>

          {/* Style */}
          <FilterGroup label="スタイル">
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => toggle('style', s)}
                className="pill-btn"
                style={
                  filter.style === s
                    ? {
                        background: 'rgba(180,79,255,0.15)',
                        borderColor: 'rgba(180,79,255,0.55)',
                        color: '#b44fff',
                      }
                    : {}
                }
              >
                {s}
              </button>
            ))}
          </FilterGroup>

          {/* Age */}
          <FilterGroup label="年齢">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="下限"
                min={18}
                max={99}
                value={filter.ageMin}
                onChange={e => onChange({ ...filter, ageMin: e.target.value })}
                className="input-base w-20 px-2 py-1.5 text-sm rounded-lg text-center"
              />
              <span className="text-text-dim text-sm">〜</span>
              <input
                type="number"
                placeholder="上限"
                min={18}
                max={99}
                value={filter.ageMax}
                onChange={e => onChange({ ...filter, ageMax: e.target.value })}
                className="input-base w-20 px-2 py-1.5 text-sm rounded-lg text-center"
              />
              <span className="text-text-dim text-xs">歳</span>
            </div>
          </FilterGroup>

          {/* Reset */}
          {hasActive && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-neon-pink/70 hover:text-neon-pink transition-colors"
            >
              <X size={12} />
              フィルターをリセット
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-text-dim uppercase tracking-widest mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
