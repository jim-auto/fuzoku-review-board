import json
import random

NAMES = [
    'Yuna', 'Rei', 'Moka', 'Saki', 'Hina', 'Nana', 'Rin', 'Aoi', 'Miu', 'Sara',
    'Mei', 'Noa', 'Ema', 'Ruka', 'Miku', 'Towa', 'Yurika', 'Akari', 'Rio', 'Mao',
    'Kanon', 'Mirei', 'Shiori', 'Koharu', 'Ichika', 'Risa', 'Airi', 'Natsuki',
    'Mizuki', 'Karen', 'Rena', 'Yui', 'Mina', 'Haruka', 'Ayaka', 'Suzu',
]

STYLES = ['かわいい系', 'キレイ系', 'ギャル系', 'お姉さん系', '癒し系', 'ロリ系']

STYLE_TAGS = {
    'かわいい系': ['笑顔が印象的', '親しみやすい', '明るい', '初心者向け'],
    'キレイ系': ['清楚系', 'スレンダー', '上品', '落ち着いた雰囲気'],
    'ギャル系': ['明るい', '盛り上がり上手', 'ノリが良い', '会話上手'],
    'お姉さん系': ['包容力', '経験豊富', '落ち着いた雰囲気', '接客丁寧'],
    '癒し系': ['穏やか', '癒し系', '聞き上手', 'リラックス重視'],
    'ロリ系': ['小柄', 'フレッシュ', '素人感', 'かわいい系'],
}

GENRE_TAGS = {
    'デリバリーヘルス': ['会話重視', '指名率高め', 'リピーター多め'],
    'ソープランド': ['高級感', '接客丁寧', 'リピーター多め'],
    'メンズエステ': ['技術派', '癒し系', 'リラックス重視'],
    'イメクラ': ['コスプレ向き', '演技派', '盛り上がり上手'],
    'オナクラ': ['短時間OK', '初心者向け', '清潔感'],
    'キャバクラ': ['会話上手', 'お酒好き', '盛り上がり上手'],
    'ラウンジ': ['落ち着いた雰囲気', '上品', '聞き上手'],
    'セクシーキャバクラ': ['明るい', 'ノリが良い', '盛り上がり上手'],
    'コンセプトカフェ': ['推し活向き', 'キャラ立ち', 'イベント好き'],
}

ACCENT_COLORS = ['#ff2d78', '#00d4ff', '#b44fff', '#00ff9f', '#ffaa00', '#4488ff']

BACKGROUND_BY_STYLE = {
    'かわいい系': '1a0a12',
    'キレイ系': '0a1020',
    'ギャル系': '1a1208',
    'お姉さん系': '140a1a',
    '癒し系': '0a1a14',
    'ロリ系': '160a16',
}

def cast_description(style, genre):
    style_phrase = {
        'かわいい系': '親しみやすい笑顔と明るい雰囲気が魅力',
        'キレイ系': '落ち着いた空気感と上品な対応が魅力',
        'ギャル系': '明るいノリと会話のテンポが魅力',
        'お姉さん系': '包容力のある接客と安心感が魅力',
        '癒し系': '穏やかな雰囲気と丁寧な対応が魅力',
        'ロリ系': '小柄でフレッシュな雰囲気が魅力',
    }[style]
    return f'{style_phrase}のキャスト。{genre}らしいサービスの流れを大切にし、初めてでも過ごしやすい時間を意識しています。'

def cast_rumors(style, tags):
    primary = tags[:3]
    rumors = [f'{tag}という声あり' for tag in primary]
    rumors.append(f'{style}が好きなユーザーに人気という傾向')
    return rumors

def normalize_existing(casts, shop_by_id):
    for cast in casts:
        shop = shop_by_id.get(cast.get('shopId'))
        if not shop:
            continue
        cast['shop'] = shop['name']
        cast['area'] = shop['area']
        cast['genre'] = shop['genre']
        cast['shopUrl'] = shop['url']

def make_cast(next_id, shop, serial):
    style = random.choice(STYLES)
    name = f"{random.choice(NAMES)} {serial}"
    tags = []
    for tag in random.sample(STYLE_TAGS[style], 3) + random.sample(GENRE_TAGS.get(shop['genre'], []), 2):
        if tag not in tags:
            tags.append(tag)
    seed = f"{shop['id']}-{serial}-{name}".replace(' ', '-')
    return {
        'id': f'cast-{next_id:04d}',
        'name': name,
        'shop': shop['name'],
        'shopId': shop['id'],
        'area': shop['area'],
        'genre': shop['genre'],
        'age': random.randint(19, 31),
        'height': random.randint(150, 168),
        'style': style,
        'tags': tags,
        'description': cast_description(style, shop['genre']),
        'shopUrl': shop['url'],
        'rumors': cast_rumors(style, tags),
        'accentColor': random.choice(ACCENT_COLORS),
        'imageUrl': f"https://api.dicebear.com/9.x/avataaars/svg?seed={seed}&backgroundColor={BACKGROUND_BY_STYLE[style]}",
        'isNew': False,
        'isFeatured': False,
    }

def main():
    random.seed(84)
    with open('src/data/shops.json', 'r', encoding='utf-8') as f:
        shops = json.load(f)
    with open('src/data/casts.json', 'r', encoding='utf-8') as f:
        casts = json.load(f)

    shop_by_id = {shop['id']: shop for shop in shops}
    normalize_existing(casts, shop_by_id)

    next_id = max(int(cast['id'].split('-')[1]) for cast in casts) + 1
    counts = {}
    for cast in casts:
        counts[cast['shopId']] = counts.get(cast['shopId'], 0) + 1

    added = 0
    for shop in shops:
        current = counts.get(shop['id'], 0)
        needed = max(0, 2 - current)
        for index in range(needed):
            casts.append(make_cast(next_id, shop, current + index + 1))
            next_id += 1
            added += 1

    with open('src/data/casts.json', 'w', encoding='utf-8') as f:
        json.dump(casts, f, ensure_ascii=False, indent=2)
        f.write('\n')

    covered = len({cast['shopId'] for cast in casts})
    print(f'Total casts: {len(casts)}')
    print(f'Added casts: {added}')
    print(f'Shops covered: {covered}/{len(shops)}')

if __name__ == '__main__':
    main()
