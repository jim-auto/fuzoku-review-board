import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpDown, Sun } from 'lucide-react'
import shopsData from '../data/shops.json'
import type { Shop } from '../types'
import ShopCard from '../components/ShopCard'
import SearchBar from '../components/SearchBar'

const allShops = shopsData as Shop[]

const AREAS = ['東京', '大阪', '名古屋', '横浜', '福岡', '札幌']
const GENRES = [
  'デリバリーヘルス', 'ソープランド', 'メンズエステ', 'イメクラ', 'オナクラ',
  'キャバクラ', 'ラウンジ', 'セクシーキャバクラ', 'コンセプトカフェ',
]

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff', '大阪': '#ff2d78', '名古屋': '#b44fff',
  '横浜': '#ffaa00', '福岡': '#00ff9f', '札幌': '#4488ff',
}

const GENRE_COLORS: Record<string, string> = {
  'デリバリーヘルス': '#ff2d78', 'ソープランド': '#b44fff', 'メンズエステ': '#00ff9f',
  'イメクラ': '#ffaa00', 'オナクラ': '#00d4ff', 'キャバクラ': '#f0c040',
  'ラウンジ': '#9966ff', 'セクシーキャバクラ': '#ff4499', 'コンセプトカフェ': '#00ccaa',
}

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'morning'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'price_asc', label: '料金が安い順' },
  { value: 'price_desc', label: '料金が高い順' },
  { value: 'morning', label: '朝活対応優先' },
]

interface ShopFilter {
  area: string
  genre: string
  morning: boolean
  search: string
}

const DEFAULT_FILTER: ShopFilter = { area: '', genre: '', morning: false, search: '' }

function applyFilter(shops: Shop[], f: ShopFilter): Shop[] {
  return shops.filter(s => {
    if (f.area && s.area !== f.area) return false
    if (f.genre && s.genre !== f.genre) return false
    if (f.morning && !s.morning.available) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      const match =
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })
}

function applySort(shops: Shop[], sort: SortKey): Shop[] {
  const arr = [...shops]
  switch (sort) {
    case 'price_asc': return arr.sort((a, b) => a.price.min - b.price.min)
    case 'price_desc': return arr.sort((a, b) => b.price.min - a.price.min)
    case 'morning': return arr.sort((a, b) => (b.morning.available ? 1 : 0) - (a.morning.available ? 1 : 0))
    default: return arr
  }
}

export default function ShopListPage() {
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<ShopFilter>(() => ({
    ...DEFAULT_FILTER,
    area: searchParams.get('area') ?? '',
    genre: searchParams.get('genre') ?? '',
    search: searchParams.get('q') ?? '',
  }))
  const [sort, setSort] = useState<SortKey>('default')
  const [sortOpen, setSortOpen] = useState(false)

  const filtered = useMemo(() => applyFilter(allShops, filter), [filter])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Search */}
      <SearchBar
        value={filter.search}
        onChange={q => setFilter(f => ({ ...f, search: q }))}
        placeholder="店舗名・ジャンル・タグで検索..."
      />

      {/* Area filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(f => ({ ...f, area: '' }))}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !filter.area
              ? 'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan'
              : 'border-dark-500 text-text-dim hover:text-text-body'
          }`}
        >すべてのエリア</button>
        {AREAS.map(area => {
          const color = AREA_COLORS[area]
          const active = filter.area === area
          return (
            <button
              key={area}
              onClick={() => setFilter(f => ({ ...f, area: active ? '' : area }))}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={active
                ? { background: `${color}15`, borderColor: `${color}50`, color }
                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
              }
            >
              {area}
            </button>
          )
        })}
      </div>

      {/* Genre filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(f => ({ ...f, genre: '' }))}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !filter.genre
              ? 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple'
              : 'border-dark-500 text-text-dim hover:text-text-body'
          }`}
        >すべてのジャンル</button>
        {GENRES.map(genre => {
          const color = GENRE_COLORS[genre]
          const active = filter.genre === genre
          return (
            <button
              key={genre}
              onClick={() => setFilter(f => ({ ...f, genre: active ? '' : genre }))}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={active
                ? { background: `${color}15`, borderColor: `${color}50`, color }
                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
              }
            >
              {genre}
            </button>
          )
        })}
      </div>

      {/* Sub-filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Morning toggle */}
        <button
          onClick={() => setFilter(f => ({ ...f, morning: !f.morning }))}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
          style={filter.morning
            ? { background: 'rgba(255,170,0,0.12)', borderColor: 'rgba(255,170,0,0.4)', color: '#ffaa00' }
            : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
          }
        >
          <Sun size={11} />朝活対応のみ
        </button>

        <div className="flex-1" />

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dark-500 text-text-muted hover:text-text-body transition-colors"
          >
            <ArrowUpDown size={11} />
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border border-dark-500 rounded-xl shadow-xl overflow-hidden z-20">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-dark-700 ${
                    sort === opt.value ? 'text-neon-cyan' : 'text-text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-dim">
          <span className="text-text-bright font-bold">{sorted.length}</span> 件の店舗
        </span>
        {(filter.area || filter.genre || filter.morning || filter.search) && (
          <button
            onClick={() => setFilter(DEFAULT_FILTER)}
            className="text-xs text-text-dim hover:text-neon-cyan transition-colors underline underline-offset-2"
          >
            フィルターをリセット
          </button>
        )}
      </div>

      {/* Shop grid */}
      {sorted.length === 0 ? (
        <div className="py-20 text-center text-text-dim opacity-50">
          <div className="text-4xl mb-3">🏪</div>
          条件に合う店舗が見つかりませんでした
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(shop => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}
