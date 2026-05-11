import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpDown, Banknote, ChevronDown, CircleCheck, Sun, X } from 'lucide-react'
import shopsData from '../data/shops.json'
import type { Shop } from '../types'
import ShopCard from '../components/ShopCard'
import SearchBar from '../components/SearchBar'
import { getDiscountPrice } from '../utils/pricing'
import { AREA_COLORS, AREA_NAMES, GENRE_COLORS, GENRE_NAMES, REGION_GROUPS } from '../constants/taxonomy'

const allShops = shopsData as Shop[]

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'discount_asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'price_asc', label: '料金が安い順' },
  { value: 'price_desc', label: '料金が高い順' },
  { value: 'discount_asc', label: '割引後の最安順' },
]

const PRICE_RANGES = [
  { value: '10000', label: '〜10,000円', max: 10000 },
  { value: '15000', label: '〜15,000円', max: 15000 },
  { value: '20000', label: '〜20,000円', max: 20000 },
  { value: '30000', label: '〜30,000円', max: 30000 },
  { value: '50000', label: '〜50,000円', max: 50000 },
  { value: '80000', label: '〜80,000円', max: 80000 },
]

const RESERVATION_METHODS = ['LINE', 'Web予約', '電話', 'Twitter DM']

const REGION_SHORTCUTS = [
  {
    region: '東京',
    items: [
      { label: '吉原ソープ', area: '東京', genre: 'ソープランド', search: '吉原', desc: '総額・営業時間つきで比較' },
      { label: '都内メンズエステ', area: '東京', genre: 'メンズエステ', search: '', desc: '錦糸町・日本橋・麻布など' },
    ],
  },
  {
    region: '東海',
    items: [
      { label: '名古屋メンズエステ', area: '名古屋', genre: 'メンズエステ', search: '', desc: '名駅・伏見周辺を中心に比較' },
      { label: '岐阜金津園ソープ', area: '岐阜', genre: 'ソープランド', search: '金津園', desc: '金津園の総額目安を比較' },
    ],
  },
] as const

interface ShopFilter {
  region: string
  area: string
  genre: string
  priceMax: string
  reservation: string
  discount: boolean
  morning: boolean
  ns: boolean
  nn: boolean
  search: string
}

interface RecommendationCard {
  key: string
  label: string
  shop: Shop
  price: string
  detail: string
  color: string
  actionLabel?: string
  action?: () => void
}

const DEFAULT_FILTER: ShopFilter = {
  region: '',
  area: '',
  genre: '',
  priceMax: '',
  reservation: '',
  discount: false,
  morning: false,
  ns: false,
  nn: false,
  search: '',
}

function getComparablePrice(shop: Shop): number {
  const discount = getDiscountPrice(shop)
  return discount.isEstimateValid ? discount.discountedMin : shop.price.min
}

function applyFilter(shops: Shop[], f: ShopFilter): Shop[] {
  const region = REGION_GROUPS.find(group => group.name === f.region)
  return shops.filter(s => {
    if (region && !region.areas.includes(s.area)) return false
    if (f.area && s.area !== f.area) return false
    if (f.genre && s.genre !== f.genre) return false
    if (f.priceMax && getComparablePrice(s) > Number(f.priceMax)) return false
    if (f.reservation && !s.reservation.includes(f.reservation)) return false
    if (f.discount && !getDiscountPrice(s).hasAmount) return false
    if (f.morning && !s.morning.available) return false
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

function formatYen(value: number): string {
  return `¥${value.toLocaleString()}`
}

function getCheapest(shops: Shop[]): Shop | undefined {
  return [...shops].sort((a, b) => a.price.min - b.price.min)[0]
}

function getCheapestDiscount(shops: Shop[]): Shop | undefined {
  return [...shops]
    .filter(shop => getDiscountPrice(shop).isEstimateValid)
    .sort((a, b) => getDiscountPrice(a).discountedMin - getDiscountPrice(b).discountedMin)[0]
}

function getCheapestMorning(shops: Shop[]): Shop | undefined {
  return [...shops]
    .filter(shop => shop.morning.available)
    .sort((a, b) => a.price.min - b.price.min)[0]
}

export default function ShopListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortParam = searchParams.get('sort')
  const sort: SortKey = SORT_OPTIONS.some(option => option.value === sortParam) ? sortParam as SortKey : 'default'
  const filter = useMemo<ShopFilter>(() => ({
    ...DEFAULT_FILTER,
    region: searchParams.get('region') ?? '',
    area: searchParams.get('area') ?? '',
    genre: searchParams.get('genre') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    reservation: searchParams.get('reservation') ?? '',
    discount: searchParams.get('discount') === '1',
    morning: searchParams.get('morning') === '1',
    ns: searchParams.get('ns') === '1',
    nn: searchParams.get('nn') === '1',
    search: searchParams.get('q') ?? '',
  }), [searchParams])
  const [sortOpen, setSortOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    Boolean(searchParams.get('genre') || searchParams.get('reservation') || searchParams.get('ns') || searchParams.get('nn')),
  )

  const filtered = useMemo(() => applyFilter(allShops, filter), [filter])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])
  const cheapestShop = useMemo(() => getCheapest(filtered), [filtered])
  const cheapestDiscountShop = useMemo(() => getCheapestDiscount(filtered), [filtered])
  const cheapestMorningShop = useMemo(() => getCheapestMorning(filtered), [filtered])
  const activeRegionShortcuts = REGION_SHORTCUTS.find(group => group.region === filter.region)?.items ?? []
  const discountCount = allShops.filter(shop => getDiscountPrice(shop).hasAmount).length
  const morningCount = allShops.filter(shop => shop.morning.available).length

  const updateFilter = (updater: (current: ShopFilter) => ShopFilter, nextSort: SortKey = sort) => {
    const next = updater(filter)
    const params = new URLSearchParams()
    if (next.region) params.set('region', next.region)
    if (next.area) params.set('area', next.area)
    if (next.genre) params.set('genre', next.genre)
    if (next.priceMax) params.set('priceMax', next.priceMax)
    if (next.reservation) params.set('reservation', next.reservation)
    if (next.discount) params.set('discount', '1')
    if (next.morning) params.set('morning', '1')
    if (next.ns) params.set('ns', '1')
    if (next.nn) params.set('nn', '1')
    if (next.search) params.set('q', next.search)
    if (nextSort !== 'default') params.set('sort', nextSort)
    setSearchParams(params, { replace: true })
  }

  const updateSort = (nextSort: SortKey) => {
    const params = new URLSearchParams(searchParams)
    if (nextSort === 'default') {
      params.delete('sort')
    } else {
      params.set('sort', nextSort)
    }
    setSearchParams(params, { replace: true })
  }

  const recommendationCandidates: Array<RecommendationCard | undefined> = [
    cheapestShop && {
      key: 'cheapest',
      label: 'この条件の最安',
      shop: cheapestShop,
      price: formatYen(cheapestShop.price.min),
      detail: cheapestShop.price.unit,
      color: '#00d4ff',
    },
    cheapestDiscountShop && {
      key: 'discount',
      label: '割引後の最安',
      shop: cheapestDiscountShop,
      price: formatYen(getDiscountPrice(cheapestDiscountShop).discountedMin),
      detail: getDiscountPrice(cheapestDiscountShop).label ?? cheapestDiscountShop.price.unit,
      color: '#00ff9f',
      actionLabel: '割引で並べる',
      action: () => updateFilter(f => ({ ...f, discount: true }), 'discount_asc'),
    },
    cheapestMorningShop && {
      key: 'morning',
      label: '朝活の最安',
      shop: cheapestMorningShop,
      price: formatYen(cheapestMorningShop.price.min),
      detail: cheapestMorningShop.morning.hours ?? cheapestMorningShop.price.unit,
      color: '#ffaa00',
      actionLabel: '朝活で絞る',
      action: () => updateFilter(f => ({ ...f, morning: true }), 'price_asc'),
    },
  ]
  const recommendationCards = recommendationCandidates.filter((item): item is RecommendationCard => Boolean(item))

  const activeFilters = [
    filter.region && { key: 'region', label: filter.region, clear: () => updateFilter(f => ({ ...f, region: '' })) },
    filter.area && { key: 'area', label: filter.area, clear: () => updateFilter(f => ({ ...f, area: '' })) },
    filter.genre && { key: 'genre', label: filter.genre, clear: () => updateFilter(f => ({ ...f, genre: '' })) },
    filter.priceMax && {
      key: 'priceMax',
      label: PRICE_RANGES.find(r => r.value === filter.priceMax)?.label ?? `〜${Number(filter.priceMax).toLocaleString()}円`,
      clear: () => updateFilter(f => ({ ...f, priceMax: '' })),
    },
    filter.reservation && { key: 'reservation', label: filter.reservation, clear: () => updateFilter(f => ({ ...f, reservation: '' })) },
    filter.discount && { key: 'discount', label: '割引あり', clear: () => updateFilter(f => ({ ...f, discount: false })) },
    filter.morning && { key: 'morning', label: '朝活・早い時間', clear: () => updateFilter(f => ({ ...f, morning: false })) },
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

      {/* Priority regions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REGION_GROUPS.map(region => {
          const active = filter.region === region.name
          const count = allShops.filter(shop => region.areas.includes(shop.area)).length
          return (
            <button
              key={region.name}
              onClick={() => updateFilter(f => ({ ...f, region: active ? '' : region.name, area: '' }))}
              className="text-left rounded-xl border p-4 transition-all hover:-translate-y-0.5"
              style={active
                ? { background: `${region.color}14`, borderColor: `${region.color}60`, boxShadow: `0 8px 28px ${region.color}12` }
                : { background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold" style={{ color: region.color }}>{region.name}</div>
                  <div className="text-xs text-text-dim mt-1">{region.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-text-bright">{count}</div>
                  <div className="text-xs text-text-dim">店舗</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {region.areas.map(area => (
                  <span
                    key={area}
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: AREA_COLORS[area], borderColor: `${AREA_COLORS[area]}40`, background: `${AREA_COLORS[area]}10` }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {activeRegionShortcuts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeRegionShortcuts.map(shortcut => {
            const color = GENRE_COLORS[shortcut.genre]
            const active =
              filter.area === shortcut.area &&
              filter.genre === shortcut.genre &&
              filter.search === shortcut.search
            const count = allShops.filter(shop =>
              shop.area === shortcut.area &&
              shop.genre === shortcut.genre &&
              (!shortcut.search ||
                shop.name.includes(shortcut.search) ||
                shop.description.includes(shortcut.search) ||
                shop.tags.some(tag => tag.includes(shortcut.search))),
            ).length
            return (
              <button
                key={shortcut.label}
                onClick={() => updateFilter(f => ({
                  ...f,
                  region: filter.region,
                  area: shortcut.area,
                  genre: shortcut.genre,
                  search: shortcut.search,
                }))}
                className="text-left rounded-xl border p-3 transition-all hover:-translate-y-0.5"
                style={active
                  ? { background: `${color}14`, borderColor: `${color}60`, boxShadow: `0 8px 24px ${color}12` }
                  : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold" style={{ color }}>{shortcut.label}</div>
                    <div className="text-xs text-text-dim mt-1">{shortcut.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-text-bright">{count}</div>
                    <div className="text-xs text-text-dim">件</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => updateFilter(f => ({ ...f, discount: !f.discount }), 'discount_asc')}
          className="text-left rounded-xl border p-3 transition-all hover:-translate-y-0.5"
          style={filter.discount
            ? { background: 'rgba(0,255,159,0.12)', borderColor: 'rgba(0,255,159,0.5)', boxShadow: '0 8px 24px rgba(0,255,159,0.1)' }
            : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-neon-green">
                <Banknote size={14} />割引で安く
              </div>
              <div className="text-xs text-text-dim mt-1">割引額が明記されている店だけ表示</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-text-bright">{discountCount}</div>
              <div className="text-xs text-text-dim">件</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => updateFilter(f => ({ ...f, morning: !f.morning }), 'price_asc')}
          className="text-left rounded-xl border p-3 transition-all hover:-translate-y-0.5"
          style={filter.morning
            ? { background: 'rgba(255,170,0,0.12)', borderColor: 'rgba(255,170,0,0.5)', boxShadow: '0 8px 24px rgba(255,170,0,0.1)' }
            : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-neon-amber">
                <Sun size={14} />朝活・早い時間
              </div>
              <div className="text-xs text-text-dim mt-1">朝営業や朝の特典がある店を探す</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-text-bright">{morningCount}</div>
              <div className="text-xs text-text-dim">件</div>
            </div>
          </div>
        </button>
      </div>

      {/* Primary filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(f => ({ ...f, region: '', area: '' }))}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !filter.region && !filter.area
              ? 'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan'
              : 'border-dark-500 text-text-dim hover:text-text-body'
          }`}
        >すべてのエリア</button>
        {AREA_NAMES.map(area => {
          const color = AREA_COLORS[area]
          const active = filter.area === area
          return (
            <button
              key={area}
              onClick={() => updateFilter(f => ({ ...f, region: '', area: active ? '' : area }))}
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
                  onClick={() => { updateSort(opt.value); setSortOpen(false) }}
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
              {GENRE_NAMES.map(genre => {
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

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {recommendationCards.map(item => (
            <div
              key={item.key}
              className="rounded-xl border p-3"
              style={{ background: `${item.color}0c`, borderColor: `${item.color}30` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</div>
                  <Link
                    to={`/shops/${item.shop.id}`}
                    className="block text-sm font-bold text-text-bright mt-1 truncate hover:text-white transition-colors"
                  >
                    {item.shop.name}
                  </Link>
                  <div className="text-xs text-text-dim mt-1 truncate">{item.detail}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-text-bright">{item.price}</div>
                  <div className="text-xs text-text-dim">{item.shop.area}</div>
                </div>
              </div>
              {'action' in item && item.action && (
                <button
                  onClick={item.action}
                  className="text-xs font-semibold mt-3 transition-colors hover:text-white"
                  style={{ color: item.color }}
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-dim">
          <span className="text-text-bright font-bold">{sorted.length}</span> 件の店舗
        </span>
        {(filter.region || filter.area || filter.genre || filter.priceMax || filter.reservation || filter.discount || filter.morning || filter.ns || filter.nn || filter.search) && (
          <button
            onClick={() => updateFilter(() => DEFAULT_FILTER, 'default')}
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
