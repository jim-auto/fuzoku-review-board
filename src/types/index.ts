export type Area = '東京' | '大阪' | '名古屋' | '横浜' | '福岡' | '札幌'
export type Genre = 'デリバリーヘルス' | 'ソープランド' | 'メンズエステ' | 'イメクラ' | 'オナクラ' | 'キャバクラ' | 'ラウンジ' | 'セクシーキャバクラ' | 'コンセプトカフェ'
export type Style = 'かわいい系' | 'キレイ系' | 'ギャル系' | 'お姉さん系' | '癒し系' | 'ロリ系'

export interface Cast {
  id: string
  name: string
  shop: string
  shopId: string
  area: Area
  genre: Genre
  age: number
  height: number
  style: Style
  tags: string[]
  description: string
  shopUrl: string
  rumors: string[]
  accentColor: string
  imageUrl?: string
  isNew?: boolean
  isFeatured?: boolean
}

export interface ShopPrice {
  min: number
  max: number
  unit: string
}

export interface ShopMorning {
  available: boolean
  hours?: string
  discount?: string
}

export interface ShopOptions {
  ns: boolean | null
  nn: boolean | null
  extras: string[]
}

export interface Shop {
  id: string
  name: string
  area: Area
  genre: Genre
  url: string
  source?: {
    label: string
    url: string
    checkedAt: string
  }
  address?: string
  phone?: string
  description: string
  tags: string[]
  price: ShopPrice
  hours: string
  reservation: string[]
  morning: ShopMorning
  options: ShopOptions
  castCount: string
}

export interface FilterState {
  area: string
  genre: string
  style: string
  tags: string[]
  search: string
  ageMin: string
  ageMax: string
}
