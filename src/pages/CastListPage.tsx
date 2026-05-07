import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
import castsData from '../data/casts.json'
import type { Cast, FilterState } from '../types'
import CastCard from '../components/CastCard'
import FilterPanel from '../components/FilterPanel'
import SearchBar from '../components/SearchBar'

const allCasts = castsData as Cast[]

type SortKey = 'default' | 'age_asc' | 'age_desc' | 'name_asc' | 'height_asc' | 'new_first'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'new_first', label: 'NEW優先' },
  { value: 'age_asc', label: '年齢が若い順' },
  { value: 'age_desc', label: '年齢が高い順' },
  { value: 'height_asc', label: '身長が低い順' },
  { value: 'name_asc', label: '名前順（A→Z）' },
]

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

function applySort(casts: Cast[], sort: SortKey): Cast[] {
  const arr = [...casts]
  switch (sort) {
    case 'age_asc': return arr.sort((a, b) => a.age - b.age)
    case 'age_desc': return arr.sort((a, b) => b.age - a.age)
    case 'height_asc': return arr.sort((a, b) => a.height - b.height)
    case 'name_asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'new_first': return arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    default: return arr
  }
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

  const [sort, setSort] = useState<SortKey>('default')
  const [sortOpen, setSortOpen] = useState(false)

  const filtered = useMemo(() => applyFilter(allCasts, filter), [filter])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'デフォルト'

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
        <span className="text-sm text-text-dim">{sorted.length}名表示</span>
      </div>

      {/* Search */}
      <SearchBar value={filter.search} onChange={search => setFilter(f => ({ ...f, search }))} />

      {/* Filters + Sort row */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <FilterPanel
            filter={filter}
            onChange={setFilter}
            totalCount={allCasts.length}
            filteredCount={sorted.length}
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-dark-800 border border-dark-500 text-sm text-text-body hover:bg-dark-700/50 transition-colors"
          >
            <ArrowUpDown size={14} className="text-neon-cyan" />
            <span className="hidden sm:inline text-text-muted text-xs">{currentSortLabel}</span>
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-dark-800 border border-dark-500 rounded-xl overflow-hidden shadow-2xl min-w-40">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-dark-700 ${sort === opt.value ? 'text-neon-cyan' : 'text-text-body'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
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
          {sorted.map(cast => (
            <CastCard key={cast.id} cast={cast} />
          ))}
        </div>
      )}
    </div>
  )
}
