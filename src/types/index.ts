export type Area = '東京' | '大阪' | '名古屋' | '横浜' | '福岡' | '札幌'
export type Genre = 'デリバリーヘルス' | 'ソープランド' | 'メンズエステ' | 'イメクラ' | 'オナクラ'
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
  isNew?: boolean
  isFeatured?: boolean
}

export interface Shop {
  id: string
  name: string
  area: Area
  genre: Genre
  url: string
  description: string
  tags: string[]
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
