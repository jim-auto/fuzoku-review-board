import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import castsData from '../data/casts.json'
import type { Cast, FilterState } from '../types'
import CastCard from '../components/CastCard'
import FilterPanel from '../components/FilterPanel'
import SearchBar from '../components/SearchBar'

const allCasts = castsData as Cast[]

const DEFAULT_FILTER: FilterState = {
  area: '',
  genre: '',
  style: '',
  tags: [],
  search: '',
  ageMin: '',
  ageMax: '',
}

function applyFilter(casts: Cast[], f: FilterState): Cast[] {
  return casts.filter(c => {
    if (f.area && c.area !== f.area) return false
    if (f.genre && c.genre !== f.genre) return false
    if (f.style && c.style !== f.style) return false
    if (f.tags.length > 0 && !f.tags.some(t => c.tags.includes(t))) return false
    if (f.ageMin && c.age < Number(f.ageMin)) return false
    if (f.ageMax && c.age > Number(f.ageMax)) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      const match =
        c.name.toLowerCase().includes(q) ||
        c.shop.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.genre.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })
}

export default function CastListPage() {
  const [searchParams] = useSearchParams()

  const [filter, setFilter] = useState<FilterState>({
    ...DEFAULT_FILTER,
    area: searchParams.get('area') ?? '',
    genre: searchParams.get('genre') ?? '',
    search: searchParams.get('q') ?? '',
    tags: searchParams.get('tag') ? [searchParams.get('tag')!] : [],
  })

  const filtered = useMemo(() => applyFilter(allCasts, filter), [filter])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between py-2">
        <h1
          className="text-xl font-black text-text-bright tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CAST LIST
        </h1>
        <span className="text-sm text-text-dim">{filtered.length}名表示</span>
      </div>

      {/* Search */}
      <SearchBar value={filter.search} onChange={search => setFilter(f => ({ ...f, search }))} />

      {/* Filters */}
      <FilterPanel
        filter={filter}
        onChange={setFilter}
        totalCount={allCasts.length}
        filteredCount={filtered.length}
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl opacity-30">🔍</div>
          <p className="text-text-muted text-sm">条件に一致するキャストが見つかりませんでした</p>
          <button
            onClick={() => setFilter(DEFAULT_FILTER)}
            className="text-xs text-neon-cyan hover:underline transition-colors"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(cast => (
            <CastCard key={cast.id} cast={cast} />
          ))}
        </div>
      )}
    </div>
  )
}
