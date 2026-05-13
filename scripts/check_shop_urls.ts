import * as fs from 'node:fs'

interface Shop {
  id: string
  name: string
  url: string
  source?: {
    url?: string
  }
}

interface UrlResult {
  url: string
  status?: number
  ok: boolean
  warning: boolean
  message: string
}

const TIMEOUT_MS = 30_000
const CONCURRENCY = 6
const ALLOW_NETWORK_FAILURES = process.env.ALLOW_URL_NETWORK_FAILURES === '1'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

async function checkUrl(url: string): Promise<UrlResult> {
  try {
    const response = await fetchWithTimeout(url, 'HEAD')

    if (response.status >= 200 && response.status < 400) {
      return { url, status: response.status, ok: true, warning: false, message: 'OK' }
    }
    if ([403, 405, 429].includes(response.status)) {
      return { url, status: response.status, ok: true, warning: true, message: 'blocked or HEAD not allowed' }
    }
    return { url, status: response.status, ok: false, warning: false, message: 'bad status' }
  } catch (headError) {
    try {
      const response = await fetchWithTimeout(url, 'GET')

      if (response.status >= 200 && response.status < 400) {
        return { url, status: response.status, ok: true, warning: false, message: 'OK via GET' }
      }
      if ([403, 405, 429].includes(response.status)) {
        return { url, status: response.status, ok: true, warning: true, message: 'blocked' }
      }
      return { url, status: response.status, ok: false, warning: false, message: 'bad status via GET' }
    } catch (getError) {
      const reason = getError instanceof Error ? getError.message : String(getError)
      const headReason = headError instanceof Error ? headError.message : String(headError)
      if (ALLOW_NETWORK_FAILURES) {
        return { url, ok: true, warning: true, message: `${headReason}; GET: ${reason}` }
      }
      return { url, ok: false, warning: false, message: `${headReason}; GET: ${reason}` }
    }
  }
}

async function fetchWithTimeout(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6',
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

const shops = JSON.parse(fs.readFileSync('src/data/shops.json', 'utf-8')) as Shop[]
const urls = unique(shops.flatMap(shop => [shop.url, shop.source?.url].filter(Boolean) as string[]))

const results: UrlResult[] = new Array(urls.length)
let nextIndex = 0

async function worker(): Promise<void> {
  while (nextIndex < urls.length) {
    const currentIndex = nextIndex
    nextIndex += 1
    results[currentIndex] = await checkUrl(urls[currentIndex])
  }
}

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()),
)

for (const result of results) {
  const label = result.ok ? (result.warning ? 'WARN' : 'OK') : 'FAIL'
  const status = result.status ? ` ${result.status}` : ''
  console.log(`${label}${status} ${result.url} ${result.warning ? `(${result.message})` : ''}`)
}

const failures = results.filter(result => !result.ok)
const warnings = results.filter(result => result.warning)

console.log(`Checked ${results.length} URLs: ${failures.length} failed, ${warnings.length} warnings`)

if (failures.length > 0) {
  console.error('Failed URLs:')
  for (const failure of failures) {
    console.error(`- ${failure.url}: ${failure.message}`)
  }
  process.exit(1)
}
