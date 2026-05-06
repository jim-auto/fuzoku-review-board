import * as fs from 'node:fs'
import * as path from 'node:path'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

const DELAY_MS = 1000

const AREA_KEYWORDS: Record<string, string> = {
  '東京': '東京', '新宿': '東京', '渋谷': '東京', '池袋': '東京', '上野': '東京',
  '錦糸町': '東京', '立川': '東京', '町田': '東京', '吉祥寺': '東京', '葛西': '東京',
  '新橋': '東京', '小岩': '東京', '吉原': '東京', '六本木': '東京', '秋葉原': '東京',
  '大阪': '大阪', '難波': '大阪', '梅田': '大阪', '心斎橋': '大阪', 'キタ': '大阪',
  '名古屋': '名古屋', '栄': '名古屋', '金山': '名古屋',
  '横浜': '横浜', '関内': '横浜', '川崎': '横浜',
  '福岡': '福岡', '博多': '福岡', '中洲': '福岡',
  '札幌': '札幌', 'すすきの': '札幌',
}

const GENRE_KEYWORDS: Record<string, string> = {
  'デリヘル': 'デリバリーヘルス', 'デリバリーヘルス': 'デリバリーヘルス',
  'ソープ': 'ソープランド', 'ソープランド': 'ソープランド',
  'メンズエステ': 'メンズエステ', 'メンエス': 'メンズエステ',
  'イメクラ': 'イメクラ', 'イメージクラブ': 'イメクラ',
  'オナクラ': 'オナクラ', '箱ヘル': 'デリバリーヘルス',
  'エステ': 'メンズエステ',
}

const STYLE_KEYWORDS: Record<string, string> = {
  'かわいい': 'かわいい系', '可愛い': 'かわいい系', 'ロリ': 'ロリ系',
  'キレイ': 'キレイ系', '美人': 'キレイ系', '綺麗': 'キレイ系',
  'ギャル': 'ギャル系', '姉': 'お姉さん系', 'お姉さん': 'お姉さん系',
  '癒し': '癒し系', '熟女': 'お姉さん系', 'スレンダー': 'キレイ系',
}

const ACCENT_COLORS = ['#ff2d78', '#00d4ff', '#00ff9f', '#b44fff', '#ffaa00', '#4488ff']

interface ScrapeConfig {
  name: string
  baseUrl: string
  listPages: string[]
  maxPages?: number
  selectors: {
    listItem: string
    name: string
    age: string
    height: string
    style: string
    shop: string
    area: string
    genre: string
    description: string
    tags: string
    detailLink: string
  }
}

function loadConfig(configPath: string): ScrapeConfig {
  const raw = fs.readFileSync(configPath, 'utf-8')
  return JSON.parse(raw) as ScrapeConfig
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractAge(text: string): number {
  const m = text.match(/(\d{2})\s*[歳才代]/)
  return m ? Number(m[1]) : 18 + Math.floor(Math.random() * 12)
}

function extractHeight(text: string): number {
  const m = text.match(/(\d{3})\s*cm/)
  return m ? Number(m[1]) : 150 + Math.floor(Math.random() * 20)
}

function guessArea(text: string): string {
  for (const [k, v] of Object.entries(AREA_KEYWORDS)) {
    if (text.includes(k)) return v
  }
  return '東京'
}

function guessGenre(text: string): string {
  for (const [k, v] of Object.entries(GENRE_KEYWORDS)) {
    if (text.includes(k)) return v
  }
  return 'デリバリーヘルス'
}

function guessStyle(text: string): string {
  for (const [k, v] of Object.entries(STYLE_KEYWORDS)) {
    if (text.includes(k)) return v
  }
  return 'かわいい系'
}

function extractTags(text: string): string[] {
  const tags = text
    .replace(/[【】[\]「」]/g, ' ')
    .split(/[,\s・]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && t.length <= 15)
    .slice(0, 6)

  if (tags.length === 0) return ['会話重視']
  return tags
}

function randomColor(): string {
  return ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
}

function sanitizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

interface RawExtract {
  name: string
  shop: string
  area: string
  genre: string
  title: string
  comment: string
  detailUrl: string
}

function parseTitle(title: string): { name: string; shop: string; area: string; rest: string } {
  // Remove numeric suffix like " 99" or " ⑲"
  const cleanedTitle = title.replace(/\s*[\d⑩-㊿➀-➈]+$/, '')
  const bracketPatterns = [
    /【(.+?)】/g,
    /\[(.+?)\]/g,
  ]

  let shop = ''
  let name = ''
  let area = ''

  // Extract all 【】 contents
  const brackets: string[] = []
  for (const p of bracketPatterns) {
    let m: RegExpExecArray | null
    while ((m = p.exec(title)) !== null) {
      brackets.push(m[1].trim())
    }
  }

  // Classify bracket contents
  for (const b of brackets) {
    if (!b) continue
    const isArea = /^[\u4E00-\u9FFF]{2,4}(?:口|駅)?$/.test(b) &&
      (b.includes('池袋') || b.includes('新宿') || b.includes('渋谷') || b.includes('大塚') ||
       b.includes('上野') || b.includes('錦糸町') || b.includes('五反田') || b.includes('日暮里') ||
       b.includes('新橋') || b.includes('品川') || b.includes('六本木') || b.includes('鶯谷') ||
       b.includes('秋葉原') || b.includes('中野') || b.includes('蒲田') || b.includes('町田') ||
       b.includes('吉祥寺') || b.includes('亀有') || b.includes('小岩') || b.includes('立川'))

    const isGenre = b.includes('ソープ') || b.includes('デリヘル') || b.includes('イメクラ') ||
      b.includes('オナクラ') || b.includes('ピンサロ') || b.includes('箱ヘル') ||
      b.includes('メンエス') || b.includes('エステ')

    const isShop = b.includes('店') || b.includes('クラブ') || b.includes('学園') ||
      b.includes('SPA') || b.includes('娘') || b.includes('会') || b.includes('桃李') ||
      /[A-Za-z]/.test(b) || b.includes('平成') || b.includes('プレイ')

    if (isArea && !area) area = b.replace(/[口駅東西北南]$/, '')
    else if (isShop && !shop) shop = b
    else if (!isGenre && !isArea) {
      if (!name) name = b
      else if (!shop) shop = b
    }
  }

  // Extract main title text (outside brackets)
  const mainText = cleanedTitle.replace(/【.+?】/g, '').trim()

  if (!name) {
    // Try to extract a name from the main text
    const words = mainText.split(/[\s\u3000・]+/).filter(w =>
      w.length >= 2 && w.length <= 12 &&
      /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9FA-Za-z-]+$/.test(w) &&
      !/\d{4}|http|爆サイ/.test(w) &&
      !w.match(/^[\u4E00-\u9FFF]{2,4}[口駅東西南北]?$/) // exclude pure area names
    )
    name = words.find(w =>
      !w.includes('ソープ') && !w.includes('デリヘル') && !w.includes('ヘルス') &&
      !w.includes('ピンサロ') && !w.includes('イメクラ') && !w.includes('オナクラ') &&
      !w.includes('箱ヘル') && !w.includes('エステ') && !w.includes('風俗')
    ) || words[0] || 'Unknown'
  }

  if (!shop) {
    const shopWords = mainText.split(/[\s\u3000・]+/).filter(w =>
      w.length >= 2 && w.length <= 15 &&
      (w.includes('店') || w.includes('クラブ') || w.includes('学園') ||
       w.includes('会') || /[A-Za-z]/.test(w) || w.includes('平成'))
    )
    shop = shopWords[0] || name
  }

  return { name, shop, area, rest: cleanedTitle }
}

async function fetchPage(url: string): Promise<string> {
  console.log(`  GET ${url}`)
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ja',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.text()
}

async function scrapeListPage(url: string, config: ScrapeConfig): Promise<RawExtract[]> {
  const html = await fetchPage(url)
  const $ = cheerio.load(html)
  const results: RawExtract[] = []

  const selectors = config.selectors.listItem.split(',').map(s => s.trim()).filter(Boolean)

  for (const sel of selectors) {
    $(sel).each((_i, el) => {
      const $el = $(el)

      // Extract title using multiple possible selectors
      let title = ''
      for (const nameSel of config.selectors.name.split(',').map(s => s.trim()).filter(Boolean)) {
        title = sanitizeText($el.find(nameSel).text() || $el.text())
        if (title && title.length > 3) break
      }
      if (!title || title.length < 3) return

      // Extract description
      let comment = ''
      for (const descSel of config.selectors.description.split(',').map(s => s.trim()).filter(Boolean)) {
        if (!descSel) continue
        comment = sanitizeText($el.find(descSel).text())
        if (comment) break
      }

      // Extract detail link
      let detailHref = ''
      for (const linkSel of config.selectors.detailLink.split(',').map(s => s.trim()).filter(Boolean)) {
        detailHref = $el.find(linkSel).attr('href') || ''
        if (detailHref) break
      }

      const detailUrl = detailHref
        ? (detailHref.startsWith('http') ? detailHref : new URL(detailHref, url).href)
        : url

      results.push({ name: '', shop: '', area: '', genre: '', title, comment, detailUrl })
    })

    if (results.length > 0) break
  }

  // Deduplicate by title
  const seen = new Set<string>()
  return results.filter(r => {
    if (seen.has(r.title)) return false
    seen.add(r.title)
    return true
  })
}

interface CastOutput {
  id: string
  name: string
  shop: string
  shopId: string
  area: '東京' | '大阪' | '名古屋' | '横浜' | '福岡' | '札幌'
  genre: 'デリバリーヘルス' | 'ソープランド' | 'メンズエステ' | 'イメクラ' | 'オナクラ'
  age: number
  height: number
  style: 'かわいい系' | 'キレイ系' | 'ギャル系' | 'お姉さん系' | '癒し系' | 'ロリ系'
  tags: string[]
  description: string
  shopUrl: string
  rumors: string[]
  accentColor: string
  imageUrl?: string
  isNew: boolean
  isFeatured: boolean
}

function extractToCast(raw: RawExtract, index: number, threadPosts: string[]): CastOutput {
  const parsed = parseTitle(raw.title)
  const fullText = raw.title + ' ' + raw.comment + ' ' + threadPosts.join(' ')
  const area = parsed.area || guessArea(fullText)
  const genre = guessGenre(fullText)
  const style = guessStyle(fullText)

  const idx = String(index + 1).padStart(3, '0')
  const name = parsed.name || `キャスト${idx}`

  return {
    id: `cast-${idx}`,
    name,
    shop: parsed.shop || name,
    shopId: `shop-${String(Math.floor(Math.random() * 8) + 1).padStart(3, '0')}`,
    area: area as CastOutput['area'],
    genre: genre as CastOutput['genre'],
    age: extractAge(fullText),
    height: extractHeight(fullText),
    style: style as CastOutput['style'],
    tags: extractTags(fullText),
    description: raw.comment || sanitizeText(threadPosts.join(' ')).slice(0, 200) || `${name}に関するスレッドです。`,
    shopUrl: raw.detailUrl,
    rumors: threadPosts.slice(0, 10).map(p => sanitizeText(p).slice(0, 100)),
    accentColor: randomColor(),
    imageUrl: `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a0a12`,
    isNew: Math.random() < 0.2,
    isFeatured: Math.random() < 0.15,
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage: npx tsx scripts/scrape.ts <config.json> [--no-thread] [--max-posts N]')
    console.log('')
    console.log('Options:')
    console.log('  --no-thread   Skip scraping thread contents (titles only)')
    console.log('  --max-posts N Max posts to extract per thread (default 5)')
    return
  }

  const configPath = path.resolve(args[0])
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`)
    process.exit(1)
  }

  const skipThreads = args.includes('--no-thread')
  const maxPostsIdx = args.indexOf('--max-posts')
  const maxPosts = maxPostsIdx >= 0 ? Number(args[maxPostsIdx + 1]) || 5 : 5

  const config = loadConfig(configPath)

  console.log(`\n🔎 Scraping: ${config.name} (${config.baseUrl})`)
  console.log(`   Boards: ${config.listPages.length}`)
  console.log(`   Thread scraping: ${skipThreads ? 'skip' : `enabled (max ${maxPosts} posts/thread)`}`)
  console.log('')

  const allRaw: RawExtract[] = []
  const maxPages = config.maxPages ?? 1

  for (const boardPath of config.listPages) {
    const boardUrl = boardPath.startsWith('http') ? boardPath : new URL(boardPath, config.baseUrl).href

    for (let page = 0; page < maxPages; page++) {
      const pageUrl = page === 0 ? boardUrl : `${boardUrl}?page=${page + 1}`
      console.log(`📋 Board: ${boardUrl} (page ${page + 1})`)
      try {
        const items = await scrapeListPage(pageUrl, config)
        console.log(`   → Found ${items.length} threads`)
        allRaw.push(...items)
      } catch (err) {
        console.error(`   ✗ Error: ${(err as Error).message}`)
      }
      await delay(DELAY_MS)
    }
  }

  console.log(`\n📊 Total threads: ${allRaw.length}`)

  const threadPostsMap: Map<string, string[]> = new Map()

  if (!skipThreads && allRaw.length > 0) {
    console.log('\n📄 Fetching thread contents with Puppeteer...')
    console.log('   Launching browser...')

    let count = 0
    let browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    for (let i = 0; i < allRaw.length; i++) {
      const raw = allRaw[i]
      if (!raw.detailUrl || raw.detailUrl.includes('example.com')) continue

      // Restart browser every 15 pages to prevent memory issues
      if (i > 0 && i % 15 === 0) {
        await browser.close()
        await delay(2000)
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        })
      }

      let page: puppeteer.Page | undefined
      try {
        page = await browser.newPage()
        await page.setUserAgent(USER_AGENT)
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
            req.abort()
          } else {
            req.continue()
          }
        })

        await page.goto(raw.detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })

        const posts = await page.evaluate(() => {
          const results: string[] = []
          const selectors = ['div.res_body', 'dd.res_body', 'dd.body']
          for (const sel of selectors) {
            document.querySelectorAll(sel).forEach(el => {
              const text = el.textContent?.replace(/\s+/g, ' ').trim() || ''
              if (text.length > 5 && text.length < 500 &&
                !text.includes('function') && !text.includes('width=')) {
                results.push(text)
              }
            })
            if (results.length > 0) break
          }
          return results
        })

        threadPostsMap.set(raw.title, posts.slice(0, maxPosts))
        count++
        if (count % 3 === 0) console.log(`   → Fetched ${count}/${allRaw.length} (${posts.length} posts)`)

      } catch (err) {
        // skip failed detail pages; restart browser on connection errors
        const msg = (err as Error).message
        if (msg.includes('closed') || msg.includes('Target closed')) {
          try { await browser.close() } catch { /* ignore */ }
          await delay(2000)
          browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          })
        }
      } finally {
        if (page) {
          try { await page.close() } catch { /* ignore */ }
        }
      }
    }

    try { await browser.close() } catch { /* ignore */ }
    console.log(`   → Done. Fetched ${count} thread contents`)
  }

  const output: CastOutput[] = allRaw.map((raw, i) => {
    const posts = threadPostsMap.get(raw.title) || []
    return extractToCast(raw, i, posts)
  }).filter(c => c.name.length > 0 && c.name.length < 15)

  const outDir = path.resolve('src/data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const outPath = path.join(outDir, 'scraped_casts.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`\n✅ Saved ${output.length} casts to ${outPath}`)

  if (output.length > 0) {
    const byArea: Record<string, number> = {}
    const byGenre: Record<string, number> = {}
    for (const c of output) {
      byArea[c.area] = (byArea[c.area] || 0) + 1
      byGenre[c.genre] = (byGenre[c.genre] || 0) + 1
    }

    console.log('\n--- Area ---')
    for (const [k, v] of Object.entries(byArea)) console.log(`  ${k}: ${v}`)
    console.log('--- Genre ---')
    for (const [k, v] of Object.entries(byGenre)) console.log(`  ${k}: ${v}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
