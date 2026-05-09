import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpDown, Banknote, ChevronDown, CircleCheck, X } from 'lucide-react'
import shopsData from '../data/shops.json'
import type { Shop } from '../types'
import ShopCard from '../components/ShopCard'
import SearchBar from '../components/SearchBar'
import { getDiscountPrice } from '../utils/pricing'

const allShops = shopsData as Shop[]

const AREAS = ['東京', '大阪', '名古屋', '岐阜', '横浜', '福岡', '札幌']
const GENRES = [
  'デリバリーヘルス', 'ソープランド', 'メンズエステ', 'イメクラ', 'オナクラ',
  'キャバクラ', 'ラウンジ', 'セクシーキャバクラ', 'コンセプトカフェ',
]

const AREA_COLORS: Record<string, string> = {
  '東京': '#00d4ff', '大阪': '#ff2d78', '名古屋': '#b44fff',
  '岐阜': '#66dd88',
  '横浜': '#ffaa00', '福岡': '#00ff9f', '札幌': '#4488ff',
}

const GENRE_COLORS: Record<string, string> = {
  'デリバリーヘルス': '#ff2d78', 'ソープランド': '#b44fff', 'メンズエステ': '#00ff9f',
  'イメクラ': '#ffaa00', 'オナクラ': '#00d4ff', 'キャバクラ': '#f0c040',
  'ラウンジ': '#9966ff', 'セクシーキャバクラ': '#ff4499', 'コンセプトカフェ': '#00ccaa',
}

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'discount_asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'price_asc', label: '料金が安い順' },
  { value: 'price_desc', label: '料金が高い順' },
  { value: 'discount_asc', label: '割引後の最安順' },
]

const PRICE_RANGES = [
  { value: '1000', label: '〜1,000円', max: 1000 },
  { value: '5000', label: '〜5,000円', max: 5000 },
  { value: '10000', label: '〜10,000円', max: 10000 },
  { value: '20000', label: '〜20,000円', max: 20000 },
]

const RESERVATION_METHODS = ['LINE', 'Web予約', '電話', 'Twitter DM']

interface ShopFilter {
  area: string
  genre: string
  priceMax: string
  reservation: string
  discount: boolean
  ns: boolean
  nn: boolean
  search: string
}

const DEFAULT_FILTER: ShopFilter = {
  area: '',
  genre: '',
  priceMax: '',
  reservation: '',
  discount: false,
  ns: false,
  nn: false,
  search: '',
}

function getComparablePrice(shop: Shop): number {
  const discount = getDiscountPrice(shop)
  return discount.isEstimateValid ? discount.discountedMin : shop.price.min
}

function applyFilter(shops: Shop[], f: ShopFilter): Shop[] {
  return shops.filter(s => {
    if (f.area && s.area !== f.area) return false
    if (f.genre && s.genre !== f.genre) return false
    if (f.priceMax && getComparablePrice(s) > Number(f.priceMax)) return false
    if (f.reservation && !s.reservation.includes(f.reservation)) return false
    if (f.discount && !getDiscountPrice(s).hasAmount) return false
    if (f.ns && s.options.ns !== true) return false
    if (f.nn && s.options.nn !== true) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      const match =
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        (s.morning.hours ?? '').toLowerCase().includes(q) ||
        (s.morning.discount ?? '').toLowerCase().includes(q) ||
        s.reservation.some(r => r.toLowerCase().includes(q)) ||
        s.options.extras.some(ex => ex.toLowerCase().includes(q)) ||
        (q === '割引' && getDiscountPrice(s).hasAmount) ||
        (q === '割引あり' && getDiscountPrice(s).hasAmount)
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
    case 'discount_asc': return arr.sort((a, b) => {
      const aDiscount = getDiscountPrice(a)
      const bDiscount = getDiscountPrice(b)
      if (aDiscount.isEstimateValid !== bDiscount.isEstimateValid) {
        return aDiscount.isEstimateValid ? -1 : 1
      }
      if (aDiscount.discountedMin !== bDiscount.discountedMin) {
        return aDiscount.discountedMin - bDiscount.discountedMin
      }
      return bDiscount.amount - aDiscount.amount
    })
    default: return arr
  }
}

export default function ShopListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = useMemo<ShopFilter>(() => ({
    ...DEFAULT_FILTER,
    area: searchParams.get('area') ?? '',
    genre: searchParams.get('genre') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    reservation: searchParams.get('reservation') ?? '',
    discount: searchParams.get('discount') === '1',
    ns: searchParams.get('ns') === '1',
    nn: searchParams.get('nn') === '1',
    search: searchParams.get('q') ?? '',
  }), [searchParams])
  const [sort, setSort] = useState<SortKey>('default')
  const [sortOpen, setSortOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    Boolean(searchParams.get('genre') || searchParams.get('reservation') || searchParams.get('ns') || searchParams.get('nn')),
  )

  const filtered = useMemo(() => applyFilter(allShops, filter), [filter])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const updateFilter = (updater: (current: ShopFilter) => ShopFilter) => {
    const next = updater(filter)
    const params = new URLSearchParams()
    if (next.area) params.set('area', next.area)
    if (next.genre) params.set('genre', next.genre)
    if (next.priceMax) params.set('priceMax', next.priceMax)
    if (next.reservation) params.set('reservation', next.reservation)
    if (next.discount) params.set('discount', '1')
    if (next.ns) params.set('ns', '1')
    if (next.nn) params.set('nn', '1')
    if (next.search) params.set('q', next.search)
    setSearchParams(params, { replace: true })
  }

  const activeFilters = [
    filter.area && { key: 'area', label: filter.area, clear: () => updateFilter(f => ({ ...f, area: '' })) },
    filter.genre && { key: 'genre', label: filter.genre, clear: () => updateFilter(f => ({ ...f, genre: '' })) },
    filter.priceMax && {
      key: 'priceMax',
      label: PRICE_RANGES.find(r => r.value === filter.priceMax)?.label ?? `〜${Number(filter.priceMax).toLocaleString()}円`,
      clear: () => updateFilter(f => ({ ...f, priceMax: '' })),
    },
    filter.reservation && { key: 'reservation', label: filter.reservation, clear: () => updateFilter(f => ({ ...f, reservation: '' })) },
    filter.discount && { key: 'discount', label: '割引あり', clear: () => updateFilter(f => ({ ...f, discount: false })) },
    filter.ns && { key: 'ns', label: 'NS対応', clear: () => updateFilter(f => ({ ...f, ns: false })) },
    filter.nn && { key: 'nn', label: 'NN対応', clear: () => updateFilter(f => ({ ...f, nn: false })) },
    filter.search && { key: 'search', label: `検索: ${filter.search}`, clear: () => updateFilter(f => ({ ...f, search: '' })) },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Search */}
      <SearchBar
        value={filter.search}
        onChange={q => updateFilter(f => ({ ...f, search: q }))}
        placeholder="店舗名・ジャンル・タグで検索..."
      />

      {/* Primary filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(f => ({ ...f, area: '' }))}
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
              onClick={() => updateFilter(f => ({ ...f, area: active ? '' : area }))}
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

      {/* Price filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(f => ({ ...f, priceMax: '' }))}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !filter.priceMax
              ? 'bg-neon-green/10 border-neon-green/40 text-neon-green'
              : 'border-dark-500 text-text-dim hover:text-text-body'
          }`}
        >すべての価格帯</button>
        {PRICE_RANGES.map(range => {
          const active = filter.priceMax === range.value
          return (
            <button
              key={range.value}
              onClick={() => updateFilter(f => ({ ...f, priceMax: active ? '' : range.value }))}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={active
                ? { background: 'rgba(0,255,159,0.1)', borderColor: 'rgba(0,255,159,0.4)', color: '#00ff9f' }
                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
              }
            >
              {range.label}
            </button>
          )
        })}
      </div>

      {/* Quick filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Discount toggle */}
        <button
          onClick={() => updateFilter(f => ({ ...f, discount: !f.discount }))}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
          style={filter.discount
            ? { background: 'rgba(0,255,159,0.1)', borderColor: 'rgba(0,255,159,0.35)', color: '#00ff9f' }
            : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
          }
        >
          <Banknote size={11} />割引ありのみ
        </button>

        <button
          onClick={() => setAdvancedOpen(open => !open)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dark-500 text-text-muted hover:text-text-body transition-colors"
        >
          詳細条件
          <ChevronDown size={12} className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
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

      {advancedOpen && (
        <div className="space-y-4 rounded-xl border border-dark-600 bg-dark-800/50 p-3">
          <div>
            <div className="text-xs font-semibold text-text-dim mb-2">ジャンル</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter(f => ({ ...f, genre: '' }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !filter.genre
                    ? 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple'
                    : 'border-dark-500 text-text-dim hover:text-text-body'
                }`}
              >すべて</button>
              {GENRES.map(genre => {
                const color = GENRE_COLORS[genre]
                const active = filter.genre === genre
                return (
                  <button
                    key={genre}
                    onClick={() => updateFilter(f => ({ ...f, genre: active ? '' : genre }))}
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
          </div>

          <div>
            <div className="text-xs font-semibold text-text-dim mb-2">予約方法</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter(f => ({ ...f, reservation: '' }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !filter.reservation
                    ? 'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan'
                    : 'border-dark-500 text-text-dim hover:text-text-body'
                }`}
              >すべて</button>
              {RESERVATION_METHODS.map(method => {
                const active = filter.reservation === method
                return (
                  <button
                    key={method}
                    onClick={() => updateFilter(f => ({ ...f, reservation: active ? '' : method }))}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all"
                    style={active
                      ? { background: 'rgba(0,212,255,0.1)', borderColor: 'rgba(0,212,255,0.4)', color: '#00d4ff' }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
                    }
                  >
                    {method}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-text-dim mb-2">サービス条件</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter(f => ({ ...f, ns: !f.ns }))}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
                style={filter.ns
                  ? { background: 'rgba(255,45,120,0.1)', borderColor: 'rgba(255,45,120,0.35)', color: '#ff2d78' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
                }
              >
                <CircleCheck size={11} />NS対応のみ
              </button>

              <button
                onClick={() => updateFilter(f => ({ ...f, nn: !f.nn }))}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
                style={filter.nn
                  ? { background: 'rgba(255,45,120,0.1)', borderColor: 'rgba(255,45,120,0.35)', color: '#ff2d78' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#888' }
                }
              >
                <CircleCheck size={11} />NN対応のみ
              </button>
            </div>
          </div>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-dim">適用中</span>
          {activeFilters.map(item => (
            <button
              key={item.key}
              onClick={item.clear}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-neon-cyan/25 bg-neon-cyan/5 text-neon-cyan hover:border-neon-cyan/50 transition-colors"
            >
              {item.label}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-dim">
          <span className="text-text-bright font-bold">{sorted.length}</span> 件の店舗
        </span>
        {(filter.area || filter.genre || filter.priceMax || filter.reservation || filter.discount || filter.ns || filter.nn || filter.search) && (
          <button
            onClick={() => updateFilter(() => DEFAULT_FILTER)}
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
