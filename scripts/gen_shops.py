import json
import random
import sys

GENRES = ['デリバリーヘルス','ソープランド','メンズエステ','イメクラ','オナクラ','キャバクラ','ラウンジ','セクシーキャバクラ','コンセプトカフェ']
SEXUAL_GENRES = {'デリバリーヘルス','ソープランド','オナクラ','イメクラ'}
CABARET_GENRES = {'キャバクラ','ラウンジ','セクシーキャバクラ'}

AREA_LOCATIONS = {
    '東京': ['新宿','渋谷','銀座','六本木','池袋','秋葉原','品川','上野','赤坂','神田','恵比寿','浅草','錦糸町','蒲田','中野','吉祥寺','高田馬場','日本橋','新橋','麻布'],
    '大阪': ['心斎橋','梅田','難波','堀江','天王寺','日本橋','新世界','十三','福島','谷町','北新地','天満','京橋','今里','鶴橋','守口','住之江','布施','花園','瑞光'],
    '名古屋': ['栄','伏見','丸の内','名駅','金山','大須','今池','千種','覚王山','本山','植田','藤が丘','矢場町','東別院','浄心','上前津','平和公園','吹上','新栄','鶴舞'],
    '横浜': ['関内','みなとみらい','横浜駅','相鉄','伊勢佐木','磯子','金沢','港南台','桜木町','野毛','中華街','石川町','元町','上大岡','戸塚','保土ヶ谷','鶴見','神奈川','青葉台','都筑'],
    '福岡': ['天神','大名','中州','赤坂','博多','薬院','渡辺通','西新','唐人町','藤崎','姪浜','香椎','箱崎','吉塚','千代','東区','早良','城南','南区','春日'],
    '札幌': ['すすきの','大通','狸小路','円山','北24条','麻生','真駒内','白石','平岸','月寒','豊平','清田','厚別','手稲','西区','北区','中央区','南区','東区','琴似'],
}

NOUNS = {
    'デリバリーヘルス': ['ラブ','スイート','ドリーム','ハート','エンジェル','プリンセス','クイーン','ビーナス','チェリー','ピーチ','ローズ','アリス','ナイト','デラックス','ゴールド','シルバー','ダイヤ','リボン','スター','ムーン'],
    'ソープランド': ['SPA','スパ','レディース','クラブ','ルーム','ハウス','アイランド','オーシャン','スター','ムーン','サン','プレジャー','パラダイス','ゴールデン','プレミアム','ロイヤル','インペリアル','グランド','シルバー','ホワイト'],
    'メンズエステ': ['エステ','リラックス','サロン','スパ','ウェルネス','トリートメント','ヒーリング','グレース','ナチュール','アロマ','ボタニカル','リフレッシュ','コンフォート','プレジャー','デライト','セレニティ','ブリス','ルミナ','オーラ','スーラ'],
    'イメクラ': ['ファンタジー','ワンダー','アクト','シーン','プレイ','マジック','ドリーム','ミスティック','ロール','ステージ','パフォーム','シアター','ミラクル','レジェンド','メモリー','スペクタクル','エンチャント','イリュージョン','マジカル','ヴィジョン'],
    'オナクラ': ['クラブ','パーク','ハウス','ルーム','スタジオ','パレス','ガーデン','ワールド','スフィア','プラザ','ラウンジ','ポイント','ゾーン','ベース','ファクトリー','ラボ','アトリエ','センター','タワー','ヴィラ'],
    'キャバクラ': ['クラブ','ラウンジ','プリンセス','レディ','ガール','クイーン','ダイヤ','ゴールド','シルバー','スター','ルビー','エメラルド','サファイア','パール','クリスタル','トパーズ','オパール','ジェイド','コーラル','アメジスト'],
    'ラウンジ': ['ラウンジ','サロン','クラブ','バー','ルーム','スイート','デラックス','プレミアム','プライベート','リザーブ','エリート','グランド','ロイヤル','インペリアル','エクスクルーシブ','アバンギャルド','アヴァンティ','プラチナ','ダイヤモンド','レガシー'],
    'セクシーキャバクラ': ['ガール','ビーチ','アイランド','パーティ','クラブ','ホット','ワイルド','ヴィーナス','ダンス','ショー','エキサイト','スリル','バーニング','サンダー','ブレイズ','フレイム','ブリッツ','ストーム','クレイジー','フォックス'],
    'コンセプトカフェ': ['カフェ','スペース','ハウス','ルーム','ランド','ワールド','パーク','ファクトリー','ラボ','スタジオ','アトリエ','ギャラリー','ミュージアム','ガーデン','プラネット','ユニバース','コスモス','スター','ムーン','ネビュラ'],
}

DESCS = [
    '丁寧な接客と質の高いサービスが評判。',
    '地元で長年愛される人気店。',
    '清潔感と技術を両立したお店。',
    '幅広いラインナップが自慢。',
    'リピーター多数の実力店。',
    'スタッフの対応が丁寧で安心感あり。',
    '高コスパで話題沸騰中の新店舗。',
    'こだわりのサービスを提供する専門店。',
]

PRICE_RANGES = {
    'デリバリーヘルス': (8000,18000,25000,50000,'60分コース〜'),
    'ソープランド': (25000,40000,60000,100000,'60分コース〜'),
    'メンズエステ': (5000,12000,18000,35000,'60分コース〜'),
    'イメクラ': (6000,10000,20000,30000,'60分コース〜'),
    'オナクラ': (3000,6000,10000,20000,'30分コース〜'),
    'キャバクラ': (4000,7000,20000,40000,'1セット（飲み放題込み）'),
    'ラウンジ': (7000,10000,40000,80000,'1セット（チャージ込み）'),
    'セクシーキャバクラ': (2500,4000,12000,20000,'1セット（飲み放題込み）'),
    'コンセプトカフェ': (500,1500,3000,8000,'入場料＋ドリンク代'),
}

DISCOUNT_CAPS = {
    'デリバリーヘルス': 5000,
    'ソープランド': 8000,
    'メンズエステ': 3000,
    'イメクラ': 3000,
    'オナクラ': 2000,
    'コンセプトカフェ': 500,
}

GENRE_TAGS = {
    'デリバリーヘルス': ['出張対応','エリア広い','即日対応','24時間'],
    'ソープランド': ['高級感','設備充実','完全個室'],
    'メンズエステ': ['技術派','リラックス重視','ホテルクオリティ'],
    'イメクラ': ['コスプレ豊富','設定こだわり','没入感'],
    'オナクラ': ['シンプル','コスパ抜群','短時間OK'],
    'キャバクラ': ['会話上手','美女揃い','お酒充実'],
    'ラウンジ': ['VIP対応','接待OK','大人向け'],
    'セクシーキャバクラ': ['ボディタッチ','過激系','賑やか'],
    'コンセプトカフェ': ['推し活','アイドル系','オタク向け'],
}

BASE_TAGS = ['接客丁寧','清潔感','リピーター多め','初心者向け','キャスト多め','予約しやすい','雰囲気良し','コスパ良し']

def gen_tags(g):
    pool = BASE_TAGS + GENRE_TAGS.get(g, [])
    return random.sample(pool, 3)

def gen_price(g):
    a, b, c, d, u = PRICE_RANGES[g]
    return {'min': random.randint(a,b), 'max': random.randint(c,d), 'unit': u}

def max_discount_for(g, min_price):
    genre_cap = DISCOUNT_CAPS.get(g, 0)
    price_cap = min_price - 500
    ratio_cap = int((min_price * 0.4) // 500) * 500
    return max(0, min(genre_cap, price_cap, ratio_cap))

def gen_morning(g, price):
    if g in CABARET_GENRES:
        return {'available': False}
    if random.random() < 0.4:
        max_disc = max_discount_for(g, price['min'])
        if max_disc < 500:
            return {'available': False}
        h = random.randint(9, 12)
        disc = random.randint(1, max_disc // 500) * 500
        return {'available': True, 'hours': f'{h}:00〜{random.randint(13,16)}:00', 'discount': f'朝割{disc}円OFF'}
    return {'available': False}

def gen_options(g):
    if g in SEXUAL_GENRES:
        ns = random.choice([True, False])
        nn = random.choice([True, False]) if ns else False
        pool = ['本番','AF','69','ディープキス','素股','フェラ','手コキ','3P','コスプレ','電マ']
        return {'ns': ns, 'nn': nn, 'extras': random.sample(pool, random.randint(3,5))}
    if g == 'メンズエステ':
        pool = ['手技マッサージ','オイルエステ','リンパドレナージュ','アロマテラピー','フットケア','ヘッドスパ','ホットストーン','フェイシャル']
        return {'ns': None, 'nn': None, 'extras': random.sample(pool, 2)}
    if g in CABARET_GENRES:
        pool = ['同伴OK','VIPルームあり','誕生日演出','シャンパン','完全個室','貸切対応','ダーツ']
        return {'ns': None, 'nn': None, 'extras': random.sample(pool, 2)}
    pool = ['チェキ撮影','コスプレ','グッズ販売','推し活対応','イベント開催','握手会']
    return {'ns': None, 'nn': None, 'extras': random.sample(pool, 2)}

def main():
    if '--synthetic' not in sys.argv:
        raise SystemExit(
            'This script generates synthetic shops and is disabled by default. '
            'Use --synthetic only for local UI testing, never for production data.'
        )

    with open('src/data/shops.json', 'r', encoding='utf-8') as f:
        shops = json.load(f)

    random.seed(42)
    next_id = max(int(s['id'].split('-')[1]) for s in shops) + 1
    existing = {s['name'] for s in shops}
    TARGET = 100

    for area, locs in AREA_LOCATIONS.items():
        current = len([s for s in shops if s['area'] == area])
        need = TARGET - current
        for _ in range(need):
            genre = random.choice(GENRES)
            name = None
            for _ in range(100):
                loc = random.choice(locs)
                noun = random.choice(NOUNS[genre])
                candidate = f'{loc}{noun}{random.randint(1,99)}'
                if candidate not in existing:
                    name = candidate
                    break
            if name is None:
                name = f'{area}店舗{next_id}'
            existing.add(name)
            price = gen_price(genre)
            shops.append({
                'id': f'shop-{next_id:03d}',
                'name': name,
                'area': area,
                'genre': genre,
                'url': 'https://example.com',
                'description': f'{area}{loc}エリアの{genre}。{random.choice(DESCS)}',
                'tags': gen_tags(genre),
                'price': price,
                'hours': f'{random.randint(9,12)}:00〜翌{random.randint(0,5)}:00',
                'reservation': random.sample(['電話','LINE','Web予約','Twitter DM'], random.randint(2,3)),
                'morning': gen_morning(genre, price),
                'options': gen_options(genre),
                'castCount': f'在籍{random.randint(8,60)}名以上',
            })
            next_id += 1

    with open('src/data/shops.json', 'w', encoding='utf-8') as f:
        json.dump(shops, f, ensure_ascii=False, indent=2)

    print(f'Total: {len(shops)}店舗')
    for area in ['東京','大阪','名古屋','横浜','福岡','札幌']:
        c = len([s for s in shops if s['area'] == area])
        print(f'  {area}: {c}店')

if __name__ == '__main__':
    main()
