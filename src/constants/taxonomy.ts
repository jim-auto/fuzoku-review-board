export const AREA_NAMES = ['東京', '大阪', '名古屋', '岐阜', '横浜', '福岡', '札幌'] as const

export const AREA_COLORS = {
  '東京': '#00d4ff',
  '大阪': '#ff2d78',
  '名古屋': '#b44fff',
  '岐阜': '#66dd88',
  '横浜': '#ffaa00',
  '福岡': '#00ff9f',
  '札幌': '#4488ff',
} as const

export const GENRES = [
  { name: 'デリバリーヘルス', short: 'DH', color: '#ff2d78', desc: '出張・宅配型' },
  { name: 'ソープランド', short: 'SP', color: '#b44fff', desc: '高級浴場型' },
  { name: 'メンズエステ', short: 'ES', color: '#00ff9f', desc: '施術・癒し系' },
  { name: 'イメクラ', short: 'IM', color: '#ffaa00', desc: 'コンセプト型' },
  { name: 'オナクラ', short: 'OK', color: '#00d4ff', desc: 'シンプル型' },
  { name: 'キャバクラ', short: 'KY', color: '#f0c040', desc: 'お酒・会話型' },
  { name: 'ラウンジ', short: 'LG', color: '#9966ff', desc: '高級ラウンジ型' },
  { name: 'セクシーキャバクラ', short: 'SK', color: '#ff4499', desc: 'セクキャバ型' },
  { name: 'コンセプトカフェ', short: 'CC', color: '#00ccaa', desc: 'コンカフェ型' },
] as const

export const GENRE_NAMES = GENRES.map(genre => genre.name)

export const GENRE_COLORS = Object.fromEntries(
  GENRES.map(genre => [genre.name, genre.color]),
) as Record<(typeof GENRES)[number]['name'], string>

export const GENRE_SHORT = Object.fromEntries(
  GENRES.map(genre => [genre.name, genre.short]),
) as Record<(typeof GENRES)[number]['name'], string>

export const GENRE_DESC = {
  'デリバリーヘルス': '出張・宅配型サービス',
  'ソープランド': '高級浴場型サービス',
  'メンズエステ': '施術・癒し系サービス',
  'イメクラ': 'コンセプト・設定型サービス',
  'オナクラ': 'シンプル型サービス',
  'キャバクラ': 'お酒と会話を楽しむ接客サービス',
  'ラウンジ': '高級感あふれる大人の社交場',
  'セクシーキャバクラ': 'セクシーな演出のあるキャバクラ',
  'コンセプトカフェ': 'キャラクターや世界観を楽しむカフェ',
} as const
