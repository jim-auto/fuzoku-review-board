import * as fs from 'node:fs'

interface Shop {
  id: string
  name: string
  area: string
  genre: string
  url: string
  source?: {
    label?: string
    url?: string
    checkedAt?: string
  }
  price?: {
    min?: number
    max?: number
    unit?: string
  }
  hours?: string
  reservation?: string[]
}

const VALID_AREAS = new Set(['東京', '大阪', '名古屋', '岐阜', '横浜', '福岡', '札幌'])
const FORBIDDEN_PATTERNS = [
  /example\.com/i,
  /架空/,
  /サンプル/,
  /\bDEMO\b/i,
  /デモ/,
]

function fail(message: string): never {
  console.error(`ERROR: ${message}`)
  process.exit(1)
}

function warn(message: string) {
  console.warn(`WARN: ${message}`)
}

function assertUnique(shops: Shop[], key: keyof Shop) {
  const seen = new Map<string, string>()
  for (const shop of shops) {
    const value = String(shop[key] ?? '').trim()
    if (!value) fail(`${shop.id || '(no id)'} is missing ${String(key)}`)
    const firstId = seen.get(value)
    if (firstId) fail(`duplicate ${String(key)} "${value}" in ${firstId} and ${shop.id}`)
    seen.set(value, shop.id)
  }
}

function includesForbiddenText(shop: Shop): string | undefined {
  const text = JSON.stringify(shop)
  return FORBIDDEN_PATTERNS.find(pattern => pattern.test(text))?.source
}

const shops = JSON.parse(fs.readFileSync('src/data/shops.json', 'utf-8')) as Shop[]

if (!Array.isArray(shops)) fail('src/data/shops.json must be an array')
if (shops.length === 0) fail('shops.json is empty')

assertUnique(shops, 'id')
assertUnique(shops, 'name')
assertUnique(shops, 'url')

const areaCounts = new Map<string, number>()

for (const shop of shops) {
  if (!VALID_AREAS.has(shop.area)) fail(`${shop.id} has invalid area "${shop.area}"`)
  areaCounts.set(shop.area, (areaCounts.get(shop.area) ?? 0) + 1)

  if (!shop.genre) fail(`${shop.id} is missing genre`)
  if (!shop.url.startsWith('https://')) fail(`${shop.id} url must be https`)
  if (!shop.source?.label) fail(`${shop.id} is missing source.label`)
  if (!shop.source?.url?.startsWith('https://')) fail(`${shop.id} source.url must be https`)
  if (!shop.source?.checkedAt?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    fail(`${shop.id} source.checkedAt must be YYYY-MM-DD`)
  }
  if (!shop.price?.min || shop.price.min <= 0) fail(`${shop.id} is missing positive price.min`)
  if (!shop.price?.max || shop.price.max <= 0) fail(`${shop.id} is missing positive price.max`)
  if (shop.price.max < shop.price.min) fail(`${shop.id} price.max is lower than price.min`)
  if (!shop.price.unit) fail(`${shop.id} is missing price.unit`)
  if (!shop.hours) fail(`${shop.id} is missing hours`)
  if (!Array.isArray(shop.reservation) || shop.reservation.length === 0) {
    fail(`${shop.id} must have at least one reservation method`)
  }

  const forbidden = includesForbiddenText(shop)
  if (forbidden) fail(`${shop.id} includes forbidden pattern /${forbidden}/`)
}

for (const area of VALID_AREAS) {
  const count = areaCounts.get(area) ?? 0
  if (count < 10) warn(`${area} has only ${count} shops`)
}

console.log(`OK: ${shops.length} shops validated`)
console.log(
  [...areaCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ja'))
    .map(([area, count]) => `${area}:${count}`)
    .join(' '),
)
